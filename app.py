from flask import Flask, render_template, request, jsonify, Response, stream_with_context
import anthropic
import json
import os

app = Flask(__name__)

# Initialize Anthropic client
# Set your API key as environment variable: ANTHROPIC_API_KEY
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", "your-api-key-here"))

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/screenplay")
def screenplay_page():
    return render_template("screenplay.html")

@app.route("/characters")
def characters_page():
    return render_template("characters.html")

@app.route("/sound")
def sound_page():
    return render_template("sound.html")

@app.route("/production")
def production_page():
    return render_template("production.html")


# ─── API: Generate Screenplay ─────────────────────────────────────────────────

@app.route("/api/generate/screenplay", methods=["POST"])
def generate_screenplay():
    data = request.json
    idea  = data.get("idea", "")
    genre = data.get("genre", "Drama")
    tone  = data.get("tone", "Dark & Gritty")

    def stream():
        with client.messages.stream(
            model="claude-opus-4-5",
            max_tokens=1800,
            system=(
                "You are a professional Hollywood screenwriter. "
                "Write compelling, properly formatted screenplay excerpts. "
                "Use standard screenplay format: INT./EXT. scene headings, "
                "centered CHARACTER NAMES before dialogue, action blocks. "
                "Be cinematic, vivid, and emotionally resonant."
            ),
            messages=[{
                "role": "user",
                "content": (
                    f"Write a compelling screenplay excerpt for a {genre} film with a {tone} tone.\n\n"
                    f"Film Concept: {idea}\n\n"
                    "Include:\n"
                    "1. Opening scene (establish world & tone)\n"
                    "2. Key dramatic scene (character conflict)\n"
                    "3. A turning point moment\n\n"
                    "Use proper screenplay format throughout. Make it ~700 words."
                )
            }]
        ) as stream_obj:
            for text in stream_obj.text_stream:
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield "data: [DONE]\n\n"

    return Response(stream_with_context(stream()), mimetype="text/event-stream")


# ─── API: Generate Characters ─────────────────────────────────────────────────

@app.route("/api/generate/characters", methods=["POST"])
def generate_characters():
    data  = request.json
    idea  = data.get("idea", "")
    genre = data.get("genre", "Drama")
    tone  = data.get("tone", "Dark & Gritty")

    def stream():
        with client.messages.stream(
            model="claude-opus-4-5",
            max_tokens=1800,
            system=(
                "You are a character development expert for film. "
                "Create deep, psychologically complex character profiles "
                "that serve the story and feel completely human."
            ),
            messages=[{
                "role": "user",
                "content": (
                    f"Create detailed character profiles for a {genre} film ({tone} tone).\n\n"
                    f"Concept: {idea}\n\n"
                    "For each of 3-4 main characters provide:\n"
                    "• Full Name & Age\n"
                    "• Background & Occupation\n"
                    "• Core Motivation\n"
                    "• Fatal Flaw\n"
                    "• Character Arc\n"
                    "• Key Relationships\n"
                    "• Distinctive Mannerisms\n"
                    "• Sample Dialogue Line\n\n"
                    "Format with clear section headers for each character."
                )
            }]
        ) as stream_obj:
            for text in stream_obj.text_stream:
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield "data: [DONE]\n\n"

    return Response(stream_with_context(stream()), mimetype="text/event-stream")


# ─── API: Generate Sound Design ───────────────────────────────────────────────

@app.route("/api/generate/sound", methods=["POST"])
def generate_sound():
    data  = request.json
    idea  = data.get("idea", "")
    genre = data.get("genre", "Drama")
    tone  = data.get("tone", "Dark & Gritty")

    def stream():
        with client.messages.stream(
            model="claude-opus-4-5",
            max_tokens=1800,
            system=(
                "You are an award-winning film sound designer and composer. "
                "Create immersive, detailed sound design plans that elevate "
                "the emotional and narrative experience of films."
            ),
            messages=[{
                "role": "user",
                "content": (
                    f"Create a comprehensive sound design plan for a {genre} film ({tone} tone).\n\n"
                    f"Concept: {idea}\n\n"
                    "Include:\n"
                    "1. Musical Score — themes, motifs, instruments, composers to reference\n"
                    "2. Ambient Soundscapes — per act/location\n"
                    "3. Key Sound Effects — with emotional purpose\n"
                    "4. Silence & Negative Space — strategic use\n"
                    "5. Mixing Approach — balance of music/dialogue/SFX\n"
                    "6. Reference Films — for sound direction\n"
                    "7. Unique Audio Signature — what makes this film's sound memorable"
                )
            }]
        ) as stream_obj:
            for text in stream_obj.text_stream:
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield "data: [DONE]\n\n"

    return Response(stream_with_context(stream()), mimetype="text/event-stream")


# ─── API: Generate Production Plan ───────────────────────────────────────────

@app.route("/api/generate/production", methods=["POST"])
def generate_production():
    data  = request.json
    idea  = data.get("idea", "")
    genre = data.get("genre", "Drama")
    tone  = data.get("tone", "Dark & Gritty")

    def stream():
        with client.messages.stream(
            model="claude-opus-4-5",
            max_tokens=1800,
            system=(
                "You are a veteran Hollywood film producer. "
                "Create practical, detailed production plans that balance "
                "creative vision with logistical and budgetary reality."
            ),
            messages=[{
                "role": "user",
                "content": (
                    f"Create a full production plan for a {genre} film ({tone} tone).\n\n"
                    f"Concept: {idea}\n\n"
                    "Include:\n"
                    "1. Pre-Production Timeline (weeks breakdown)\n"
                    "2. Principal Photography Schedule\n"
                    "3. Location Requirements\n"
                    "4. Budget Tier & Key Cost Centers\n"
                    "5. Core Crew Roster\n"
                    "6. Visual Style Direction\n"
                    "7. Casting Strategy\n"
                    "8. Post-Production Pipeline\n"
                    "9. Distribution & Marketing Angle"
                )
            }]
        ) as stream_obj:
            for text in stream_obj.text_stream:
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield "data: [DONE]\n\n"

    return Response(stream_with_context(stream()), mimetype="text/event-stream")


# ─── API: Export ──────────────────────────────────────────────────────────────

@app.route("/api/export", methods=["POST"])
def export_content():
    data     = request.json
    content  = data.get("content", "")
    filename = data.get("filename", "scriptoria-export.txt")
    return Response(
        content,
        mimetype="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
