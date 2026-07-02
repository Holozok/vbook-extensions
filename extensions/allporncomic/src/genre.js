load("config.js");

function execute() {
    var res = fetch(BASE_URL + "/porncomic/",{
        headers: {
            'user-agent': UserAgent.android()
        }
    });
    if (!res.ok) return Response.error("Cannot load genres: " + res.status);

    var doc = res.html();
    var genres = [];
    var seen = {};

    doc.select("a[href*='/porncomic-genre/'], a[href*='/porncomic-cat/']").forEach(function (el) {
        var title = (el.text() || "").trim();
        var href = (el.attr("href") || "") + "";
        if (!title || !href || seen[href]) return;
        if (!href.startsWith("http")) href = BASE_URL + href;
        seen[href] = true;
        genres.push({
            title: title,
            input: href,
            script: "gen.js"
        });
    });

    return Response.success(genres);
}
