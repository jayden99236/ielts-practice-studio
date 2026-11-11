// Speech-to-text that runs entirely in the browser, for browsers without a working
// built-in recogniser (Firefox, Opera, Brave…). The model is downloaded once and cached.
import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

let asr;
const sizes = {};

self.onmessage = async e => {
  try {
    if (!asr) {
      asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-base.en", {
        dtype: "q8",
        progress_callback: p => {
          if (p.status !== "progress" || !p.total) return;
          sizes[p.file] = [p.loaded, p.total];
          const all = Object.values(sizes);
          const loaded = all.reduce((n, s) => n + s[0], 0), total = all.reduce((n, s) => n + s[1], 0);
          self.postMessage({ type: "load", pct: Math.round(loaded / total * 100) });
        }
      });
    }
    self.postMessage({ type: "busy" });
    const out = await asr(e.data.audio, { chunk_length_s: 30, stride_length_s: 5 });
    self.postMessage({ type: "done", text: out.text || "" });
  } catch (err) {
    self.postMessage({ type: "error", message: String(err && err.message || err) });
  }
};
