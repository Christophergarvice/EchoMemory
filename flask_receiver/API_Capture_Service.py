#!/usr/bin/env python3
from flask import Flask, request, jsonify
from flask_cors import CORS
import json, os
from datetime import datetime

app = Flask(__name__)
CORS(app)
LOG_FILE = "/home/pi/flask_capture/capture.log"
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"status": "ok"}), 200

@app.route('/capture', methods=['POST'])
def capture():
    data = request.get_json()
    with open(LOG_FILE, 'a') as f:
        f.write(json.dumps(data) + '\n')
    return jsonify({"status": "success"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)
