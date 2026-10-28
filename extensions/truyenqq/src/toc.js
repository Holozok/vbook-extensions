load('config.js');
function execute(url) {
    url = normalizeUrl(url);

    var doc = loadPage(url);
    if (!doc) return Response.error("Cloudflare đang chặn, mở truyenqqko.com trong trình duyệt của app để xác minh rồi thử lại");

    // A blocked/expired-cookie response can still be HTML without the TOC block. Returning
    // an empty list there makes the app report a "successful" download with no chapters.
    if (doc.select(".works-chapter-list").size() === 0) {
        return Response.error("Không đọc được mục lục (trang bị Cloudflare chặn hoặc cookie đã hết hạn). Mở truyenqqko.com trong trình duyệt của app để xác minh rồi thử lại");
    }

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