load('config.js');
load('gen.js');

// query: a keyword, or a tab token from explore/genre: "@popular", "@new",
// "@updated", "@tag:<uuid>". page: the offset token returned in data2.
function execute(query, page) {
    query = String(query || "");
    let offset = parseInt(page || "0", 10);
    if (isNaN(offset) || offset < 0) offset = 0;

    let params = [];
    let browsing = false;

    if (query.indexOf("@tag:") === 0) {
        browsing = true;
        params.push("includedTags[]=" + encodeURIComponent(query.substring(5)));
        params.push("order[followedCount]=desc");
    } else if (query.indexOf("@") === 0) {
        browsing = true;
        let mode = query.substring(1);
        if (mode === "new") {
            params.push("order[createdAt]=desc");
        } else if (mode === "updated") {
            params.push("order[latestUploadedChapter]=desc");
        } else {
            params.push("order[followedCount]=desc");
        }
    } else if (query) {
        params.push("title=" + encodeURIComponent(query));
        params.push("order[relevance]=desc");
    } else {
        params.push("order[followedCount]=desc");
    }

    if (browsing) params.push("hasAvailableChapters=true");

    params.push("limit=" + PAGE_SIZE);
    params.push("offset=" + offset);
    params.push("includes[]=cover_art");
    let ratings = contentRatingParams();
    for (let i = 0; i < ratings.length; i++) params.push(ratings[i]);

    let result = apiJson(API_BASE + "/manga?" + params.join("&"));
    if (!result.ok) return Response.error("MangaDex HTTP " + result.status);

    let data = result.json.data || [];
    let items = [];
    for (let j = 0; j < data.length; j++) items.push(mangaItem(data[j]));

    let total = parseInt(result.json.total || "0", 10);
    if (isNaN(total)) total = 0;
    let next = "";
    if (data.length > 0 && offset + data.length < total) {
        next = String(offset + data.length);
    }

    return Response.success(items, next);
}
