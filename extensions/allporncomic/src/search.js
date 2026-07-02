load("config.js");

function execute(key, page) {
    if (!page) page = "1";
    var url = BASE_URL + "/page/" + page + "/?s=" + encodeURIComponent(key) + "&post_type=wp-manga";
    var res = fetch(url,{
        headers: {
            'user-agent': UserAgent.android()
        }
    });
    if (!res.ok) return Response.error("Search failed: " + res.status);

    var doc = res.html();
    var data = [];
    var seen = {};

    var items = doc.select("[id^=manga-item-], .page-item-detail, .c-tabs-item, article");
    if (items.size() === 0) {
        items = doc.select("div.post-title h3, div.post-title h5");
    }

    items.forEach(function (item) {
        var a = item.select("div.post-title h3 a, div.post-title h5 a, h3 a, h5 a").first();
        if (!a) return;
        var link = (a.attr("href") || "") + "";
        if (!link || seen[link]) return;
        seen[link] = true;
        if (!link.startsWith("http")) link = BASE_URL + link;

        var imgEl = item.select("img").first();
        var cover = imgEl ? ((imgEl.attr("data-src") || imgEl.attr("data-lazy-src") || imgEl.attr("src") || "") + "") : "";
        if (cover.startsWith("//")) cover = "https:" + cover;
        if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;

        data.push({
            name: a.text().trim() + "",
            link: link,
            cover: cover,
            description: "",
            host: BASE_URL
        });
    });

    var hasNext = doc.select("link[rel=next], .nav-next a, .next.page-numbers, a.next").size() > 0;
    return Response.success(data, hasNext ? String(parseInt(page) + 1) : null);
}
