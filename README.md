# AskAI 🤖

An AI-powered chat assistant built with Python + Flask, using the Anthropic API (Claude) as its brain.

## Features
- 💬 Multi-turn conversation with memory
- 🧠 Powered by Claude (claude-sonnet-4)
- 💾 Session history saved to JSON
- 🎨 Sleek dark UI with syntax highlighting
- ⚡ Real-time responses

## Setup

### 1. Clone / download the project
```bash
cd askai
```

### 2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure your API key
```bash
cp .env.example .env
```
Edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-...
FLASK_SECRET_KEY=any-random-string
```

Get your API key at: https://console.anthropic.com

### 5. Run the app
```bash
python app.py
```

Open your browser at: **http://localhost:5000**

---

## Project Structure
```
askai/
├── app.py              # Flask backend + Anthropic API
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variable template
├── templates/
│   └── index.html      # Chat UI
├── static/
│   ├── css/style.css   # Styles
│   └── js/main.js      # Frontend logic
└── data/               # Chat histories (auto-created)
```

## Deployment

### Railway (recommended)
1. Push to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Add `ANTHROPIC_API_KEY` as environment variable
4. Deploy!

### Render
1. Push to GitHub
2. New Web Service on [Render](https://render.com)
3. Build command: `pip install -r requirements.txt`
4. Start command: `python app.py`
5. Add environment variables

---

Built with ❤️ using Python, Flask, and Claude.
