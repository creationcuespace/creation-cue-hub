import os
import sys
import json
import time
import subprocess
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

PORT = 37380
RECORDING_PROCESS = None
CURRENT_RECORDING = {
    "active": False,
    "device_id": None,
    "remote_file": None,
    "local_file": None,
    "start_time": None
}

# Auto-detect ADB executable
POSSIBLE_ADB_PATHS = [
    r"C:\Users\smash\.dronehacks\platform-tools\adb.exe",
    r"C:\Users\smash\Desktop\Mega\WATCHFACESTUDIO\platform-tools\adb.exe",
    r"C:\Users\User\Mega\WATCHFACESTUDIO\platform-tools\adb.exe",
    r"C:\Users\solio\Documents\MEGAsync\MEGAsync\WATCHFACESTUDIO\platform-tools\adb.exe",
    "adb"
]

def find_adb():
    for path in POSSIBLE_ADB_PATHS:
        try:
            res = subprocess.run([path, "version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=3)
            if res.returncode == 0:
                return path
        except Exception:
            continue
    return "adb"

ADB_PATH = find_adb()
TEMP_DIR = os.path.join(os.path.expanduser("~"), "WatchRecordings")
os.makedirs(TEMP_DIR, exist_ok=True)

class ADBBridgeHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, data, code=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/status":
            devices = self.get_adb_devices()
            self._send_json({
                "bridge_running": True,
                "adb_path": ADB_PATH,
                "recordings_dir": TEMP_DIR,
                "devices": devices,
                "recording": CURRENT_RECORDING
            })
        elif path.startswith("/api/download/"):
            filename = os.path.basename(path.replace("/api/download/", ""))
            file_path = os.path.join(TEMP_DIR, filename)
            if os.path.exists(file_path):
                self.send_response(200)
                self.send_header("Content-Type", "video/mp4")
                self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
                self.send_header("Content-Length", str(os.path.getsize(file_path)))
                self._send_cors_headers()
                self.end_headers()
                with open(file_path, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self._send_json({"error": "File not found"}, 404)
        else:
            self._send_json({"error": "Unknown endpoint"}, 404)

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            data = json.loads(body_bytes.decode("utf-8"))
        except Exception:
            data = {}

        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/pair":
            target = data.get("target", "").strip()
            code = data.get("code", "").strip()
            if not target or not code:
                return self._send_json({"error": "Missing IP/Port target or pairing code"}, 400)
            res = subprocess.run([ADB_PATH, "pair", target, code], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            output = (res.stdout + res.stderr).strip()
            paired = "successfully paired" in output.lower() or "paired to" in output.lower()
            return self._send_json({"success": paired, "output": output})

        elif path == "/api/connect":
            target = data.get("target", "").strip()
            if not target:
                return self._send_json({"error": "Missing IP/Address target"}, 400)
            res = subprocess.run([ADB_PATH, "connect", target], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            output = res.stdout + res.stderr
            connected = "connected to" in output.lower() or "already connected" in output.lower()
            return self._send_json({"success": connected, "output": output.strip()})

        elif path == "/api/disconnect":
            target = data.get("target", "").strip()
            if target:
                res = subprocess.run([ADB_PATH, "disconnect", target], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            else:
                res = subprocess.run([ADB_PATH, "disconnect"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            return self._send_json({"success": True, "output": (res.stdout + res.stderr).strip()})

        elif path == "/api/record/start":
            global RECORDING_PROCESS, CURRENT_RECORDING
            if CURRENT_RECORDING["active"]:
                return self._send_json({"error": "Recording already active"}, 400)

            device_id = data.get("device_id", "").strip()
            if not device_id:
                # pick first connected device if available
                devs = self.get_adb_devices()
                if devs:
                    device_id = devs[0]["id"]
                else:
                    return self._send_json({"error": "No watch connected"}, 400)

            timestamp = time.strftime("%Y%m%d_%H%M%S")
            filename = data.get("filename", f"watch_{timestamp}.mp4")
            if not filename.endswith(".mp4"):
                filename += ".mp4"

            remote_path = f"/sdcard/{filename}"
            local_path = os.path.join(TEMP_DIR, filename)

            cmd = [ADB_PATH]
            if device_id:
                cmd.extend(["-s", device_id])
            cmd.extend(["shell", "screenrecord", remote_path])

            try:
                RECORDING_PROCESS = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                CURRENT_RECORDING = {
                    "active": True,
                    "device_id": device_id,
                    "remote_file": remote_path,
                    "local_file": local_path,
                    "filename": filename,
                    "start_time": time.time()
                }
                return self._send_json({"success": True, "recording": CURRENT_RECORDING})
            except Exception as e:
                return self._send_json({"error": str(e)}, 500)

        elif path == "/api/record/stop":
            if not CURRENT_RECORDING["active"]:
                return self._send_json({"error": "No active recording"}, 400)

            device_id = CURRENT_RECORDING["device_id"]
            remote_file = CURRENT_RECORDING["remote_file"]
            local_file = CURRENT_RECORDING["local_file"]
            filename = CURRENT_RECORDING["filename"]

            # Stop screenrecord on device gracefully using pkill
            cmd_kill = [ADB_PATH]
            if device_id:
                cmd_kill.extend(["-s", device_id])
            cmd_kill.extend(["shell", "pkill", "-2", "screenrecord"])
            subprocess.run(cmd_kill, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            if RECORDING_PROCESS:
                try:
                    RECORDING_PROCESS.terminate()
                except Exception:
                    pass

            time.sleep(1.5) # Wait for file write completion on device

            # Pull recorded file to local machine
            cmd_pull = [ADB_PATH]
            if device_id:
                cmd_pull.extend(["-s", device_id])
            cmd_pull.extend(["pull", remote_file, local_file])
            res_pull = subprocess.run(cmd_pull, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

            # Cleanup file from watch /sdcard
            cmd_rm = [ADB_PATH]
            if device_id:
                cmd_rm.extend(["-s", device_id])
            cmd_rm.extend(["shell", "rm", remote_file])
            subprocess.run(cmd_rm, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            CURRENT_RECORDING = {
                "active": False,
                "device_id": None,
                "remote_file": None,
                "local_file": None,
                "filename": None,
                "start_time": None
            }

            file_exists = os.path.exists(local_file) and os.path.getsize(local_file) > 0
            return self._send_json({
                "success": file_exists,
                "filename": filename,
                "download_url": f"http://localhost:{PORT}/api/download/{filename}",
                "local_path": local_file,
                "output": res_pull.stdout + res_pull.stderr
            })

        elif path == "/api/open-folder":
            try:
                os.startfile(TEMP_DIR)
                return self._send_json({"success": True})
            except Exception as e:
                return self._send_json({"error": str(e)}, 500)

        else:
            return self._send_json({"error": "Endpoint not found"}, 404)

    def get_adb_devices(self):
        try:
            res = subprocess.run([ADB_PATH, "devices", "-l"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=3)
            lines = res.stdout.strip().split("\n")[1:]
            devices = []
            for line in lines:
                line = line.strip()
                if not line or "offline" in line or "unauthorized" in line:
                    continue
                parts = line.split()
                if len(parts) >= 2 and parts[1] == "device":
                    dev_id = parts[0]
                    model = "Smartwatch"
                    for p in parts[2:]:
                        if p.startswith("model:"):
                            model = p.split(":")[1].replace("_", " ")
                        elif p.startswith("device:"):
                            if model == "Smartwatch":
                                model = p.split(":")[1].replace("_", " ")
                    devices.append({"id": dev_id, "model": model, "status": "online"})
            return devices
        except Exception:
            return []

    def log_message(self, format, *args):
        # Suppress noisy HTTP request logging
        return

def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, ADBBridgeHandler)
    print(f"=== Creation Cue Watch ADB Bridge running on http://localhost:{PORT} ===")
    print(f"ADB Executable: {ADB_PATH}")
    print(f"Recordings Directory: {TEMP_DIR}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Stopping bridge server...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
