import os
import sys
import json
import time
import subprocess
import threading
import webbrowser
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

if getattr(sys, 'frozen', False):
    BUNDLE_DIR = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
    EXE_DIR = os.path.dirname(sys.executable)
else:
    BUNDLE_DIR = os.path.dirname(os.path.abspath(__file__))
    EXE_DIR = BUNDLE_DIR

# Auto-detect ADB executable
POSSIBLE_ADB_PATHS = [
    os.path.join(BUNDLE_DIR, "adb.exe"),
    os.path.join(BUNDLE_DIR, "bin_adb", "adb.exe"),
    os.path.join(EXE_DIR, "adb.exe"),
    os.path.join(EXE_DIR, "bin_adb", "adb.exe"),
    r"C:\Users\smash\.dronehacks\platform-tools\adb.exe",
    r"C:\Users\smash\Desktop\Mega\WATCHFACESTUDIO\platform-tools\adb.exe",
    r"C:\Users\User\Mega\WATCHFACESTUDIO\platform-tools\adb.exe",
    r"C:\Users\solio\Documents\MEGAsync\MEGAsync\WATCHFACESTUDIO\platform-tools\adb.exe",
    "adb"
]

def _win32_no_window_kwargs(kwargs):
    if sys.platform == "win32":
        if "creationflags" not in kwargs:
            kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW
        if "startupinfo" not in kwargs:
            si = subprocess.STARTUPINFO()
            si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            si.wShowWindow = 0
            kwargs["startupinfo"] = si
    return kwargs

def run_cmd(cmd, **kwargs):
    return subprocess.run(cmd, **_win32_no_window_kwargs(kwargs))

def popen_cmd(cmd, **kwargs):
    return subprocess.Popen(cmd, **_win32_no_window_kwargs(kwargs))

def find_adb():
    for path in POSSIBLE_ADB_PATHS:
        try:
            res = run_cmd([path, "version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=3)
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
            local_html = os.path.join(BUNDLE_DIR, "watch-recorder.html")
            if not os.path.exists(local_html):
                local_html = os.path.join(EXE_DIR, "watch-recorder.html")
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
                ext = os.path.splitext(filename)[1].lower()
                content_types = {
                    ".mp4": "video/mp4",
                    ".png": "image/png",
                    ".jpg": "image/jpeg",
                    ".jpeg": "image/jpeg",
                    ".apk": "application/vnd.android.package-archive"
                }
                c_type = content_types.get(ext, "application/octet-stream")
                query = parsed.query or ""
                disposition = "inline" if ("inline=1" in query or ext in [".png", ".jpg", ".jpeg"]) else "attachment"
                self.send_response(200)
                self.send_header("Content-Type", c_type)
                self.send_header("Content-Disposition", f'{disposition}; filename="{filename}"')
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
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/install":
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length <= 0:
                return self._send_json({"error": "No file uploaded"}, 400)

            raw_filename = self.headers.get("X-Filename", "upload.apk")
            from urllib.parse import unquote
            safe_filename = os.path.basename(unquote(raw_filename))
            device_id = self.headers.get("X-Device-Id", "").strip()
            if not device_id:
                devs = self.get_adb_devices()
                if devs:
                    device_id = devs[0]["id"]
                else:
                    return self._send_json({"error": "No watch connected"}, 400)

            temp_dest = os.path.join(TEMP_DIR, f"temp_{int(time.time())}_{safe_filename}")
            try:
                with open(temp_dest, "wb") as f:
                    remaining = content_length
                    while remaining > 0:
                        chunk = self.rfile.read(min(remaining, 65536))
                        if not chunk:
                            break
                        f.write(chunk)
                        remaining -= len(chunk)

                lower_name = safe_filename.lower()
                if lower_name.endswith(".apk"):
                    cmd = [ADB_PATH, "-s", device_id, "install", "-r", temp_dest]
                    res = run_cmd(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=120)
                    out = (res.stdout + res.stderr).strip()
                    success = "success" in out.lower()
                else:
                    cmd = [ADB_PATH, "-s", device_id, "push", temp_dest, f"/sdcard/Download/{safe_filename}"]
                    res = run_cmd(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60)
                    out = (res.stdout + res.stderr).strip()
                    success = res.returncode == 0

                try:
                    if os.path.exists(temp_dest):
                        os.remove(temp_dest)
                except Exception:
                    pass

                return self._send_json({"success": success, "output": out, "filename": safe_filename})
            except Exception as e:
                return self._send_json({"error": str(e)}, 500)

        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            data = json.loads(body_bytes.decode("utf-8"))
        except Exception:
            data = {}

        if path == "/api/pair":
            target = data.get("target", "").strip()
            code = data.get("code", "").strip()
            if not target or not code:
                return self._send_json({"error": "Missing IP/Port target or pairing code"}, 400)
            
            # Send pairing code via STDIN (required by standard adb pair)
            try:
                p = popen_cmd([ADB_PATH, "pair", target], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                out, err = p.communicate(input=f"{code}\n", timeout=12)
                output = (out + err).strip()
            except Exception as e:
                output = str(e)
            
            # Fallback for adb versions accepting positional arguments
            if "usage: adb pair" in output.lower():
                res = run_cmd([ADB_PATH, "pair", target, code], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                output = (res.stdout + res.stderr).strip()

            paired = "successfully paired" in output.lower() or "paired to" in output.lower()
            return self._send_json({"success": paired, "output": output})

        elif path == "/api/connect":
            target = data.get("target", "").strip()
            if not target:
                return self._send_json({"error": "Missing IP/Address target"}, 400)
            res = run_cmd([ADB_PATH, "connect", target], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            output = res.stdout + res.stderr
            connected = "connected to" in output.lower() or "already connected" in output.lower()
            return self._send_json({"success": connected, "output": output.strip()})

        elif path == "/api/disconnect":
            target = data.get("target", "").strip()
            if target:
                res = run_cmd([ADB_PATH, "disconnect", target], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            else:
                res = run_cmd([ADB_PATH, "disconnect"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
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

            bitrate = data.get("bitrate")
            size = data.get("size")
            time_limit = data.get("time_limit")

            cmd = [ADB_PATH]
            if device_id:
                cmd.extend(["-s", device_id])
            cmd.extend(["shell", "screenrecord"])

            if bitrate and str(bitrate).isdigit() and int(bitrate) > 0:
                cmd.extend(["--bit-rate", str(bitrate)])
            if size and "x" in str(size):
                cmd.extend(["--size", str(size)])
            if time_limit and str(time_limit).isdigit() and int(time_limit) > 0:
                cmd.extend(["--time-limit", str(time_limit)])

            cmd.append(remote_path)

            try:
                RECORDING_PROCESS = popen_cmd(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
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

        elif path == "/api/screenshot":
            device_id = data.get("device_id", "").strip()
            if not device_id:
                devs = self.get_adb_devices()
                if devs:
                    device_id = devs[0]["id"]
                else:
                    return self._send_json({"error": "No watch connected"}, 400)

            timestamp = time.strftime("%Y%m%d_%H%M%S")
            filename = f"watch_screenshot_{timestamp}.png"
            remote_path = f"/sdcard/{filename}"
            local_path = os.path.join(TEMP_DIR, filename)

            # 1. Take screenshot on watch
            cmd_shot = [ADB_PATH]
            if device_id:
                cmd_shot.extend(["-s", device_id])
            cmd_shot.extend(["shell", "screencap", "-p", remote_path])
            res_shot = run_cmd(cmd_shot, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=12)

            # 2. Pull screenshot to local folder
            cmd_pull = [ADB_PATH]
            if device_id:
                cmd_pull.extend(["-s", device_id])
            cmd_pull.extend(["pull", remote_path, local_path])
            res_pull = run_cmd(cmd_pull, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=12)

            # 3. Clean up on watch
            cmd_rm = [ADB_PATH]
            if device_id:
                cmd_rm.extend(["-s", device_id])
            cmd_rm.extend(["shell", "rm", remote_path])
            run_cmd(cmd_rm, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            success = os.path.exists(local_path) and os.path.getsize(local_path) > 0
            return self._send_json({
                "success": success,
                "filename": filename,
                "download_url": f"http://localhost:{PORT}/api/download/{filename}",
                "local_path": local_path,
                "output": (res_shot.stderr + res_pull.stderr).strip()
            })

        elif path == "/api/file/delete":
            filename = os.path.basename(data.get("filename", "").strip())
            if not filename:
                return self._send_json({"error": "Missing filename"}, 400)
            file_path = os.path.join(TEMP_DIR, filename)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    return self._send_json({"success": True})
                except Exception as e:
                    return self._send_json({"error": str(e)}, 500)
            return self._send_json({"error": "File not found"}, 404)

        elif path == "/api/file/rename":
            old_name = os.path.basename(data.get("old_name", "").strip())
            new_name = os.path.basename(data.get("new_name", "").strip())
            if not old_name or not new_name:
                return self._send_json({"error": "Missing old or new filename"}, 400)
            old_ext = os.path.splitext(old_name)[1]
            if not os.path.splitext(new_name)[1] and old_ext:
                new_name += old_ext
            old_path = os.path.join(TEMP_DIR, old_name)
            new_path = os.path.join(TEMP_DIR, new_name)
            if not os.path.exists(old_path):
                return self._send_json({"error": "Source file not found"}, 404)
            if os.path.exists(new_path) and old_path != new_path:
                return self._send_json({"error": "File with that name already exists"}, 400)
            try:
                os.rename(old_path, new_path)
                return self._send_json({"success": True, "new_name": new_name, "download_url": f"http://localhost:{PORT}/api/download/{new_name}"})
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
            res_pid = run_cmd(cmd_pid, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            pids = res_pid.stdout.strip().split()

            # Step 2: Send SIGINT (kill -2) to screenrecord PID on watch
            for pid in pids:
                if pid.isdigit():
                    cmd_kill = [ADB_PATH]
                    if device_id:
                        cmd_kill.extend(["-s", device_id])
                    cmd_kill.extend(["shell", "kill", "-2", pid])
                    run_cmd(cmd_kill, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

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
            res_pull = run_cmd(cmd_pull, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

            # Step 5: Clean up file on watch
            cmd_rm = [ADB_PATH]
            if device_id:
                cmd_rm.extend(["-s", device_id])
            cmd_rm.extend(["shell", "rm", remote_file])
            run_cmd(cmd_rm, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

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

        elif path == "/api/file/open":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
            try:
                data = json.loads(body) if body else {}
            except Exception:
                data = {}
            filename = os.path.basename(data.get("filename", "").strip())
            file_path = os.path.join(TEMP_DIR, filename)
            if os.path.exists(file_path):
                try:
                    os.startfile(file_path)
                    return self._send_json({"success": True})
                except Exception as e:
                    return self._send_json({"error": str(e)}, 500)
            return self._send_json({"error": "File not found"}, 404)

        else:
            return self._send_json({"error": "Endpoint not found"}, 404)

    def get_adb_devices(self):
        try:
            res = run_cmd([ADB_PATH, "devices", "-l"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=4)
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
                            ping_res = run_cmd([ADB_PATH, "-s", dev_id, "shell", "echo", "1"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=3.5)
                            if "closed" in ping_res.stderr.lower():
                                run_cmd([ADB_PATH, "disconnect", dev_id], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
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

def find_app_browser():
    try:
        import winreg
        for root in (winreg.HKEY_CURRENT_USER, winreg.HKEY_LOCAL_MACHINE):
            for app in ("chrome.exe", "msedge.exe", "brave.exe"):
                try:
                    with winreg.OpenKey(root, rf"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\{app}") as key:
                        val = winreg.QueryValue(key, "")
                        if val and os.path.exists(val):
                            return val
                except Exception:
                    pass
    except Exception:
        pass

    candidates = [
        # Google Chrome
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        # Microsoft Edge
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
        # Brave
        r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe"),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None

def start_app():
    if "--cli" in sys.argv or "--headless" in sys.argv or "-c" in sys.argv:
        run_server()
        return

    # Start the HTTP server in a background daemon thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(0.4)

    url = f"http://127.0.0.1:{PORT}/"
    browser_exe = find_app_browser()

    if browser_exe:
        # Launch dedicated native app window (no address bar, no tabs, no bookmarks)
        profile_dir = os.path.join(TEMP_DIR, "WatchRecorderAppData")
        cmd = [
            browser_exe,
            f"--app={url}",
            "--window-size=1180,780",
            f"--user-data-dir={profile_dir}",
            "--no-first-run",
            "--no-default-browser-check"
        ]
        try:
            proc = subprocess.Popen(cmd)
            proc.wait()
            return
        except Exception:
            pass

    # Fallback to webview or default browser if app mode fails
    try:
        import webview
        webview.create_window(
            title="Creation Cue | Watch Screen Recorder",
            url=url,
            width=1180,
            height=780,
            min_size=(820, 580),
            background_color="#141414"
        )
        webview.start()
    except Exception:
        webbrowser.open(url)
        while True:
            try:
                time.sleep(1)
            except KeyboardInterrupt:
                break

if __name__ == '__main__':
    start_app()
