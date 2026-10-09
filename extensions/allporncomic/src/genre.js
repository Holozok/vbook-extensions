load("config.js");

function execute() {
    var res = fetch(BASE_URL + "/genresa/", {   // hoặc /genres/
        headers: {
            'user-agent': UserAgent.android()
        }
    });
    
    if (!res.ok) return Response.error("Cannot load genres: " + res.status);

    var doc = res.html();
    var genres = [];
    var seen = {};

    // Selector chính xác: các thẻ <a> nằm trong .cat-item
    doc.select("li.cat-item a[href*='/porncomic-category/']").forEach(function (el) {
        var title = (el.text() || "").trim();
        var href = (el.attr("href") || "") + "";

        if (!title || !href || seen[href]) return;

        // Bỏ số đếm phía sau nếu có (ví dụ: "Milking (23)")
        title = title.replace(/\s*\(\d+[,.]?\d*\)$/, "").trim();

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