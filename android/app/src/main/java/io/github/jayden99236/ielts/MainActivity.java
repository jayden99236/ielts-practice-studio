package io.github.jayden99236.ielts;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Shows the practice site from files bundled in the APK. Nothing is loaded from the internet:
 * every request to the app's own address is answered from the assets folder.
 */
public class MainActivity extends Activity {
    // A real https address makes the page a "secure context", which the microphone API requires.
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/index.html";
    private static final int MIC_REQUEST = 1;

    private WebView web;
    private TextToSpeech tts;
    private boolean ttsReady;
    private final List<Runnable> ttsQueue = new ArrayList<>();
    private PermissionRequest pendingMic;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String scheme = request.getUrl().getScheme();
                if (!"https".equals(scheme) && !"http".equals(scheme)) return null; // blob: and data: (recordings)
                if (!HOST.equals(request.getUrl().getHost())) {
                    // Offline app: block anything that is not one of our own files.
                    return new WebResourceResponse("text/plain", "utf-8", 403, "Blocked", new HashMap<>(),
                            new ByteArrayInputStream(new byte[0]));
                }
                String path = request.getUrl().getPath();
                if (path == null || path.equals("/")) path = "/index.html";
                Map<String, String> headers = new HashMap<>();
                headers.put("Access-Control-Allow-Origin", "*");
                headers.put("Cross-Origin-Opener-Policy", "same-origin");
                headers.put("Cross-Origin-Embedder-Policy", "require-corp");
                try {
                    InputStream in = getAssets().open("www" + path);
                    return new WebResourceResponse(mime(path), text(path) ? "utf-8" : null, 200, "OK", headers, in);
                } catch (IOException e) {
                    return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", headers,
                            new ByteArrayInputStream(new byte[0]));
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !HOST.equals(request.getUrl().getHost()); // stay inside the app
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                boolean wantsMic = false;
                for (String r : request.getResources()) {
                    if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)) wantsMic = true;
                }
                if (!wantsMic) { request.deny(); return; }
                if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                    request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                } else {
                    pendingMic = request;
                    requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, MIC_REQUEST);
                }
            }
        });

        tts = new TextToSpeech(this, status -> {
            ttsReady = status == TextToSpeech.SUCCESS;
            runOnUiThread(() -> {
                for (Runnable r : ttsQueue) r.run();
                ttsQueue.clear();
            });
        });
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) { }
            @Override public void onDone(String id) { done(id); }
            @Override public void onError(String id) { done(id); }
            @Override public void onStop(String id, boolean interrupted) { }
        });

        web.addJavascriptInterface(new TtsBridge(), "AndroidTTS");
        if (state == null) web.loadUrl(START); else web.restoreState(state);
    }

    /** Tells the page that a sentence has finished so it can play the next one. */
    private void done(String id) {
        runOnUiThread(() -> web.evaluateJavascript("window.__ttsDone && window.__ttsDone('" + id + "')", null));
    }

    /** Called from the page's JavaScript as window.AndroidTTS. */
    private class TtsBridge {
        @JavascriptInterface
        public void speak(final String text, final float rate, final float pitch, final String lang, final String id) {
            runOnUiThread(() -> {
                Runnable job = () -> {
                    if (!ttsReady) { done(id); return; }
                    Locale want = Locale.forLanguageTag(lang);
                    if (tts.isLanguageAvailable(want) < TextToSpeech.LANG_AVAILABLE) want = Locale.US;
                    if (tts.isLanguageAvailable(want) < TextToSpeech.LANG_AVAILABLE) want = Locale.ENGLISH;
                    tts.setLanguage(want);
                    tts.setSpeechRate(rate);
                    tts.setPitch(pitch);
                    if (tts.speak(text, TextToSpeech.QUEUE_ADD, null, id) != TextToSpeech.SUCCESS) done(id);
                };
                // The speech engine takes a moment to start; hold requests until it is ready.
                if (ttsReady) job.run(); else ttsQueue.add(job);
            });
        }

        @JavascriptInterface
        public void stop() {
            runOnUiThread(() -> {
                ttsQueue.clear();
                if (tts != null) tts.stop();
            });
        }
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] permissions, int[] results) {
        if (code != MIC_REQUEST || pendingMic == null) return;
        if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) {
            pendingMic.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
        } else {
            pendingMic.deny();
        }
        pendingMic = null;
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (tts != null) tts.stop();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        web.destroy();
        super.onDestroy();
    }

    private static boolean text(String path) {
        return path.endsWith(".html") || path.endsWith(".js") || path.endsWith(".mjs")
                || path.endsWith(".css") || path.endsWith(".json");
    }

    private static String mime(String path) {
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".js") || path.endsWith(".mjs")) return "text/javascript";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".json")) return "application/json";
        if (path.endsWith(".wasm")) return "application/wasm";
        return "application/octet-stream";
    }
}
