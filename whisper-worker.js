// Speech-to-text that runs entirely on the device, for browsers without a working
// built-in recogniser (Firefox, Opera, Brave…) and for the offline Android app.
// On the web the library and model are downloaded once and cached; in the app they are bundled.
let asr;
const sizes = {};

async function load(cfg) {
  const { pipeline, env } = await import(cfg.lib);
  if (cfg.local) {
    env.allowRemoteModels = false;
    env.allowLocalModels = true;
    env.localModelPath = cfg.models;
    env.useBrowserCache = false;
    env.backends.onnx.wasm.wasmPaths = cfg.wasm;
  }
  return pipeline("automatic-speech-recognition", cfg.model, {
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

self.onmessage = async e => {
  try {
    if (!asr) asr = await load(e.data.cfg);
    self.postMessage({ type: "busy" });
    const out = await asr(e.data.audio, { chunk_length_s: 30, stride_length_s: 5 });
    self.postMessage({ type: "done", text: out.text || "" });
  } catch (err) {
    self.postMessage({ type: "error", message: String(err && err.message || err) });
  }
};
