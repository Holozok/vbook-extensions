load('config.js');

function execute(url) {
    url = normalizeUrl(url);
    var doc = loadPage(url);
    if (!doc) return Response.error("Cloudflare đang chặn, mở truyenqqko.com trong trình duyệt của app để xác minh rồi thử lại");

    // Same guard: a blocked page is HTML but has no reader block, so check the container
    // instead of relying only on the Cloudflare title.
    if (doc.select(".chapter_content").size() === 0) {
        return Response.error("Không đọc được nội dung chương (trang bị Cloudflare chặn hoặc cookie đã hết hạn). Mở truyenqqko.com trong trình duyệt của app để xác minh rồi thử lại");
    }

    var imgs = doc.select(".chapter_content img.lazy");
    var data = [];
    for (var i = 0; i < imgs.size(); i++) {
        var e = imgs.get(i);
        var link = cdnUrl(e.attr("data-original"));
        if (!link) link = cdnUrl(e.attr("src"));
        if (!link) continue;
        var fallback = cdnUrl(e.attr("data-cdn"));
        var item = {
            link: link,
            script: "image.js"
        };
        if (fallback && fallback !== link) {
            item.fallback = [fallback];
        }
        data.push(item);
    }
    if (data.length === 0) return Response.error("No images");
    return Response.success(data);
}

function cdnUrl(link) {
    link = (link || "") + "";
    if (!link) return "";
    if (link.indexOf("data:") === 0) return "";
    if (link.indexOf("//") === 0) {
        link = "https:" + link;
    } else if (link.indexOf("/") === 0) {
        link = BASE_URL + link;
    } else if (link.indexOf("http") !== 0) {
        return "";
    }
    if (link.indexOf("mangaqq.net") > -1 || link.indexOf("cdnqq.xyz") > -1) {
        link = link.replace("mangaqq.net", "i200.truyenvua.com");
        link = link.replace("cdnqq.xyz", "i200.truyenvua.com");
    } else if (link.indexOf("mangaqq.com") > -1) {
        link = link.replace("mangaqq.com", "i216.truyenvua.com");
    } else if (link.indexOf("trangshop.net") > -1 || link.indexOf("photruyen.com") > -1 || link.indexOf("tintruyen.com") > -1) {
        link = link.replace("photruyen.com", "i109.truyenvua.com");
        link = link.replace("tintruyen.com", "i109.truyenvua.com");
        link = link.replace("trangshop.net", "i109.truyenvua.com");
    } else if (link.indexOf("tintruyen.net") > -1) {
        link = link.replace("//tintruyen.net", "//i138.truyenvua.com");
        link = link.replace("//i125.tintruyen.net", "//i125.truyenvua.com");
    } else if (link.indexOf("qqtaku.com") > -1) {
        link = link.replace("qqtaku.com", "i125.truyenvua.com");
    }
    return link;
}
