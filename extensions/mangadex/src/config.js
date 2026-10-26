// Site base URL. Hardcoded default; the injected DOMAIN setting overrides it.
let BASE_URL = "https://mangadex.org";
try {
    if (DOMAIN) {
        BASE_URL = String(DOMAIN).replace(/"/g, "").trim();
    }
} catch (error) {
}

// Rewrite an incoming url's host to BASE_URL, keeping path/query.
function normalizeUrl(url) {
    return String(url || "").replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
}
