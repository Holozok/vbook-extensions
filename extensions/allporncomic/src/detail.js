load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    if (url.slice(-1) === "/") url = url.slice(0, -1);
    var res = fetch(url,{
        headers: {
            'user-agent': UserAgent.android()
        }
    });
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();

    var name = (doc.select("meta[property=og:title]").attr("content") || "").trim();
    if (!name) {
        var nameEl = doc.select("h1").first();
        name = (nameEl ? nameEl.text() : "") + "";
    }

    var coverEl = doc.select("meta[property=og:image], div.summary_image img, .summary_image img").first();
    var cover = "";
    if (coverEl) {
        cover = (coverEl.attr("data-src") || coverEl.attr("src") || "") + "";
        if (!cover) cover = (coverEl.attr("content") || "") + "";
        if (cover.startsWith("//")) cover = "https:" + cover;
        if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;
    }

    var author = "";
    var authorEls = doc.select(".author-content a");
    authorEls.forEach(function (el) {
        var text = (el.text() || "").trim();
        if (!text) return;
        if (author) author += ", ";
        author += text;
    });

    var statusEl = doc.select(".post-status .summary-content, .summary .status .summary-content, .post-status, .summary .status").first();
    var status = (statusEl ? statusEl.text() : "") + "";
    var ongoing = status.indexOf("Completed") === -1 && status.indexOf("Complete") === -1 && status.indexOf("Hoàn") === -1;

    var description = (doc.select("meta[property=og:description]").attr("content") || "").trim();
    if (!description) {
        var descEl = doc.select("div.summary__content, .summary .summary-content, .post-content, .entry-content, .description, .entry").first();
        description = (descEl ? descEl.html() : "") + "";
    }

    var genres = [];
    var seen = {};
    doc.select("a[href*='/porncomic-genre/'], a[href*='/porncomic-cat/'], .genres-content a, .genres a").forEach(function (el) {
        var gTitle = el.text() + "";
        var gHref = (el.attr("href") || "") + "";
        if (!gTitle || !gHref || seen[gHref]) return;
        if (!gHref.startsWith("http")) gHref = BASE_URL + gHref;
        seen[gHref] = true;
        genres.push({ title: gTitle, input: gHref, script: "gen.js" });
    });

    return Response.success({ name: name, cover: cover, host: BASE_URL, author: author, description: description, ongoing: ongoing, genres: genres });
}
