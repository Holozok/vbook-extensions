load("config.js");

function execute(url, page) {
    if (!page) page = "1";
    var pageUrl = url;
    if (pageUrl.indexOf("{{page}}") !== -1) {
        pageUrl = pageUrl.replace("{{page}}", page);
    } else {
        var parts = pageUrl.split("?");
        var base = parts[0];
        var qs = parts[1] ? "?" + parts[1] : "";
        base = base.replace(/\/page\/[0-9]+\//, "/");
        if (!/\/page\/$/.test(base)) {
            if (base.slice(-1) !== "/") base = base + "/";
            base = base + "page/" + page + "/";
        } else {
            base = base + page + '/';
        }
        pageUrl = base + qs;
    }

    var res = fetch(pageUrl,{
        headers: {
            'user-agent': UserAgent.android()
        }
    });
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();
    var data = [];
    var seen = {};

    var items = doc.select("[id^=manga-item-], .page-item-detail, .c-tabs-item, article");
    if (items.size() === 0) {
        items = doc.select("div.post-title h3, div.post-title h5");
    }

    items.forEach(function (item) {
        var linkEl = item.select("div.post-title h3 a, div.post-title h5 a, h3 a, h5 a").first();
        if (!linkEl) return;

        var link = (linkEl.attr("href") || "") + "";
        if (!link || seen[link]) return;
        seen[link] = true;
        if (!link.startsWith("http")) link = BASE_URL + link;

        var imgEl = item.select("img").first();
        var cover = "";
        if (imgEl) {
            cover = (imgEl.attr("data-src") || imgEl.attr("data-lazy-src") || imgEl.attr("src") || "") + "";
            if (cover.startsWith("//")) cover = "https:" + cover;
            if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;
        }

        data.push({
            name: (linkEl.text() || "").trim() + "",
            link: link,
            cover: cover,
            host: BASE_URL
        });
    });

    var nextSelectors = ["link[rel=next]", ".nav-next a", ".next.page-numbers", ".pagination a.next", "a.next"];
    var hasNext = false;
    for (var j = 0; j < nextSelectors.length; j++) {
        if (doc.select(nextSelectors[j]).size() > 0) { hasNext = true; break; }
    }
    return Response.success(data, hasNext ? String(parseInt(page) + 1) : null);
}
