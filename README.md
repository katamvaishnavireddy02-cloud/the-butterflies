# TitleScriptoria
### Generative AI–Powered Film Pre-Production System

A full-stack web application that helps filmmakers generate complete pre-production packages from a single idea — using the Claude AI API via a Flask backend.

---

## 🎬 Features

| Module | Description |
|---|---|
| **Screenplay Generator** | Properly formatted screenplay excerpts with scene headings, action lines, and dialogue |
| **Character Development** | Deep psychological profiles with motivations, arcs, flaws, and sample dialogue |
| **Sound Design Planning** | Musical themes, soundscapes, SFX, silence strategy, and reference films |
| **Production Plan** | Schedules, budgets, crew, locations, visual style, and distribution strategy |

- **Quick Generate** on home page — all 4 modules in parallel
- **Real-time streaming** output (Server-Sent Events)
- **Export** individual or all outputs as `.txt` files
- Responsive design, mobile-friendly

---

## 🛠 Tech Stack

- **Backend**: Python 3.10+, Flask 3.0
- **AI**: Anthropic Claude API (claude-opus-4-5)
- **Frontend**: HTML5, CSS3 (custom, no frameworks), Vanilla JavaScript
- **Fonts**: Playfair Display, Cormorant Garamond, Courier Prime (Google Fonts)

---

## 🚀 Setup & Run

### 1. Clone / unzip the project
```bash
cd TitleScriptoria
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
# Edit .env and add your Anthropic API key:
# ANTHROPIC_API_KEY=sk-ant-...
```

Or set as an environment variable directly:
```bash
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

### 5. Run the application
```bash
python app.py
```

Open your browser at: **http://localhost:5000**

---

## 📁 Project Structure

```
TitleScriptoria/
├── app.py                    # Flask application & API routes
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variable template
├── README.md                 # This file
├── templates/
│   ├── base.html             # Base layout (navbar, footer)
│   ├── index.html            # Home page with Quick Generate
│   ├── screenplay.html       # Screenplay generator page
│   ├── characters.html       # Character development page
│   ├── sound.html            # Sound design page
│   └── production.html       # Production plan page
└── static/
    ├── css/
    │   └── main.css          # All styles (minimalist dark theme)
    └── js/
        ├── main.js           # Nav, tabs, UI interactions
        └── generator.js      # Streaming API client + export
```

---

## 🔑 API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Home page |
| `GET` | `/screenplay` | Screenplay generator page |
| `GET` | `/characters` | Character development page |
| `GET` | `/sound` | Sound design page |
| `GET` | `/production` | Production plan page |
| `POST` | `/api/generate/screenplay` | Stream screenplay generation |
| `POST` | `/api/generate/characters` | Stream character generation |
| `POST` | `/api/generate/sound` | Stream sound design generation |
| `POST` | `/api/generate/production` | Stream production plan generation |
| `POST` | `/api/export` | Export content as text file |

### Request Body (all generate endpoints)
```json
{
  "idea":  "Your film concept description",
  "genre": "Drama",
  "tone":  "Dark & Gritty"
}
```

---

## 📝 Notes

- Ensure your `ANTHROPIC_API_KEY` is valid and has sufficient quota.
- The app uses **streaming (SSE)** — results appear word-by-word in real time.
- All 4 generation modules run in parallel on the home page Quick Generate.
- Exports save as plain `.txt` files in screenplay/document format.

---

*TitleScriptoria — Generative AI Film Pre-Production Suite*
