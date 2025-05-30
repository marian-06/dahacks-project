from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import threading
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Pomodoro timer state
pomodoro_state = {
    "is_active": False,
    "is_break": False,
    "start_time": None,
    "timer_thread": None
}

def reset_pomodoro_state():
    pomodoro_state["is_active"] = False
    pomodoro_state["is_break"] = False
    pomodoro_state["start_time"] = None
    pomodoro_state["timer_thread"] = None

def pomodoro_timer():
    while pomodoro_state["is_active"]:
        if not pomodoro_state["is_break"]:
            # Work period (25 minutes)
            time.sleep(25 * 60)
            if pomodoro_state["is_active"]:
                pomodoro_state["is_break"] = True
                print("Time's up! Take a break.")
        else:
            # Break period (5 minutes)
            time.sleep(5 * 60)
            if pomodoro_state["is_active"]:
                pomodoro_state["is_break"] = False
                print("Break's over! Back to work.")

@app.route("/pomodoro/start", methods=["POST"])
def start_pomodoro():
    if not pomodoro_state["is_active"]:
        pomodoro_state["is_active"] = True
        pomodoro_state["start_time"] = datetime.now()
        pomodoro_state["timer_thread"] = threading.Thread(target=pomodoro_timer)
        pomodoro_state["timer_thread"].start()
        return jsonify({"message": "Pomodoro timer started", "status": "running"})
    return jsonify({"message": "Pomodoro timer is already running", "status": "running"})

@app.route("/pomodoro/stop", methods=["POST"])
def stop_pomodoro():
    if pomodoro_state["is_active"]:
        reset_pomodoro_state()
        return jsonify({"message": "Pomodoro timer stopped", "status": "stopped"})
    return jsonify({"message": "Pomodoro timer is not running", "status": "stopped"})

@app.route("/pomodoro/status", methods=["GET"])
def get_pomodoro_status():
    status = {
        "is_active": pomodoro_state["is_active"],
        "is_break": pomodoro_state["is_break"],
        "start_time": pomodoro_state["start_time"].isoformat() if pomodoro_state["start_time"] else None
    }
    return jsonify(status)

if __name__ == "__main__":
    print("Starting Flask server on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True) 