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

// On iOS the Cloudflare clearance cookie lives only in the in-app WebView store, so a
// plain fetch stays blocked (403). Fall back to the browser engine, which shares the
// cookies of the browser the user verified the challenge in.
function loadPage(url) {
    var res = fetch(url);
    if (res.ok) {
        var doc = res.html();
        if (!isCloudflareChallenge(doc)) return doc;
    } else if (res.status !== 403) {
        return null;
    }

    var browser = null;
    var browserDoc = null;
    try {
        browser = Engine.newBrowser();
        browserDoc = browser.launch(url, 30000);
    } catch (e) {
        browserDoc = null;
    }
    try {
        if (browser) browser.close();
    } catch (e) {
    }
    if (browserDoc && !isCloudflareChallenge(browserDoc)) return browserDoc;
    return null;
}