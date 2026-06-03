import os
import json
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, render_template, session
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "askai-secret")

api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY not found in .env file")
client = Groq(api_key=api_key)

SYSTEM_PROMPT = "You are AskAI, a helpful, intelligent, and friendly assistant. You provide clear, accurate, and thoughtful responses. Always be honest if you don't know something."

HISTORY_DIR = "data"
os.makedirs(HISTORY_DIR, exist_ok=True)


def get_history_path(session_id):
    return os.path.join(HISTORY_DIR, f"{session_id}.json")


def load_history(session_id):
    path = get_history_path(session_id)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return []


def save_history(session_id, messages):
    path = get_history_path(session_id)
    with open(path, "w") as f:
        json.dump(messages, f, indent=2)


@app.route("/")
def index():
    if "session_id" not in session:
        session["session_id"] = str(uuid.uuid4())
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    session_id = session.get("session_id", str(uuid.uuid4()))
    session["session_id"] = session_id

    messages = load_history(session_id)
    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": SYSTEM_PROMPT}] + messages,
            max_tokens=1024,
        )

        assistant_message = response.choices[0].message.content
        messages.append({"role": "assistant", "content": assistant_message})
        save_history(session_id, messages)

        return jsonify({
            "response": assistant_message,
            "session_id": session_id,
            "timestamp": datetime.now().strftime("%H:%M"),
        })

    except Exception as e:
        return jsonify({"error": f"Something went wrong: {str(e)}"}), 500


@app.route("/history", methods=["GET"])
def get_history():
    session_id = session.get("session_id")
    if not session_id:
        return jsonify([])
    messages = load_history(session_id)
    return jsonify(messages)


@app.route("/clear", methods=["POST"])
def clear_history():
    session_id = session.get("session_id")
    if session_id:
        path = get_history_path(session_id)
        if os.path.exists(path):
            os.remove(path)
        session["session_id"] = str(uuid.uuid4())
    return jsonify({"status": "cleared"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)