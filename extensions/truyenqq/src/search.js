load('config.js');
function execute(key, page) {
    if (!page) page = '1';
    var url = BASE_URL + "/tim-kiem";
    if (page !== '1') url += "/trang-" + page;
    url += "?q=" + encodeURIComponent(key + "");

    var doc = loadPage(url);
    if (!doc) return Response.error("Cloudflare đang chặn, mở truyenqqko.com trong trình duyệt của app để xác minh rồi thử lại");

    var novelList = [];
    doc.select(".list_grid li").forEach(function (e) {
        var linkEl = e.select(".book_name a").first();
        if (!linkEl) return;
        var cover = e.select(".book_avatar img").attr("src") + "";
        if (cover.indexOf("//") === 0) {
            cover = "https:" + cover;
        } else if (cover && cover.indexOf("http") !== 0) {
            cover = BASE_URL + cover;
        }
        novelList.push({
            name: e.select(".book_name").text() + "",
            link: linkEl.attr("href") + "",
            description: e.select(".last_chapter").text() + "",
            cover: cover,
            host: BASE_URL
        });
    });

    return Response.success(novelList, nextPageToken(doc));
}

function nextPageToken(doc) {
    var nextEl = doc.select(".page_redirect a:has(p.active) + a").first();
    if (!nextEl) return "";
    var matched = (nextEl.attr("href") + "").match(/\/trang-(\d+)/);
    return matched ? matched[1] : "";
}
