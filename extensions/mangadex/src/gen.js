// Shared MangaDex API helpers. Loaded after config.js; it must not load other files.
var API_BASE = "https://api.mangadex.org";
var UPLOADS_BASE = "https://uploads.mangadex.org";
var USER_AGENT = "vBook-Ext-MangaDex/1.0";
var PAGE_SIZE = 24;
var FEED_LIMIT = 500;

function langPrefs() {
    let raw = "";
    try {
        raw = String(LANGUAGE || "");
    } catch (error) {
        raw = "";
    }
    let parts = raw.split(",");
    let list = [];
    for (let i = 0; i < parts.length; i++) {
        let code = parts[i].trim().toLowerCase();
        if (code) list.push(code);
    }
    return list;
}

function contentRatingParams() {
    return [
        "contentRating[]=safe",
        "contentRating[]=suggestive",
        "contentRating[]=erotica"
    ];
}

function siteUrl(path) {
    let base = BASE_URL;
    while (base.length > 1 && base.charAt(base.length - 1) === "/") {
        base = base.substring(0, base.length - 1);
    }
    return base + path;
}

function apiJson(url) {
    let response = fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        timeout: 30000
    });
    if (!response.ok) return { ok: false, status: response.status };
    try {
        return { ok: true, status: response.status, json: response.json() };
    } catch (error) {
        return { ok: false, status: response.status };
    }
}

function mangaIdFromUrl(url) {
    let match = String(url || "").match(/\/title\/([0-9a-fA-F-]{36})/);
    return match ? match[1] : "";
}

function chapterIdFromUrl(url) {
    let match = String(url || "").match(/\/chapter\/([0-9a-fA-F-]{36})/);
    return match ? match[1] : "";
}

function pickLang(map, prefs) {
    if (!map) return "";
    for (let i = 0; i < prefs.length; i++) {
        let value = map[prefs[i]];
        if (value) return String(value);
    }
    let keys = Object.keys(map);
    for (let j = 0; j < keys.length; j++) {
        if (map[keys[j]]) return String(map[keys[j]]);
    }
    return "";
}

function pickAltTitle(altTitles, prefs) {
    if (!altTitles) return "";
    for (let i = 0; i < altTitles.length; i++) {
        let value = pickLang(altTitles[i], prefs);
        if (value) return value;
    }
    return "";
}

function coverFile(mangaId, fileName) {
    if (!fileName) return "";
    return UPLOADS_BASE + "/covers/" + mangaId + "/" + fileName + ".512.jpg";
}

function statusLabel(status) {
    if (status === "completed") return "Hoàn thành";
    if (status === "hiatus") return "Tạm ngưng";
    if (status === "cancelled") return "Đã hủy";
    return "Đang tiến hành";
}

function mangaItem(manga) {
    let attrs = manga.attributes || {};
    let prefs = langPrefs();
    let name = pickLang(attrs.title, prefs);
    if (!name) name = pickAltTitle(attrs.altTitles, prefs);

    let cover = "";
    let relationships = manga.relationships || [];
    for (let i = 0; i < relationships.length; i++) {
        if (relationships[i].type === "cover_art" && relationships[i].attributes) {
            cover = coverFile(manga.id, relationships[i].attributes.fileName);
        }
    }

    return {
        name: name,
        cover: cover,
        link: siteUrl("/title/" + manga.id),
        description: attrs.lastChapter ? "Chương " + attrs.lastChapter : "",
        tag: statusLabel(attrs.status)
    };
}

function mangaList(params) {
    let query = params.slice(0);
    query.push("limit=" + PAGE_SIZE);
    query.push("includes[]=cover_art");
    let ratings = contentRatingParams();
    for (let i = 0; i < ratings.length; i++) query.push(ratings[i]);

    let result = apiJson(API_BASE + "/manga?" + query.join("&"));
    if (!result.ok) return null;

    let data = result.json.data || [];
    let items = [];
    for (let j = 0; j < data.length; j++) items.push(mangaItem(data[j]));
    return items;
}

function groupName(chapter) {
    let relationships = chapter.relationships || [];
    for (let i = 0; i < relationships.length; i++) {
        if (relationships[i].type === "scanlation_group" && relationships[i].attributes) {
            return relationships[i].attributes.name || "";
        }
    }
    return "";
}