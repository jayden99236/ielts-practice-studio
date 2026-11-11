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
    [p.answers || 0, "spoken answers"],
    [fmt(p.speakSecs || 0), "speaking time"],
    [best.length ? `${best.length}/${LISTENING.length}` : "0", "listening tests done"],
    [p.dictBest != null ? p.dictBest + "%" : "–", "best dictation"]
  ];
  $("#progress").replaceChildren(...items.map(([v, l]) => el("div", { className: "stat" }, el("b", { textContent: v }), el("span", { textContent: l }))));
}

/* ---------- tabs ---------- */
function showTab(id) {
  if (!$("#" + id + ".tab")) id = "home";
  $$(".tab").forEach(t => t.classList.toggle("on", t.id === id));
  $$("nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === id));
  tts.stop();
  if (speaking.active) speaking.stop();
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
const tts = {
  ok: "speechSynthesis" in window,
  voices: [],
  run: 0,
  load() {
    if (!this.ok) return;
    this.voices = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
  },
  voice(lang, index = 0) {
    const pref = this.voices.filter(v => v.lang.replace("_", "-") === lang);
    const pool = pref.length > index ? pref : [...pref, ...this.voices.filter(v => !pref.includes(v))];
    return pool[index % Math.max(pool.length, 1)];
  },
  stop() { this.run++; if (this.ok) speechSynthesis.cancel(); },
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
      const u = new SpeechSynthesisUtterance(text);
      const idx = speakers.indexOf(who);
      const v = this.voice(lang, idx);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang;
      u.rate = rate;
      u.pitch = idx && this.voices.length < 2 ? 1.35 : 1;
      u.onend = u.onerror = () => setTimeout(next, speakers.length > 1 ? 250 : 350);
      speechSynthesis.speak(u);
    };
    next();
  }
};
tts.load();
if (tts.ok) speechSynthesis.onvoiceschanged = () => tts.load();

/* ---------- speaking ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
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
    if (!SR) { $("#sp-status").textContent = "Voice input is not supported in this browser. Please use Chrome, Edge or Safari."; return; }
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
    $("#sp-status").textContent = "Listening… speak now.";

    // Keep a recording for playback on desktop (phones can't share the mic with speech recognition).
    const info = $("#sp-micinfo");
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) info.textContent = "The level meter and playback are not available on phones and tablets.";
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
        this.media = new MediaRecorder(stream);
        this.media.ondataavailable = e => e.data.size && this.chunks.push(e.data);
        this.media.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          if (!this.chunks.length) return;
          const a = $("#sp-audio");
          if (a.src) URL.revokeObjectURL(a.src);
          a.src = URL.createObjectURL(new Blob(this.chunks, { type: this.media.mimeType }));
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
      const msg = { "not-allowed": "Microphone access was blocked. Allow the microphone for this site and try again.", "service-not-allowed": "Microphone access was blocked. Allow the microphone for this site and try again.", "audio-capture": "No microphone was found.", "network": "The speech recognition service could not be reached. It needs an internet connection and only works in Google Chrome, Microsoft Edge or Safari – not in Brave, Opera, Firefox or browsers built into other apps." }[e.error] || "Speech recognition error: " + e.error;
      this.stop(msg);
    };
    // Browsers end recognition after a pause; restart while the answer is still running.
    rec.onend = () => { if (this.active && this.rec === rec) { try { rec.start(); } catch {} } };
    try { rec.start(); } catch {}

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
          : this.analyser ? "Your microphone is working (see the level bar), but the speech recogniser is returning nothing. Use Google Chrome or Microsoft Edge – it does not work in Brave, Opera, Firefox or in-app browsers."
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
    setTimeout(() => this.analyse(secs), 600);
  },
  analyse(secs) {
    const text = ($("#sp-transcript").textContent || "").trim();
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

/* ---------- start ---------- */
const missing = [];
if (!SR) missing.push("voice input (use Chrome, Edge or Safari for speaking practice)");
if (!tts.ok) missing.push("audio playback");
$("#support").textContent = missing.length ? "This browser does not support " + missing.join(" or ") + "." : "";
renderProgress();
speaking.setPart(1);
listening.load(0);
dictation.next();
showTab(location.hash.slice(1) || "home");
})();
