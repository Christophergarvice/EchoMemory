#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
from datetime import datetime, timezone
import json

BASE_DIR = Path(__file__).resolve().parent
LOG_DIR = BASE_DIR / "daily_log"
LOG_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
CORS(app)

print(f"[EchoMemory] Logs: {LOG_DIR}")

def utc_now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def today_utc():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")

def get_log_path():
    return LOG_DIR / f"log_{today_utc()}.jsonl"

def write_entry(entry):
    with get_log_path().open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        f.flush()

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "ok"}), 200

@app.route("/capture", methods=["POST"])
def capture():
    data = request.get_json(silent=True) or {}
    entry = {
        "ts": data.get("ts") or utc_now(),
        "role": data.get("role", "unknown"),
        "content": data.get("content", ""),
        "source": data.get("source", "browser"),
    }
    preview = entry["content"][:80].replace("\n", " ")
    print(f"[CAPTURE] {entry['role']:9} | {preview}")
    write_entry(entry)
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    print(f"[EchoMemory] Running on http://127.0.0.1:5005")
    app.run(host="127.0.0.1", port=5005, debug=False)
