import { useState, useEffect, useRef } from "react";

const API_KEY_PLACEHOLDER = ""; // handled by proxy

// ── Cinematic color palette ──────────────────────────────────────────────────
const THEME = {
  bg: "#0a0705",
  surface: "#12100d",
  card: "#1a1611",
  border: "#2e2418",
  gold: "#c9a84c",
  goldLight: "#e8c97a",
  cream: "#f5edd8",
  muted: "#7a6a52",
  accent: "#8b3a2a",
  green: "#4a7c59",
};

const TABS = [
  { id: "screenplay", label: "Screenplay", icon: "✦" },
  { id: "characters", label: "Characters", icon: "◈" },
  { id: "sound", label: "Sound Design", icon: "◉" },
  { id: "production", label: "Production Plan", icon: "◆" },
];

// ── Anthropic API call ───────────────────────────────────────────────────────
async function callClaude(systemPrompt, userPrompt, onChunk) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1800,
      stream: true,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            onChunk(parsed.delta.text);
          }
        } catch {}
      }
    }
  }
}

// ── Film strip decoration ────────────────────────────────────────────────────
function FilmStrip({ vertical = false }) {
  const holes = Array.from({ length: 12 });
  return (
    <div style={{
      display: "flex",
      flexDirection: vertical ? "column" : "row",
      gap: vertical ? "14px" : "14px",
      padding: vertical ? "8px 4px" : "4px 8px",
      background: "#0d0b08",
      borderRadius: "3px",
      opacity: 0.6,
    }}>
      {holes.map((_, i) => (
        <div key={i} style={{
          width: vertical ? "14px" : "10px",
          height: vertical ? "10px" : "14px",
          borderRadius: "2px",
          background: "#2e2418",
          border: "1px solid #3a2e1e",
          flexShrink: 0,
        }} />
      ))}
    </div>
  );
}

// ── Glowing title ────────────────────────────────────────────────────────────
function HeroTitle() {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px 32px", position: "relative" }}>
      {/* Decorative lines */}
      <div style={{
        display: "flex", alignItems: "center", gap: "16px",
        justifyContent: "center", marginBottom: "16px",
      }}>
        <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, transparent, ${THEME.gold})` }} />
        <span style={{ color: THEME.gold, fontSize: "10px", letterSpacing: "6px", fontFamily: "serif" }}>EST. MMXXV</span>
        <div style={{ flex: 1, height: "1px", background: `linear-gradient(to left, transparent, ${THEME.gold})` }} />
      </div>

      <h1 style={{
        fontFamily: "'Playfair Display', 'Georgia', serif",
        fontSize: "clamp(36px, 6vw, 72px)",
        fontWeight: 900,
        letterSpacing: "-1px",
        lineHeight: 1,
        color: THEME.cream,
        textShadow: `0 0 60px ${THEME.gold}40, 0 2px 0 ${THEME.bg}`,
        margin: "0 0 8px",
      }}>
        Title<span style={{ color: THEME.gold }}>Scriptoria</span>
      </h1>

      <p style={{
        fontFamily: "'Cormorant Garamond', 'Georgia', serif",
        fontSize: "clamp(13px, 2vw, 17px)",
        color: THEME.muted,
        letterSpacing: "4px",
        textTransform: "uppercase",
        margin: "0 0 8px",
      }}>
        Generative AI · Film Pre-Production System
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "12px" }}>
        {["SCREENPLAY", "CHARACTERS", "SOUND", "PRODUCTION"].map(t => (
          <span key={t} style={{
            fontSize: "9px", letterSpacing: "2px", color: THEME.muted,
            border: `1px solid ${THEME.border}`, padding: "2px 8px", borderRadius: "2px",
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ── Input section ────────────────────────────────────────────────────────────
function IdeaInput({ idea, setIdea, genre, setGenre, tone, setTone, onGenerate, loading }) {
  const genres = ["Drama", "Thriller", "Sci-Fi", "Horror", "Romance", "Action", "Comedy", "Mystery", "Fantasy", "Documentary"];
  const tones = ["Dark & Gritty", "Whimsical", "Epic", "Intimate", "Satirical", "Surreal", "Nostalgic", "Tense"];

  return (
    <div style={{
      background: THEME.card,
      border: `1px solid ${THEME.border}`,
      borderRadius: "8px",
      padding: "28px",
      margin: "0 24px 28px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Corner accent */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "80px", height: "80px",
        background: `linear-gradient(225deg, ${THEME.gold}18, transparent)`,
        borderBottomLeftRadius: "80px",
      }} />

      <label style={{
        display: "block", fontFamily: "serif",
        fontSize: "11px", letterSpacing: "3px", color: THEME.gold,
        textTransform: "uppercase", marginBottom: "10px",
      }}>
        ✦ Your Film Concept
      </label>

      <textarea
        value={idea}
        onChange={e => setIdea(e.target.value)}
        placeholder="Describe your film idea… A retired assassin in 1970s Tokyo discovers her late daughter was a double agent. As she unravels the truth, past and present collide…"
        style={{
          width: "100%", minHeight: "100px",
          background: THEME.surface, border: `1px solid ${THEME.border}`,
          borderRadius: "5px", padding: "14px 16px",
          color: THEME.cream, fontSize: "14px",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          lineHeight: 1.7, resize: "vertical",
          outline: "none", boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = THEME.gold}
        onBlur={e => e.target.style.borderColor = THEME.border}
      />

      <div style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "160px" }}>
          <label style={{ display: "block", fontSize: "10px", letterSpacing: "2px", color: THEME.muted, marginBottom: "6px" }}>GENRE</label>
          <select value={genre} onChange={e => setGenre(e.target.value)} style={{
            width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`,
            borderRadius: "4px", padding: "9px 12px", color: THEME.cream, fontSize: "13px",
            fontFamily: "serif", outline: "none", cursor: "pointer",
          }}>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: "160px" }}>
          <label style={{ display: "block", fontSize: "10px", letterSpacing: "2px", color: THEME.muted, marginBottom: "6px" }}>TONE</label>
          <select value={tone} onChange={e => setTone(e.target.value)} style={{
            width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`,
            borderRadius: "4px", padding: "9px 12px", color: THEME.cream, fontSize: "13px",
            fontFamily: "serif", outline: "none", cursor: "pointer",
          }}>
            {tones.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <button
          onClick={onGenerate}
          disabled={loading || !idea.trim()}
          style={{
            alignSelf: "flex-end",
            background: loading || !idea.trim()
              ? THEME.border
              : `linear-gradient(135deg, ${THEME.gold}, ${THEME.accent})`,
            border: "none", borderRadius: "5px",
            padding: "10px 28px", color: loading || !idea.trim() ? THEME.muted : "#fff",
            fontSize: "12px", letterSpacing: "3px", fontFamily: "serif",
            textTransform: "uppercase", cursor: loading || !idea.trim() ? "not-allowed" : "pointer",
            transition: "all 0.3s", fontWeight: 700,
            boxShadow: loading || !idea.trim() ? "none" : `0 4px 20px ${THEME.gold}40`,
          }}
        >
          {loading ? "Generating…" : "✦ Generate All"}
        </button>
      </div>
    </div>
  );
}

// ── Tab bar ──────────────────────────────────────────────────────────────────
function TabBar({ active, setActive }) {
  return (
    <div style={{
      display: "flex", gap: "4px",
      padding: "0 24px 20px",
      borderBottom: `1px solid ${THEME.border}`,
      marginBottom: "24px",
    }}>
      {TABS.map(tab => (
        <button key={tab.id} onClick={() => setActive(tab.id)} style={{
          flex: 1, background: active === tab.id ? THEME.card : "transparent",
          border: `1px solid ${active === tab.id ? THEME.gold + "60" : THEME.border}`,
          borderRadius: "5px", padding: "10px 8px", cursor: "pointer",
          color: active === tab.id ? THEME.gold : THEME.muted,
          fontSize: "11px", letterSpacing: "1.5px",
          fontFamily: "serif", textTransform: "uppercase",
          transition: "all 0.2s",
          boxShadow: active === tab.id ? `0 0 12px ${THEME.gold}20` : "none",
        }}>
          <div style={{ fontSize: "16px", marginBottom: "3px" }}>{tab.icon}</div>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Output panel ─────────────────────────────────────────────────────────────
function OutputPanel({ content, loading, label }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (loading && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [content, loading]);

  if (!content && !loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "60px 24px",
        color: THEME.muted, gap: "16px",
      }}>
        <div style={{
          width: "60px", height: "60px",
          border: `1px solid ${THEME.border}`,
          borderRadius: "50%", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: "24px", color: THEME.border,
        }}>◈</div>
        <p style={{ fontFamily: "serif", fontSize: "14px", letterSpacing: "2px", textTransform: "uppercase" }}>
          {label} will appear here
        </p>
        <p style={{ fontSize: "12px", color: THEME.border, maxWidth: "300px", textAlign: "center" }}>
          Enter your film concept above and click Generate All
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 24px 32px" }}>
      {/* Top film strip decoration */}
      <div style={{ marginBottom: "16px" }}>
        <FilmStrip />
      </div>

      <div style={{
        background: THEME.surface,
        border: `1px solid ${THEME.border}`,
        borderRadius: "6px", padding: "24px 28px",
        position: "relative", minHeight: "200px",
      }}>
        {loading && (
          <div style={{
            position: "absolute", top: "12px", right: "12px",
            display: "flex", gap: "4px", alignItems: "center",
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: "6px", height: "6px",
                borderRadius: "50%", background: THEME.gold,
                animation: `pulse 1.2s ${i * 0.4}s infinite`,
              }} />
            ))}
          </div>
        )}

        <pre style={{
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          fontFamily: "'Courier Prime', 'Courier New', monospace",
          fontSize: "13.5px", lineHeight: "1.85",
          color: THEME.cream, margin: 0,
          letterSpacing: "0.2px",
        }}>
          {content}
          {loading && <span style={{
            display: "inline-block", width: "2px", height: "16px",
            background: THEME.gold, marginLeft: "2px",
            verticalAlign: "middle", animation: "blink 1s infinite",
          }} />}
        </pre>
        <div ref={endRef} />
      </div>

      {content && !loading && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px", gap: "10px" }}>
          <button
            onClick={() => navigator.clipboard?.writeText(content)}
            style={{
              background: "transparent", border: `1px solid ${THEME.border}`,
              borderRadius: "4px", padding: "7px 16px",
              color: THEME.muted, fontSize: "10px", letterSpacing: "2px",
              fontFamily: "serif", textTransform: "uppercase", cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={e => { e.target.style.borderColor = THEME.gold; e.target.style.color = THEME.gold; }}
            onMouseOut={e => { e.target.style.borderColor = THEME.border; e.target.style.color = THEME.muted; }}
          >
            ⎘ Copy
          </button>
          <button
            onClick={() => {
              const blob = new Blob([content], { type: "text/plain" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `scriptoria-${label.toLowerCase().replace(/\s/g, "-")}.txt`;
              a.click();
            }}
            style={{
              background: `linear-gradient(135deg, ${THEME.gold}22, ${THEME.accent}22)`,
              border: `1px solid ${THEME.gold}50`,
              borderRadius: "4px", padding: "7px 16px",
              color: THEME.goldLight, fontSize: "10px", letterSpacing: "2px",
              fontFamily: "serif", textTransform: "uppercase", cursor: "pointer",
            }}
          >
            ↓ Export
          </button>
        </div>
      )}
    </div>
  );
}

// ── Progress tracker ─────────────────────────────────────────────────────────
function ProgressBar({ results }) {
  const total = TABS.length;
  const done = TABS.filter(t => results[t.id]).length;
  if (done === 0) return null;

  return (
    <div style={{ padding: "0 24px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "10px", letterSpacing: "2px", color: THEME.muted, fontFamily: "serif" }}>PRE-PRODUCTION PROGRESS</span>
        <span style={{ fontSize: "10px", color: THEME.gold, fontFamily: "serif" }}>{done}/{total} COMPLETE</span>
      </div>
      <div style={{ height: "2px", background: THEME.border, borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${(done / total) * 100}%`,
          background: `linear-gradient(to right, ${THEME.gold}, ${THEME.goldLight})`,
          transition: "width 0.6s ease",
          borderRadius: "2px",
        }} />
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function TitleScriptoria() {
  const [idea, setIdea] = useState("");
  const [genre, setGenre] = useState("Drama");
  const [tone, setTone] = useState("Dark & Gritty");
  const [activeTab, setActiveTab] = useState("screenplay");
  const [results, setResults] = useState({ screenplay: "", characters: "", sound: "", production: "" });
  const [loading, setLoading] = useState({ screenplay: false, characters: false, sound: false, production: false });

  const prompts = {
    screenplay: {
      system: "You are a professional Hollywood screenwriter. Write compelling, properly formatted screenplay excerpts with scene headings, action lines, and dialogue. Be cinematic and evocative.",
      user: (idea, genre, tone) =>
        `Write a compelling screenplay excerpt (opening scene + key dramatic scene, ~600 words) for a ${genre} film with a ${tone} tone.\n\nConcept: ${idea}\n\nUse proper screenplay format: INT./EXT. headings, character names centered before dialogue, action blocks. Make it vivid and cinematic.`,
    },
    characters: {
      system: "You are a character development expert for film. Create deep, psychologically complex character profiles that serve the story.",
      user: (idea, genre, tone) =>
        `Create detailed character profiles for a ${genre} film (${tone} tone).\n\nConcept: ${idea}\n\nFor each of 3-4 main characters provide: Full name, Age/Background, Core motivation, Fatal flaw, Character arc, Key relationships, Distinctive mannerisms, Sample dialogue line. Format clearly with headers.`,
    },
    sound: {
      system: "You are a film sound designer and composer. Create immersive, detailed sound design plans that enhance the emotional and narrative experience.",
      user: (idea, genre, tone) =>
        `Create a comprehensive sound design plan for a ${genre} film (${tone} tone).\n\nConcept: ${idea}\n\nInclude: Musical motifs and themes, Ambient soundscapes per act, Key sound effects with emotional purpose, Silence usage, Music genre/instruments, Mixing approach, Reference films for sound direction.`,
    },
    production: {
      system: "You are a veteran film producer. Create practical, detailed production plans that balance creative vision with logistical reality.",
      user: (idea, genre, tone) =>
        `Create a production plan for a ${genre} film (${tone} tone).\n\nConcept: ${idea}\n\nInclude: Shooting schedule overview (phases), Location requirements, Budget tier estimate, Key crew roles needed, Visual style direction, Casting notes, Post-production pipeline, Marketing angle.`,
    },
  };

  const generateAll = async () => {
    if (!idea.trim()) return;

    const tabs = ["screenplay", "characters", "sound", "production"];
    setResults({ screenplay: "", characters: "", sound: "", production: "" });

    // Run all in parallel
    const promises = tabs.map(async (tab) => {
      setLoading(prev => ({ ...prev, [tab]: true }));
      try {
        const p = prompts[tab];
        await callClaude(p.system, p.user(idea, genre, tone), (chunk) => {
          setResults(prev => ({ ...prev, [tab]: prev[tab] + chunk }));
        });
      } catch (err) {
        setResults(prev => ({ ...prev, [tab]: `Error generating ${tab}: ${err.message}` }));
      } finally {
        setLoading(prev => ({ ...prev, [tab]: false }));
      }
    });

    await Promise.all(promises);
  };

  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <div style={{
      minHeight: "100vh",
      background: THEME.bg,
      backgroundImage: `
        radial-gradient(ellipse at 20% 0%, ${THEME.gold}08 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, ${THEME.accent}06 0%, transparent 50%)
      `,
      fontFamily: "system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Courier+Prime&display=swap');
        * { box-sizing: border-box; }
        select option { background: #1a1611; color: #f5edd8; }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${THEME.bg}; }
        ::-webkit-scrollbar-thumb { background: ${THEME.border}; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "60px" }}>

        {/* Hero */}
        <HeroTitle />

        {/* Input */}
        <IdeaInput
          idea={idea} setIdea={setIdea}
          genre={genre} setGenre={setGenre}
          tone={tone} setTone={setTone}
          onGenerate={generateAll}
          loading={isAnyLoading}
        />

        {/* Progress */}
        <ProgressBar results={results} />

        {/* Tabs */}
        <div style={{ padding: "0 24px", marginBottom: "4px" }}>
          <TabBar active={activeTab} setActive={setActiveTab} />
        </div>

        {/* Output */}
        <OutputPanel
          content={results[activeTab]}
          loading={loading[activeTab]}
          label={TABS.find(t => t.id === activeTab)?.label || ""}
        />

        {/* Footer */}
        <div style={{
          textAlign: "center", padding: "24px",
          borderTop: `1px solid ${THEME.border}`,
          margin: "0 24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "10px" }}>
            <FilmStrip />
          </div>
          <p style={{ fontSize: "10px", letterSpacing: "3px", color: THEME.muted, fontFamily: "serif", textTransform: "uppercase" }}>
            TitleScriptoria · Powered by Claude AI · Film Pre-Production Suite
          </p>
        </div>
      </div>
    </div>
  );
}
