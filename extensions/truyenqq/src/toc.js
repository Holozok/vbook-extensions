load('config.js');
function execute(url) {
    url = normalizeUrl(url);

    var doc = loadPage(url);
    if (!doc) return Response.error("Cloudflare đang chặn, mở truyenqqko.com trong trình duyệt của app để xác minh rồi thử lại");

    var list = [];
    var el = doc.select(".works-chapter-list a");
    for (var i = el.size() - 1; i >= 0; i--) {
        var e = el.get(i);
        list.push({
            name: e.text() + "",
            url: e.attr("href") + "",
            host: BASE_URL
        });
    }
    return Response.success(list);
}