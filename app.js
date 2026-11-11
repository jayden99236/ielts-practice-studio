(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, props = {}, ...kids) => {
  const n = Object.assign(document.createElement(tag), props);
  n.append(...kids);
  return n;
};
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/* ---------- saved progress ---------- */
const store = {
  get() { try { return JSON.parse(localStorage.getItem("ielts-progress")) || {}; } catch { return {}; } },
  set(patch) {
    const v = { ...this.get(), ...patch };
    try { localStorage.setItem("ielts-progress", JSON.stringify(v)); } catch {}
    renderProgress();
  }
};
function renderProgress() {
  const p = store.get();
  const best = Object.values(p.listening || {});
  const items = [
    [Object.values(p.lessons || {}).reduce((n, l) => n + Object.keys(l).length, 0), "sentences practised"],
    [p.answers || 0, "test answers"],
    [fmt(p.speakSecs || 0), "speaking time"],
    [best.length ? `${best.length}/${LISTENING.length}` : "0", "listening tests done"],
    [p.dictBest != null ? p.dictBest + "%" : "–", "best dictation"]
  ];
  $("#progress").replaceChildren(...items.map(([v, l]) => el("div", { className: "stat" }, el("b", { textContent: v }), el("span", { textContent: l }))));
}

/* ---------- tabs ---------- */
function showTab(id) {
  if (!$("#" + id + ".tab") || (id === "lesson" && !lessons.cur)) id = "home";
  $$(".tab").forEach(t => t.classList.toggle("on", t.id === id));
  $$("nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === (id === "lesson" ? "home" : id)));
  tts.stop();
  if (speaking.active) speaking.stop();
  if (lessons.active) lessons.stop();
  $("#ln-audio").pause();
  if (id === "home") lessons.renderList();
  window.scrollTo(0, 0);
}
document.addEventListener("click", e => {
  const t = e.target.closest("[data-tab]");
  if (!t) return;
  e.preventDefault();
  history.replaceState(null, "", "#" + t.dataset.tab);
  showTab(t.dataset.tab);
});

/* ---------- text to speech ---------- */
// The Android app provides the phone's own voice through this bridge (web views have no speechSynthesis).
const NATIVE = window.AndroidTTS;
const IN_APP = !!NATIVE;
let ttsDone = {}, ttsId = 0;
window.__ttsDone = id => { const f = ttsDone[id]; delete ttsDone[id]; f && f(); };
const tts = {
  ok: IN_APP || "speechSynthesis" in window,
  voices: [],
  run: 0,
  load() {
    if (!this.ok || IN_APP) return;
    this.voices = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
  },
  voice(lang, index = 0) {
    const pref = this.voices.filter(v => v.lang.replace("_", "-") === lang);
    const pool = pref.length > index ? pref : [...pref, ...this.voices.filter(v => !pref.includes(v))];
    return pool[index % Math.max(pool.length, 1)];
  },
  stop() {
    this.run++;
    ttsDone = {};
    if (IN_APP) NATIVE.stop(); else if (this.ok) speechSynthesis.cancel();
  },
  // lines: [speaker, text][]; speakers get different voices (or pitch if only one voice exists)
  play(lines, { rate = 0.95, lang = "en-GB", onProgress, onDone } = {}) {
    if (!this.ok) return;
    this.stop();
    const run = this.run;
    const speakers = [...new Set(lines.map(l => l[0]))];
    let i = 0;
    const next = () => {
      if (run !== this.run) return;
      onProgress && onProgress(i, lines.length);
      if (i >= lines.length) { onDone && onDone(); return; }
      const [who, text] = lines[i++];
      const idx = speakers.indexOf(who);
      const gap = speakers.length > 1 ? 250 : 350;
      if (IN_APP) {
        const id = "u" + (++ttsId);
        ttsDone[id] = () => setTimeout(next, gap);
        NATIVE.speak(text, rate, idx ? 1.3 : 1, lang, id);
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      const v = this.voice(lang, idx);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang;
      u.rate = rate;
      u.pitch = idx && this.voices.length < 2 ? 1.35 : 1;
      u.onend = u.onerror = () => setTimeout(next, gap);
      speechSynthesis.speak(u);
    };
    next();
  }
};
tts.load();
if (tts.ok && !IN_APP) speechSynthesis.onvoiceschanged = () => tts.load();

/* ---------- speaking ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
// Opera and Brave expose the recogniser but it never returns anything, so skip it there.
let useSR = !!SR && !/OPR\/|Opera/.test(navigator.userAgent) && !navigator.brave;
const canRecord = !!(navigator.mediaDevices && window.MediaRecorder);
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

// Fallback transcription: the recording is transcribed on this device by a model in a worker.
const whisper = {
  worker: null,
  // Inside the Android app everything is bundled, so nothing is fetched from the internet.
  cfg() {
    const base = new URL(".", location.href).href;
    return IN_APP
      ? { local: true, lib: base + "vendor/transformers.min.js", wasm: base + "vendor/", models: base + "models/", model: "Xenova/whisper-tiny.en" }
      : { lib: "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1", model: "Xenova/whisper-base.en" };
  },
  async run(blob, onStatus) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    ctx.close();
    const audio = buf.getChannelData(0).slice();
    if (!this.worker) this.worker = new Worker("whisper-worker.js", { type: "module" });
    return new Promise((res, rej) => {
      this.worker.onmessage = e => {
        const d = e.data;
        if (d.type === "load") onStatus(IN_APP ? `Loading the speech model… ${d.pct}%` : `Downloading the speech model (first time only, about 80 MB)… ${d.pct}%`);
        else if (d.type === "busy") onStatus("Transcribing your answer on this device…");
        else if (d.type === "done") res(d.text);
        else rej(new Error(d.message));
      };
      this.worker.onerror = e => { this.worker = null; rej(new Error(e.message || "the speech model could not be loaded")); };
      this.worker.postMessage({ audio, cfg: this.cfg() }, [audio.buffer]);
    });
  }
};
const FILLERS = ["um", "uh", "er", "erm", "hmm", "you know", "i mean", "kind of", "sort of", "basically"];
const LINKERS = ["because", "however", "although", "for example", "for instance", "on the other hand", "in addition", "therefore", "whereas", "moreover", "as a result", "despite", "in my opinion", "so that", "even though", "while", "unless", "which means"];
const TARGET = { 1: [25, 70], 2: [180, 320], 3: [60, 140] };
const HINT = {
  1: "Part 1: short questions about familiar topics. Aim for 2–4 sentences (about 20–30 seconds).",
  2: "Part 2: take 1 minute to prepare, then speak for up to 2 minutes. Recording stops automatically at 2:00.",
  3: "Part 3: discussion questions. Give an opinion, a reason and an example (about 45–60 seconds)."
};

const speaking = {
  part: 1, current: null, active: false, rec: null, final: "", start: 0, tick: null, media: null, chunks: [],
  setPart(p) {
    this.part = p;
    $$("#sp-parts button").forEach(b => b.classList.toggle("on", +b.dataset.part === p));
    $("#sp-hint").textContent = HINT[p];
    this.next();
  },
  next() {
    if (this.active) this.stop();
    clearInterval(this.tick);
    tts.stop();
    let q;
    do { q = pick(SPEAKING[this.part]); } while (q === this.current && SPEAKING[this.part].length > 1);
    this.current = q;
    const isCue = this.part === 2;
    $("#sp-topic").textContent = isCue ? "Cue card" : q[0];
    $("#sp-question").textContent = isCue ? q[0] : q[1];
    $("#sp-cue").hidden = $("#sp-notes").hidden = $("#sp-prep").hidden = !isCue;
    $("#sp-cue").replaceChildren(...(isCue ? [el("li", { textContent: "You should say:" , style: "list-style:none;margin-left:-20px" }), ...q[1].map(t => el("li", { textContent: t }))] : []));
    $("#sp-notes").value = "";
    $("#sp-timer").textContent = "0:00";
    $("#sp-status").textContent = "";
  },
  questionText() {
    const q = this.current;
    return this.part === 2 ? `${q[0]} You should say: ${q[1].join(", ")}.` : q[1];
  },
  prep() {
    let left = 60;
    clearInterval(this.tick);
    $("#sp-status").textContent = "Preparation time – make notes.";
    $("#sp-timer").textContent = fmt(left);
    this.tick = setInterval(() => {
      $("#sp-timer").textContent = fmt(--left);
      if (left <= 0) { clearInterval(this.tick); this.begin(); }
    }, 1000);
  },
  async begin() {
    if (!useSR && !canRecord) { $("#sp-status").textContent = "This browser cannot use the microphone. Please update it or try another browser."; return; }
    this.live = useSR;
    clearInterval(this.tick);
    tts.stop();
    this.final = "";
    this.active = true;
    this.chunks = [];
    this.peak = 0; this.warned = false; this.micErr = ""; this.analyser = null;
    $("#sp-audio").hidden = true;
    $("#sp-stats").replaceChildren();
    $("#sp-feedback").replaceChildren();
    $("#sp-transcript").textContent = "";
    $("#sp-rec").textContent = "■ Stop";
    $("#sp-rec").classList.add("rec");
    $("#sp-status").textContent = this.live ? "Listening… speak now." : "Recording… speak now. Your transcript will appear when you stop.";

    // Record the answer for playback and fallback transcription
    // (phones can't share the mic between a recording and live speech recognition).
    const info = $("#sp-micinfo");
    if (isMobile && useSR) info.textContent = "The level meter and playback are not available on phones and tablets.";
    else if (!navigator.mediaDevices || !window.MediaRecorder) info.textContent = "This browser cannot open the microphone for the level meter.";
    else {
      info.textContent = "Waiting for the browser to open the microphone… if a permission prompt is showing, choose Allow.";
      try {
        const id = $("#sp-mic").value;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: id ? { deviceId: { exact: id } } : true });
        const track = stream.getAudioTracks()[0];
        info.textContent = `Microphone open: ${track && track.label || "unnamed device"}${track && track.muted ? " (muted by the system)" : ""}. Voice-to-text always uses your browser's default microphone.`;
        try {
          const devs = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === "audioinput" && d.deviceId);
          const cur = track && track.getSettings().deviceId;
          $("#sp-mic").replaceChildren(...devs.map(d => el("option", { value: d.deviceId, textContent: d.label || "Microphone" })));
          if (cur) $("#sp-mic").value = cur;
        } catch {}
        if (!this.active) { stream.getTracks().forEach(t => t.stop()); return; }
        const mr = this.media = new MediaRecorder(stream);
        this.mime = mr.mimeType;
        mr.ondataavailable = e => e.data.size && this.chunks.push(e.data);
        mr.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          if (!this.chunks.length) return;
          const a = $("#sp-audio");
          if (a.src) URL.revokeObjectURL(a.src);
          a.src = URL.createObjectURL(new Blob(this.chunks, { type: mr.mimeType }));
          a.hidden = false;
        };
        this.media.start();
        // Level meter, so the user can see whether sound is reaching the browser at all.
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        const an = this.ctx.createAnalyser();
        an.fftSize = 512;
        this.ctx.createMediaStreamSource(stream).connect(an);
        this.buf = new Uint8Array(an.fftSize);
        this.analyser = an;
      } catch (e) {
        this.media = null;
        this.micErr = e && e.name || "error";
        info.textContent = ({
          NotAllowedError: "Microphone blocked. Allow it for this site (icon at the left of the address bar) and in Windows Settings → Privacy & security → Microphone, then reload.",
          NotFoundError: "No microphone was found. Windows is not offering any input device to the browser: check Settings → System → Sound → Input.",
          NotReadableError: "The microphone is busy or disabled. Close other apps using it (Teams, Zoom, Discord) and try again.",
          OverconstrainedError: "That microphone is no longer available. Reload the page and pick another."
        })[this.micErr] || `The microphone could not be opened (${this.micErr}).`;
      }
    }

    if (this.live) {
    const rec = this.rec = new SR();
    rec.lang = $("#sp-lang").value;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = e => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) this.final += t.trim() + " "; else interim += t;
      }
      $("#sp-transcript").replaceChildren(this.final, el("span", { className: "interim", textContent: interim }));
    };
    rec.onerror = e => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (this.media && ["network", "service-not-allowed", "language-not-supported"].includes(e.error)) {
        // The built-in recogniser is unusable here: keep recording and transcribe at the end instead.
        useSR = this.live = false;
        this.rec = null;
        $("#sp-status").textContent = "Live transcript is not available in this browser. Keep speaking – your answer will be transcribed when you stop.";
        return;
      }
      const msg = { "not-allowed": "Microphone access was blocked. Allow the microphone for this site and try again.", "service-not-allowed": "Microphone access was blocked. Allow the microphone for this site and try again.", "audio-capture": "No microphone was found.", "network": "The speech recognition service could not be reached. It needs an internet connection and only works in Google Chrome, Microsoft Edge or Safari – not in Brave, Opera, Firefox or browsers built into other apps." }[e.error] || "Speech recognition error: " + e.error;
      this.stop(msg);
    };
    // Browsers end recognition after a pause; restart while the answer is still running.
    rec.onend = () => { if (this.active && this.rec === rec) { try { rec.start(); } catch {} } };
    try { rec.start(); } catch {}
    }

    this.start = Date.now();
    this.tick = setInterval(() => {
      const s = (Date.now() - this.start) / 1000;
      $("#sp-timer").textContent = fmt(s);
      if (this.analyser) {
        this.analyser.getByteTimeDomainData(this.buf);
        let m = 0;
        for (const v of this.buf) m = Math.max(m, Math.abs(v - 128) / 128);
        this.peak = Math.max(this.peak, m);
        $("#sp-meter").style.width = Math.min(100, m * 250) + "%";
      }
      if (s > 7 && !this.warned && !$("#sp-transcript").textContent.trim()) {
        this.warned = true;
        $("#sp-status").textContent =
          this.micErr ? `The microphone could not be opened (${this.micErr}). Check that a microphone is connected and not in use by another app.`
          : this.analyser && this.peak < 0.02 ? "No sound is reaching the browser. The wrong input device may be selected or the mic is muted: check Windows Settings → System → Sound → Input, and the microphone chosen in your browser's site settings."
          : !this.live ? $("#sp-status").textContent
          : this.analyser ? "Your microphone is working (see the level bar), but the live recogniser is returning nothing. Keep speaking – your recording will be transcribed when you stop."
          : "Nothing heard yet. Check that your microphone is not muted and that the right input device is selected.";
      }
      if (this.part === 2 && s >= 120) this.stop("Two minutes – time is up.");
    }, 100);
  },
  stop(message) {
    if (!this.active) return;
    this.active = false;
    clearInterval(this.tick);
    const secs = Math.max(1, (Date.now() - this.start) / 1000);
    const rec = this.rec;
    this.rec = null;
    try { rec && rec.stop(); } catch {}
    try { this.media && this.media.state !== "inactive" && this.media.stop(); } catch {}
    this.media = null;
    this.analyser = null;
    try { this.ctx && this.ctx.close(); } catch {}
    this.ctx = null;
    $("#sp-meter").style.width = "0";
    $("#sp-rec").textContent = "🎤 Start answering";
    $("#sp-rec").classList.remove("rec");
    $("#sp-status").textContent = message || "Answer finished.";
    // Give the recogniser a moment to deliver its last final result.
    setTimeout(() => this.finish(secs), 600);
  },
  async finish(secs) {
    let text = ($("#sp-transcript").textContent || "").trim();
    if (!text && this.chunks.length) {
      const say = t => { $("#sp-status").textContent = t; };
      const btn = $("#sp-rec");
      btn.disabled = true;
      say("Transcribing your answer on this device…");
      try {
        text = (await whisper.run(new Blob(this.chunks, { type: this.mime }), say)).replace(/\[[^\]]*\]|\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
        say("Answer finished.");
      } catch (e) {
        say(`Your answer could not be transcribed in this browser (${e.message}). You can still play it back below.`);
      }
      btn.disabled = false;
      if (this.active) return;
    }
    this.report(text, secs);
  },
  report(text, secs) {
    $("#sp-transcript").textContent = text;
    const words = text.toLowerCase().match(/[a-z0-9']+/g) || [];
    if (!words.length) {
      $("#sp-transcript").replaceChildren(el("span", { className: "muted", textContent: "No speech was detected. Check your microphone and try again." }));
      return;
    }
    const lower = " " + words.join(" ") + " ";
    const count = list => list.filter(p => lower.includes(" " + p + " "));
    const fillers = FILLERS.reduce((n, f) => n + (lower.split(" " + f + " ").length - 1), 0);
    const linkers = count(LINKERS);
    const wpm = Math.round(words.length / (secs / 60));
    const variety = Math.round(new Set(words).size / words.length * 100);
    const stats = [[fmt(secs), "duration"], [words.length, "words"], [wpm, "words / minute"], [variety + "%", "word variety"], [linkers.length, "linking phrases"], [fillers, "fillers"]];
    $("#sp-stats").replaceChildren(...stats.map(([v, l]) => el("div", { className: "stat" }, el("b", { textContent: v }), el("span", { textContent: l }))));

    const fb = [];
    const [lo, hi] = TARGET[this.part];
    if (words.length < lo) fb.push(["warn", `Your answer is short for Part ${this.part} (${words.length} words; aim for at least ${lo}). Add a reason or an example.`]);
    else if (words.length > hi && this.part === 1) fb.push(["warn", "That is quite long for Part 1. Keep answers to a few sentences so the examiner can move on."]);
    else fb.push(["good", `Good length for Part ${this.part}.`]);
    if (wpm < 90) fb.push(["warn", `Your pace is slow (${wpm} wpm). Long pauses lower your fluency score – keep talking, even if you need to rephrase.`]);
    else if (wpm > 180) fb.push(["warn", `You are speaking very fast (${wpm} wpm). Slow down a little so every word is clear.`]);
    else fb.push(["good", `Natural pace (${wpm} wpm). Fluent speakers are usually between 110 and 160.`]);
    if (linkers.length) fb.push(["good", `Linking phrases used: ${linkers.join(", ")}.`]);
    else fb.push(["warn", "No linking phrases found. Try “because”, “for example”, “however” or “on the other hand” to connect ideas."]);
    if (words.length >= 30 && variety < 50) fb.push(["warn", "You repeated many of the same words. Try synonyms or paraphrase the question."]);
    if (fillers >= 3) fb.push(["warn", `${fillers} filler phrases. Replace them with a short silent pause.`]);
    fb.push(["", "Read the transcript: any word that looks wrong may be one the software could not understand – a hint to check its pronunciation."]);
    $("#sp-feedback").replaceChildren(...fb.map(([c, t]) => el("li", { className: c, textContent: t })));

    const p = store.get();
    store.set({ answers: (p.answers || 0) + 1, speakSecs: Math.round((p.speakSecs || 0) + secs) });
  }
};
$("#sp-parts").addEventListener("click", e => { const b = e.target.closest("button"); if (b) speaking.setPart(+b.dataset.part); });
$("#sp-next").onclick = () => speaking.next();
$("#sp-hear").onclick = () => tts.play([["A", speaking.questionText()]], { lang: $("#sp-lang").value });
$("#sp-prep").onclick = () => speaking.prep();
$("#sp-rec").onclick = () => speaking.active ? speaking.stop() : speaking.begin();

/* ---------- listening ---------- */
const norm = s => s.toLowerCase().replace(/[£$,!?;"“”]/g, "").replace(/\.$/, "").replace(/\s+/g, " ").trim();
const listening = {
  test: null, plays: 0, checked: false,
  load(i) {
    tts.stop();
    const t = this.test = LISTENING[i];
    this.plays = 0; this.checked = false;
    $("#ls-kind").textContent = t.kind;
    $("#ls-intro").textContent = t.intro;
    $("#ls-status").textContent = "";
    $("#ls-score").textContent = "";
    $("#ls-bar").style.width = "0";
    $("#ls-play").disabled = false;
    $("#ls-script").hidden = $("#ls-script-btn").hidden = true;
    $("#ls-questions").replaceChildren(...t.questions.map((q, n) => {
      const li = el("li");
      if (q.opts) {
        li.append(q.q, el("div", { className: "opts" }, ...q.opts.map((o, k) =>
          el("label", {}, el("input", { type: "radio", name: "q" + n, value: k }), " " + o))));
      } else {
        li.append(el("label", { style: "color:inherit;font-size:1rem;flex-wrap:wrap" }, q.q + " ", el("input", { type: "text", name: "q" + n, autocomplete: "off", spellcheck: false })));
      }
      li.append(el("span", { className: "ans" }));
      return li;
    }));
  },
  play() {
    if (!tts.ok) { $("#ls-status").textContent = "Audio is not supported in this browser."; return; }
    const exam = $("#ls-exam").checked;
    if (exam && this.plays >= 1) return;
    this.plays++;
    if (exam) $("#ls-play").disabled = true;
    $("#ls-status").textContent = "Playing…";
    tts.play(this.test.lines, {
      rate: +$("#ls-rate").value,
      onProgress: (i, n) => { $("#ls-bar").style.width = (i / n * 100) + "%"; },
      onDone: () => { $("#ls-status").textContent = exam ? "Finished. Check your answers." : "Finished. You can play it again."; }
    });
  },
  check() {
    const t = this.test;
    let right = 0;
    $$("#ls-questions li").forEach((li, n) => {
      const q = t.questions[n], out = $(".ans", li);
      let ok, correct;
      if (q.opts) {
        const sel = $("input:checked", li);
        ok = !!sel && +sel.value === q.a;
        correct = q.opts[q.a];
      } else {
        const inp = $("input", li);
        ok = q.a.includes(norm(inp.value));
        correct = q.a[0];
        inp.className = ok ? "ok" : "no";
      }
      if (ok) right++;
      out.className = "ans " + (ok ? "ok" : "no");
      out.textContent = ok ? "✓" : "✗ " + correct;
    });
    $("#ls-score").textContent = `${right} / ${t.questions.length} correct`;
    $("#ls-script-btn").hidden = false;
    const saved = store.get().listening || {};
    const pct = Math.round(right / t.questions.length * 100);
    store.set({ listening: { ...saved, [t.title]: Math.max(pct, saved[t.title] || 0) } });
  },
  script() {
    const two = new Set(this.test.lines.map(l => l[0])).size > 1;
    const names = { A: "Agent", B: "Customer" };
    $("#ls-script").replaceChildren(el("h3", { textContent: "Transcript" }), ...this.test.lines.map(([w, t]) =>
      el("p", {}, ...(two ? [el("b", { textContent: names[w] + ": " })] : []), t)));
    $("#ls-script").hidden = false;
  }
};
$("#ls-test").append(...LISTENING.map((t, i) => el("option", { value: i, textContent: t.title })));
$("#ls-test").onchange = e => listening.load(+e.target.value);
$("#ls-play").onclick = () => listening.play();
$("#ls-stop").onclick = () => { tts.stop(); $("#ls-status").textContent = "Stopped."; };
$("#ls-exam").onchange = () => listening.load(+$("#ls-test").value);
$("#ls-form").onsubmit = e => { e.preventDefault(); listening.check(); };
$("#ls-script-btn").onclick = () => listening.script();

/* ---------- dictation ---------- */
const NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, thirtieth: "30th", "%": "percent" };
const toks = s => (s.toLowerCase().replace(/%/g, " percent ").match(/[a-z0-9']+/g) || []).map(w => String(NUM[w] ?? w));
const dictation = {
  order: [], pos: -1, total: 0, sum: 0,
  next() {
    if (++this.pos >= this.order.length || this.pos === 0 && !this.order.length) {
      this.order = DICTATION.map((_, i) => i).sort(() => Math.random() - 0.5);
      this.pos = 0;
    }
    $("#dc-count").textContent = `Sentence ${this.pos + 1} of ${this.order.length}`;
    $("#dc-input").value = "";
    $("#dc-diff").replaceChildren();
    $("#dc-score").textContent = "";
  },
  sentence() { return DICTATION[this.order[this.pos]]; },
  play(rate) {
    if (!tts.ok) { $("#dc-score").textContent = "Audio is not supported in this browser."; return; }
    tts.play([["A", this.sentence()]], { rate });
    $("#dc-input").focus();
  },
  check() {
    const target = this.sentence(), want = toks(target), got = toks($("#dc-input").value);
    // Longest common subsequence marks which target words were heard correctly.
    const m = want.length, n = got.length;
    const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--)
      d[i][j] = want[i] === got[j] ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]);
    const hit = new Array(m).fill(false);
    for (let i = 0, j = 0; i < m && j < n;) {
      if (want[i] === got[j]) { hit[i] = true; i++; j++; }
      else if (d[i + 1][j] >= d[i][j + 1]) i++; else j++;
    }
    const right = hit.filter(Boolean).length;
    const pct = Math.round(right / Math.max(m, n) * 100);
    const shown = target.replace(/[.,]/g, "").split(/\s+/);
    $("#dc-diff").replaceChildren(...shown.map((w, i) => el("span", { className: "tok " + (hit[i] ? "ok" : "no"), textContent: w })));
    $("#dc-score").textContent = pct === 100 ? "Perfect! 100%" : `${pct}% – missed words are underlined`;
    store.set({ dictBest: Math.max(pct, store.get().dictBest || 0) });
  }
};
$("#dc-play").onclick = () => dictation.play(0.95);
$("#dc-slow").onclick = () => dictation.play(0.65);
$("#dc-next").onclick = () => dictation.next();
$("#dc-form").onsubmit = e => { e.preventDefault(); dictation.check(); };

/* ---------- lessons: listen, repeat, compare ---------- */
// Which words of `want` appear, in order, in `got` (longest common subsequence).
function heard(want, got) {
  const m = want.length, n = got.length;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--)
    d[i][j] = want[i] === got[j] ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]);
  const hit = new Array(m).fill(false);
  for (let i = 0, j = 0; i < m && j < n;) {
    if (want[i] === got[j]) { hit[i] = true; i++; j++; }
    else if (d[i + 1][j] >= d[i][j + 1]) i++; else j++;
  }
  return hit;
}
const lessons = {
  cur: null, pos: 0, active: false, media: null, rec: null, final: "", chunks: [], timer: null,
  blobs: {},   // this visit's recordings, by sentence number
  marks: {},   // this visit's word-by-word results, by sentence number
  say(t) { $("#ln-status").textContent = t; },
  saved() { return store.get().lessons || {}; },
  lang() { return $("#sp-lang").value; },

  renderList() {
    const saved = this.saved();
    $("#lessons").replaceChildren(...LESSONS.map(l => {
      const vals = Object.values(saved[l.id] || {});
      const scored = vals.filter(v => v >= 0);
      const meta = !vals.length ? `${l.items.length} sentences`
        : `${vals.length}/${l.items.length} practised` + (scored.length ? ` · ${Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)}% clear` : "");
      const bar = el("i");
      bar.style.width = (vals.length / l.items.length * 100) + "%";
      const a = el("a", { className: "card", href: "#lesson" },
        el("div", { className: "q-meta", textContent: l.level }),
        el("h3", { textContent: l.title }),
        el("p", { textContent: l.blurb }),
        el("div", { className: "bar" }, bar),
        el("p", { className: "note", textContent: meta }));
      a.dataset.lesson = l.id;
      return a;
    }));
  },

  open(id) {
    const l = LESSONS.find(x => x.id === id);
    if (!l) return;
    this.cur = l;
    this.blobs = {};
    this.marks = {};
    const done = this.saved()[l.id] || {};
    const first = l.items.findIndex((_, i) => !(i in done));
    this.pos = first < 0 ? 0 : first;
    history.replaceState(null, "", "#lesson");
    showTab("lesson");
    this.show(true);
  },
  item() { return this.cur.items[this.pos]; },

  show(autoplay) {
    if (this.active) this.stop();
    tts.stop();
    const l = this.cur, it = this.item(), n = l.items.length;
    $("#ln-level").textContent = l.level;
    $("#ln-title").textContent = l.title;
    $("#ln-step").textContent = `${this.pos + 1} / ${n}`;
    $("#ln-bar").style.width = ((this.pos + 1) / n * 100) + "%";
    $("#ln-prompt").hidden = !it.q;
    $("#ln-q").textContent = it.q || "";
    this.renderText();
    const a = $("#ln-audio"), blob = this.blobs[this.pos];
    if (a.src) { URL.revokeObjectURL(a.src); a.removeAttribute("src"); }
    if (blob) a.src = URL.createObjectURL(blob);
    $("#ln-mine").hidden = !blob;
    $("#ln-compare").disabled = !blob;
    $("#ln-prev").disabled = this.pos === 0;
    $("#ln-next").textContent = this.pos === n - 1 ? "Finish lesson ✓" : "Next →";
    this.say("Listen to the model, then record yourself saying the same sentence.");
    if (autoplay && $("#ln-auto").checked) this.listen(0.95, true);
  },
  // The sentence, coloured word by word once a recording has been checked.
  renderText() {
    const it = this.item(), hit = this.marks[this.pos];
    const best = (this.saved()[this.cur.id] || {})[this.pos];
    if (!hit) {
      $("#ln-text").replaceChildren(it.a);
      $("#ln-score").textContent = best >= 0 ? `Best so far: ${best}%` : "";
      return;
    }
    let k = 0;
    $("#ln-text").replaceChildren(...it.a.split(/\s+/).map(w => {
      const n = toks(w).length, ok = hit.slice(k, k + n).every(Boolean);
      k += n;
      return el("span", { className: "tok " + (ok ? "ok" : "no"), textContent: w });
    }));
    const pct = Math.round(hit.filter(Boolean).length / hit.length * 100);
    $("#ln-score").textContent = pct === 100 ? "Every word was clear – 100%" : `${pct}% of the words were understood`;
  },

  listen(rate, withQuestion) {
    const it = this.item();
    const lines = withQuestion && it.q ? [["B", it.q], ["A", it.a]] : [["A", it.a]];
    this.say("Playing the model…");
    tts.play(lines, { rate, lang: this.lang(), onDone: () => this.say("Your turn: record yourself saying it.") });
  },
  // Model first, then your own recording, back to back.
  compare() {
    if (!this.blobs[this.pos]) return;
    const a = $("#ln-audio");
    a.pause();
    this.say("Model…");
    tts.play([["A", this.item().a]], { rate: 0.95, lang: this.lang(), onDone: () => {
      this.say("You…");
      a.currentTime = 0;
      a.onended = () => { a.onended = null; this.say("Hear a difference? Record again, or move on."); };
      a.play().catch(() => {});
    } });
  },

  async start() {
    if (!canRecord) { this.say("This browser cannot record from the microphone."); return; }
    tts.stop();
    $("#ln-audio").pause();
    this.active = true;
    this.chunks = [];
    this.final = "";
    const l = this.cur, pos = this.pos;
    let stream;
    try {
      const id = $("#sp-mic").value;
      stream = await navigator.mediaDevices.getUserMedia({ audio: id ? { deviceId: { exact: id } } : true });
    } catch (e) {
      this.active = false;
      this.say(e.name === "NotAllowedError" ? "Microphone blocked. Allow it for this site and try again."
        : e.name === "NotFoundError" ? "No microphone was found."
        : `The microphone could not be opened (${e.name}).`);
      return;
    }
    if (!this.active) { stream.getTracks().forEach(t => t.stop()); return; }
    const mr = this.media = new MediaRecorder(stream);
    mr.ondataavailable = e => e.data.size && this.chunks.push(e.data);
    mr.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      if (!this.chunks.length) { this.say("Nothing was recorded. Try again."); return; }
      const blob = new Blob(this.chunks, { type: mr.mimeType });
      if (l !== this.cur) return;
      this.blobs[pos] = blob;
      delete this.marks[pos];
      if (pos === this.pos) {
        const a = $("#ln-audio");
        if (a.src) URL.revokeObjectURL(a.src);
        a.src = URL.createObjectURL(blob);
        $("#ln-mine").hidden = false;
        $("#ln-compare").disabled = false;
      }
      setTimeout(() => this.score(blob, l, pos), 500); // let the live recogniser deliver its last words
    };
    mr.start();
    // Live recognition runs alongside the recording where the browser has it (desktop Chrome, Edge, Safari).
    if (useSR && !isMobile) {
      const rec = this.rec = new SR();
      rec.lang = this.lang();
      rec.continuous = true;
      rec.onresult = e => { for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) this.final += e.results[i][0].transcript + " "; };
      rec.onerror = e => { if (["network", "service-not-allowed", "language-not-supported"].includes(e.error)) useSR = false; };
      try { rec.start(); } catch {}
    }
    $("#ln-rec").textContent = "■ Stop";
    $("#ln-rec").classList.add("rec");
    this.say("Recording… say the sentence, then press Stop.");
    this.timer = setTimeout(() => this.stop(), 15000);
  },
  stop() {
    if (!this.active) return;
    this.active = false;
    clearTimeout(this.timer);
    try { this.rec && this.rec.stop(); } catch {}
    this.rec = null;
    try { this.media && this.media.state !== "inactive" && this.media.stop(); } catch {}
    this.media = null;
    $("#ln-rec").textContent = "🎤 Record";
    $("#ln-rec").classList.remove("rec");
  },
  async score(blob, l, pos) {
    const here = () => l === this.cur && pos === this.pos;
    let text = this.final.trim();
    if (!text && !useSR) {
      $("#ln-rec").disabled = true;
      try { text = (await whisper.run(blob, t => here() && this.say(t))).replace(/\[[^\]]*\]|\([^)]*\)/g, " ").trim(); } catch {}
      $("#ln-rec").disabled = false;
    }
    const all = this.saved(), done = { ...(all[l.id] || {}) };
    let pct = -1;
    if (text) {
      const want = toks(l.items[pos].a), hit = heard(want, toks(text));
      pct = Math.round(hit.filter(Boolean).length / want.length * 100);
      if (l === this.cur) this.marks[pos] = hit;
    }
    done[pos] = Math.max(pct, done[pos] ?? -1);
    store.set({ lessons: { ...all, [l.id]: done } });
    if (!here()) return;
    this.renderText();
    this.say(!text ? "Press Compare to hear the model and then yourself, back to back."
      : pct === 100 ? "Clear! Press Compare to check your rhythm and stress against the model."
      : "Underlined words were not recognised. Press Compare to hear the model and then yourself.");
  },

  next() {
    if (this.pos < this.cur.items.length - 1) { this.pos++; this.show(true); return; }
    history.replaceState(null, "", "#home");
    showTab("home");
  },
  prev() { if (this.pos > 0) { this.pos--; this.show(true); } }
};
document.addEventListener("click", e => {
  const c = e.target.closest("[data-lesson]");
  if (c) { e.preventDefault(); lessons.open(c.dataset.lesson); }
});
$("#ln-listen").onclick = () => lessons.listen(0.95);
$("#ln-slow").onclick = () => lessons.listen(0.65);
$("#ln-hear-q").onclick = () => tts.play([["B", lessons.item().q]], { lang: lessons.lang() });
$("#ln-rec").onclick = () => lessons.active ? lessons.stop() : lessons.start();
$("#ln-compare").onclick = () => lessons.compare();
$("#ln-next").onclick = () => lessons.next();
$("#ln-prev").onclick = () => lessons.prev();

/* ---------- start ---------- */
const missing = [];
if (!useSR && !canRecord) missing.push("microphone input");
if (!tts.ok) missing.push("audio playback");
$("#support").textContent = missing.length ? "This browser does not support " + missing.join(" or ") + "."
  : IN_APP ? "Offline app: everything runs on your phone. Spoken answers are transcribed after you stop."
  : !useSR ? "In this browser your spoken answers are transcribed after you stop, by a speech model that runs on your device (one-time download of about 80 MB)." : "";if (IN_APP) $$(".web-only").forEach(n => n.remove());
window.ieltsWhisper = whisper;
window.ieltsLessons = lessons;
renderProgress();
speaking.setPart(1);
listening.load(0);
dictation.next();
showTab(location.hash.slice(1) || "home");
})();
