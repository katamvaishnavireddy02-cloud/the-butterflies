// TitleScriptoria — generator.js
// Handles SSE streaming from Flask API endpoints

/**
 * Stream content from the Flask backend using Server-Sent Events.
 * @param {string} type        - 'screenplay' | 'characters' | 'sound' | 'production'
 * @param {string} idea        - Film concept from user
 * @param {string} genre       - Selected genre
 * @param {string} tone        - Selected tone
 * @param {function} onChunk   - Called with each text chunk as it arrives
 * @returns {Promise<void>}    - Resolves when stream completes
 */
async function streamGenerate(type, idea, genre, tone, onChunk) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`/api/generate/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, genre, tone })
      });

      if (!response.ok) {
        const err = await response.text();
        onChunk(`\n[Error: ${response.status} — ${err}]`);
        resolve();
        return;
      }

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') { resolve(); return; }
          try {
            const parsed = JSON.parse(raw);
            if (parsed.text) onChunk(parsed.text);
          } catch (_) {}
        }
      }
      resolve();
    } catch (err) {
      onChunk(`\n[Network error: ${err.message}]`);
      resolve();
    }
  });
}

/**
 * Download a string as a plain-text file.
 * @param {string} content
 * @param {string} filename
 */
function downloadText(content, filename) {
  if (!content) { alert('Nothing to export yet.'); return; }
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
