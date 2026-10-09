load("config.js");

function execute(key, page) {
    if (!page) page = "1";
    var url = BASE_URL + "/page/" + page + "/?s=" + encodeURIComponent(key) + "&post_type=wp-manga";
    
    var res = fetch(url, {
        headers: {
            'user-agent': UserAgent.android()
        }
    });
    
    if (!res.ok) return Response.error("Search failed: " + res.status);

    var doc = res.html();
    var data = [];
    var seen = {};

    // Selector chính xác theo cấu trúc allporncomic
    var items = doc.select(".c-tabs-item__content");

    items.forEach(function (item) {
        var linkEl = item.select(".post-title a").first();
        if (!linkEl) return;

        var link = (linkEl.attr("href") || "") + "";
        if (!link || seen[link]) return;
        seen[link] = true;
        
        if (!link.startsWith("http")) link = BASE_URL + link;

        // Lấy cover
        var imgEl = item.select(".tab-thumb img").first();
        var cover = "";
        if (imgEl) {
            cover = (imgEl.attr("data-src") || imgEl.attr("data-lazy-src") || imgEl.attr("src") || "") + "";
            if (cover.startsWith("//")) cover = "https:" + cover;
            if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;
            // Bỏ qua ảnh lazy mặc định
            if (cover.indexOf("dflazy") !== -1) cover = "";
        }

        data.push({
            name: (linkEl.text() || "").trim() + "",
            link: link,
            cover: cover,
            host: BASE_URL
        });
    });

    // Kiểm tra trang tiếp theo
    var hasNext = doc.select(".wp-pagenavi a.nextpostslink, .wp-pagenavi a.next, a.nextpostslink").size() > 0;
    
    return Response.success(data, hasNext ? String(parseInt(page) + 1) : null);
}