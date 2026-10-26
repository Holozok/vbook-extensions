load('config.js');
load('gen.js');

function execute(url) {
    url = normalizeUrl(url);
    let id = mangaIdFromUrl(url);
    if (!id) return Response.error("URL không hợp lệ");

    let result = apiJson(API_BASE + "/manga/" + id + "?includes[]=cover_art&includes[]=author&includes[]=artist&includes[]=tag");
    if (!result.ok) return Response.error("MangaDex HTTP " + result.status);

    let manga = result.json.data;
    if (!manga) return Response.error("Không tìm thấy truyện");

    let attrs = manga.attributes || {};
    let prefs = langPrefs();
    let name = pickLang(attrs.title, prefs);
    if (!name) name = pickAltTitle(attrs.altTitles, prefs);

    let cover = "";
    let authors = [];
    let artists = [];
    let relationships = manga.relationships || [];
    for (let i = 0; i < relationships.length; i++) {
        let rel = relationships[i];
        if (rel.type === "cover_art" && rel.attributes) {
            cover = coverFile(manga.id, rel.attributes.fileName);
        } else if (rel.type === "author" && rel.attributes) {
            authors.push(rel.attributes.name);
        } else if (rel.type === "artist" && rel.attributes) {
            artists.push(rel.attributes.name);
        }
    }

    let tagItems = [];
    let tagNames = [];
    let tags = attrs.tags || [];
    for (let j = 0; j < tags.length; j++) {
        let tagName = pickLang(tags[j].attributes ? tags[j].attributes.name : null, prefs);
        if (!tagName) continue;
        tagNames.push(tagName);
        tagItems.push({ title: tagName, input: "@tag:" + tags[j].id, script: "search.js" });
    }

    let lines = [];
    lines.push("Tình trạng: " + statusLabel(attrs.status));
    if (attrs.year) lines.push("Năm: " + attrs.year);
    if (attrs.contentRating) lines.push("Phân loại: " + attrs.contentRating);
    if (authors.length) lines.push("Tác giả: " + authors.join(", "));
    if (artists.length) lines.push("Họa sĩ: " + artists.join(", "));
    if (tagNames.length) lines.push("Thể loại: " + tagNames.join(", "));
    if (attrs.lastChapter) lines.push("Chương mới nhất: " + attrs.lastChapter);

    return Response.success({
        name: name,
        author: authors.join(", "),
        cover: cover,
        description: pickLang(attrs.description, prefs),
        detail: lines.join("\n"),
        url: siteUrl("/title/" + id),
        type: "comic",
        format: "comic",
        ongoing: attrs.status !== "completed",
        nsfw: attrs.contentRating === "erotica" || attrs.contentRating === "pornographic",
        locale: prefs.length > 0 ? prefs[0] : "global",
        tags: tagItems
    });
}
