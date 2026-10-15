import os
import sys
import json
import time
import subprocess
try:
    from http.server import ThreadingHTTPServer as ServerClass
except ImportError:
    from http.server import HTTPServer as ServerClass
from http.server import BaseHTTPRequestHandler
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
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "adb.exe"),
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

def get_downloads_dir():
    try:
        import winreg
        sub_key = r"Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders"
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, sub_key) as key:
            val, _ = winreg.QueryValueEx(key, "{374DE290-123F-4565-9164-39C4925E467B}")
            val = os.path.expandvars(val)
            if os.path.exists(val):
                return val
    except Exception:
        pass
    if os.path.exists(r"D:\DOWNLOADs"):
        return r"D:\DOWNLOADs"
    return os.path.join(os.path.expanduser("~"), "Downloads")

TEMP_DIR = get_downloads_dir()
os.makedirs(TEMP_DIR, exist_ok=True)

class ADBBridgeHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Request-Private-Network, *")
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def _send_json(self, data, code=200):
        try:
            body = json.dumps(data).encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(body)
        except Exception:
            pass

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path in ["/", "/watch-recorder", "/watch-recorder.html"]:
            local_html = os.path.join(os.path.dirname(os.path.abspath(__file__)), "watch-recorder.html")
            if os.path.exists(local_html):
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self._send_cors_headers()
                self.end_headers()
                with open(local_html, "rb") as f:
                    self.wfile.write(f.read())
                return

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
            
            # Send pairing code via STDIN (required by standard adb pair)
            try:
                p = subprocess.Popen([ADB_PATH, "pair", target], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                out, err = p.communicate(input=f"{code}\n", timeout=12)
                output = (out + err).strip()
            except Exception as e:
                output = str(e)
            
            # Fallback for adb versions accepting positional arguments
            if "usage: adb pair" in output.lower():
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

            # Step 1: Find PIDs of screenrecord on the watch
            cmd_pid = [ADB_PATH]
            if device_id:
                cmd_pid.extend(["-s", device_id])
            cmd_pid.extend(["shell", "pidof", "screenrecord"])
            res_pid = subprocess.run(cmd_pid, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            pids = res_pid.stdout.strip().split()

            # Step 2: Send SIGINT (kill -2) to screenrecord PID on watch
            for pid in pids:
                if pid.isdigit():
                    cmd_kill = [ADB_PATH]
                    if device_id:
                        cmd_kill.extend(["-s", device_id])
                    cmd_kill.extend(["shell", "kill", "-2", pid])
                    subprocess.run(cmd_kill, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            # Step 3: Wait gracefully for screenrecord process & local adb to flush moov atom
            if RECORDING_PROCESS:
                try:
                    RECORDING_PROCESS.wait(timeout=6)
                except Exception:
                    try:
                        RECORDING_PROCESS.terminate()
                    except Exception:
                        pass

            time.sleep(1.0)

            # Step 4: Pull recorded MP4 file
            cmd_pull = [ADB_PATH]
            if device_id:
                cmd_pull.extend(["-s", device_id])
            cmd_pull.extend(["pull", remote_file, local_file])
            res_pull = subprocess.run(cmd_pull, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

            # Step 5: Clean up file on watch
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
            res = subprocess.run([ADB_PATH, "devices", "-l"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=4)
            lines = res.stdout.strip().split("\n")[1:]
            devices = []
            for line in lines:
                line = line.strip()
                if not line or "offline" in line:
                    continue
                parts = line.split()
                if len(parts) >= 2:
                    dev_id = parts[0]
                    state = parts[1]

                    if state == "unauthorized":
                        devices.append({"id": dev_id, "model": "Watch (Tap 'Allow' on screen)", "status": "unauthorized"})
                        continue

                    if state == "device":
                        # Only prune if connection socket is explicitly closed (e.g. Wireless Debugging toggled off)
                        try:
                            ping_res = subprocess.run([ADB_PATH, "-s", dev_id, "shell", "echo", "1"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=3.5)
                            if "closed" in ping_res.stderr.lower():
                                subprocess.run([ADB_PATH, "disconnect", dev_id], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                                continue
                        except Exception:
                            # Don't disconnect on transient Wi-Fi latency
                            pass

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
    httpd = ServerClass(server_address, ADBBridgeHandler)
    print(f"=== Creation Cue Watch ADB Bridge running on http://127.0.0.1:{PORT} ===")
    print(f"ADB Executable: {ADB_PATH}")
    print(f"Recordings Directory: {TEMP_DIR}")
    while True:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("Stopping bridge server...")
            httpd.server_close()
            break
        except Exception:
            time.sleep(0.5)

if __name__ == '__main__':
    run_server()
