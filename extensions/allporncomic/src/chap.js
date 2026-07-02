load("config.js");

function cleanImageUrl(url) {
    url = (url || "") + "";
    url = url.trim();
    if (!url) return "";
    var matches = url.match(/https?:\/\/[^\s"']+/g);
    if (matches && matches.length > 0) {
        url = matches[matches.length - 1];
    } else if (url.indexOf(" ") > -1) {
        var parts = url.split(/\s+/);
        url = parts[parts.length - 1];
    }
    if (url.indexOf("//") === 0) {
        url = "https:" + url;
    } else if (url && !url.startsWith("http")) {
        url = BASE_URL + url;
    }
    return url;
}

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    let doc = fetch(url, {
        headers: {
            'user-agent': UserAgent.android()
        }
    }).html();

    if (doc) {
        let imgs = doc.select(".chapter_content img.lazy, .chapter_content img, .reading-content img, .chapter-content img, #chapter-images img, .page-chapter img");
        let data = [];
        for (let i = 0; i < imgs.size(); i++) {
            let e = imgs.get(i);
            let link = cleanImageUrl(e.attr("data-original") || e.attr("data-src") || e.attr("data-lazy-src") || e.attr("src"));
            let fallback = cleanImageUrl(e.attr("src") || e.attr("data-original") || e.attr("data-src") || e.attr("data-lazy-src"));
            data.push({
                link: link,
                fallback: [fallback]
            });
        }
        if (data.length > 0) return Response.success(data);
    }
    return null;
}
