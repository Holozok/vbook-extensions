load('config.js');
function execute(url) {
    url = normalizeUrl(url);
    var res = fetch(url);
    if (!res.ok) return Response.error("HTTP " + res.status);
    var doc = res.html();
    if (isCloudflareChallenge(doc)) return Response.error("Cloudflare đang chặn, mở truyenqqko.com trong trình duyệt của app để xác minh rồi thử lại");

    var coverEl = doc.select(".book_avatar img").first();
    var cover = coverEl ? (coverEl.attr("src") || "") + "" : "";
    if (cover.indexOf("//") === 0) {
        cover = "https:" + cover;
    } else if (cover && cover.indexOf("http") !== 0) {
        cover = BASE_URL + cover;
    }

    var status = doc.select(".book_info .list-info .status .col-xs-9").text() + "";

    var genres = [];
    doc.select(".list01 .li03 a").forEach(function (e) {
        genres.push({
            title: e.text() + "",
            input: (e.attr('href') + "").replace(/^https?:\/\/[^\/]+/, ''),
            script: "gen.js"
        });
    });

    return Response.success({
        name: doc.select("h1[itemprop=name]").text() + "",
        cover: cover,
        host: BASE_URL,
        author: doc.select(".book_info .list-info .author a.org").text() + "",
        description: doc.select("div.story-detail-info").html(),
        detail: 'Tên khác: ' + doc.select(".book_info .list-info .othername .other-name").text() +
        '<br>Tác giả: ' + doc.select(".book_info .list-info .author a.org").text() +
        '<br>Tình trạng: ' + status +
        '<br>Lượt thích: ' + doc.select(".book_info .list-info .row .number-like").text() +
        '<br>Lượt theo dõi: ' + doc.select(".book_info .list-info .row:nth-last-child(2) .col-xs-9").text() +
        '<br>Lượt xem: ' + doc.select(".book_info .list-info .row:nth-last-child(1) .col-xs-9").text(),
        ongoing: status.indexOf("Hoàn") === -1 && status.indexOf("Full") === -1,
        genres: genres
    });
}