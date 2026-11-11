#!/usr/bin/env bash
# Copies the site into a folder and downloads everything it needs to run with no internet:
# the speech-to-text library, its WebAssembly runtime, and the Whisper tiny (English) model.
# Usage: android/fetch-assets.sh <output-folder>     (run from the repository root)
set -euo pipefail
out="${1:?output folder}"
ver=3.8.1
model=Xenova/whisper-tiny.en

mkdir -p "$out/vendor" "$out/models/$model/onnx"
cp index.html styles.css data.js lessons.js app.js whisper-worker.js "$out/"

get() { [ -s "$2" ] || curl -fsSL --retry 3 -o "$2" "$1"; }

for f in transformers.min.js ort-wasm-simd-threaded.jsep.mjs ort-wasm-simd-threaded.jsep.wasm; do
  get "https://cdn.jsdelivr.net/npm/@huggingface/transformers@$ver/dist/$f" "$out/vendor/$f"
done
for f in config.json generation_config.json preprocessor_config.json tokenizer.json tokenizer_config.json \
         onnx/encoder_model_quantized.onnx onnx/decoder_model_merged_quantized.onnx; do
  get "https://huggingface.co/$model/resolve/main/$f" "$out/models/$model/$f"
done
du -sh "$out"
