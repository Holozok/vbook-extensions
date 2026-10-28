let BASE_URL = 'https://truyenqqko.com';
try {
    if (DOMAIN) {
        BASE_URL = DOMAIN;
    }
} catch (error) {
}

function normalizeUrl(url) {
    return (url + "").replace(/^(?:https?:\/\/)?(?:[^@\n\/]+@)?(?:www\.)?[^:\/\n?#]+/i, BASE_URL);
}

// Cloudflare serves its challenge page with status 200, so the parse would silently
// return an empty list. Detect it and surface an actionable error instead.
function isCloudflareChallenge(doc) {
    var title = doc.select("title").text() + "";
    return title.indexOf("Just a moment") > -1 || title.indexOf("Attention Required") > -1;
}