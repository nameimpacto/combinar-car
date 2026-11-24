package br.com.marcelomonteiro.app;

import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.net.URISyntaxException;

/**
 * Opens navigation and other external links outside the WebView.
 *
 * The original wrapper used a plain WebViewClient, so an intent:// URL
 * was loaded as a web page and failed with ERR_UNKNOWN_URL_SCHEME.
 * This client intercepts intent://, waze://, geo: and similar schemes,
 * and https links to Waze / Google Maps, and launches them with an
 * external ACTION_VIEW intent so the installed app opens.
 * Everything else (the local prototype, map tiles, routing) keeps
 * loading inside the WebView.
 */
public class ExternalLinksWebViewClient extends WebViewClient {

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        return handleUrl(view, url);
    }

    // No @Override: this overload exists only from API 24, while the
    // compile stub is API 23. At runtime on API 24+ the WebView
    // dispatches to this signature, and it delegates to handleUrl.
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        if (request == null || !request.isForMainFrame()) {
            return false;
        }
        return handleUrl(view, request.getUrl().toString());
    }

    private boolean handleUrl(WebView view, String url) {
        if (url == null) {
            return false;
        }
        if (url.startsWith("intent://")) {
            return handleIntentUrl(view, url);
        }
        Uri uri = Uri.parse(url);
        String scheme = uri.getScheme();
        if (scheme == null) {
            return false;
        }
        if ("http".equals(scheme) || "https".equals(scheme)) {
            String host = uri.getHost();
            if (host == null) {
                return false;
            }
            host = host.toLowerCase();
            boolean isWaze = host.equals("waze.com") || host.endsWith(".waze.com");
            boolean isMaps = host.equals("google.com") || host.endsWith(".google.com")
                    || host.equals("maps.google.com") || host.endsWith(".maps.google.com");
            if (isWaze || (isMaps && url.contains("/maps/"))) {
                return openExternal(view, url);
            }
            return false;
        }
        if ("file".equals(scheme) || "data".equals(scheme) || "about".equals(scheme)
                || "javascript".equals(scheme)) {
            return false;
        }
        // waze://, geo:, google.navigation:, tel:, mailto: and any other
        // non-web scheme: hand it to the system instead of the WebView.
        return openExternal(view, url);
    }

    private boolean handleIntentUrl(WebView view, String url) {
        try {
            Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
            if (intent.getAction() == null) {
                intent.setAction(Intent.ACTION_VIEW);
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            view.getContext().startActivity(intent);
            return true;
        } catch (URISyntaxException e) {
            return true;
        } catch (ActivityNotFoundException e) {
            String fallback = null;
            try {
                Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                fallback = intent.getStringExtra("browser_fallback_url");
            } catch (URISyntaxException ignored) {
                // fall through to the web fallback below
            }
            if (fallback != null && !fallback.isEmpty()) {
                view.loadUrl(fallback);
            }
            return true;
        }
    }

    private boolean openExternal(WebView view, String url) {
        Context context = view.getContext();
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            return true;
        } catch (ActivityNotFoundException e) {
            // No app can handle it: keep the prototype visible instead of
            // showing a WebView error page for an unknown scheme.
            return true;
        }
    }
}
