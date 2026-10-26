load('config.js');
load('gen.js');

// Chapter language priority: Vietnamese first, English when a chapter has no
// Vietnamese translation. Other languages are only used when neither exists.
var CHAPTER_LANGS = ["vi", "en"];

function chapterRank(code) {
    for (let i = 0; i < CHAPTER_LANGS.length; i++) {
        if (CHAPTER_LANGS[i] === code) return i;
    }
    return CHAPTER_LANGS.length;
}

// "388" -> "388", "123.10" -> "123.1", "Ch. 388" -> "388", "" -> ""
function chapterKey(chapter) {
    let match = String(chapter || "").match(/\d+(?:\.\d+)?/);
    if (!match) return "";
    let value = parseFloat(match[0]);
    return isNaN(value) ? "" : String(value);
}

function fetchFeed(mangaId, languages) {
    let chapters = [];
    let offset = 0;
    let page = 0;

    while (page < 8) {
        let params = [
            "limit=" + FEED_LIMIT,
            "offset=" + offset,
            "includes[]=scanlation_group",
            "includeUnavailable=0",
            "order[volume]=asc",
            "order[chapter]=asc"
        ];
        for (let i = 0; i < languages.length; i++) {
            params.push("translatedLanguage[]=" + encodeURIComponent(languages[i]));
        }
        let ratings = contentRatingParams();
        for (let j = 0; j < ratings.length; j++) params.push(ratings[j]);

        let result = apiJson(API_BASE + "/manga/" + mangaId + "/feed?" + params.join("&"));
        if (!result.ok) return null;

        let data = result.json.data || [];
        for (let k = 0; k < data.length; k++) chapters.push(data[k]);

        let total = parseInt(result.json.total || "0", 10);
        if (isNaN(total)) total = 0;
        offset += data.length;
        if (data.length === 0 || offset >= total) break;
        page++;
    }

    return chapters;
}

function readableEntries(chapters) {
    let entries = [];
    for (let i = 0; i < chapters.length; i++) {
        let attrs = chapters[i].attributes || {};
        if (attrs.externalUrl) continue;
        let key = chapterKey(attrs.chapter);
        entries.push({
            id: chapters[i].id,
            key: key,
            number: key ? parseFloat(key) : 999999,
            language: attrs.translatedLanguage || "",
            title: attrs.title || "",
            group: groupName(chapters[i]),
            rank: chapterRank(attrs.translatedLanguage || "")
        });
    }
    return entries;
}

// One entry per chapter number: the best-ranked language wins, later
// duplicates (another group, another language) are dropped.
function buildItems(entries) {
    let chosen = [];
    let indexByKey = {};

    for (let i = 0; i < entries.length; i++) {
        let entry = entries[i];
        let key = entry.key ? "c:" + entry.key : "id:" + entry.id;
        let existing = indexByKey[key];
        if (existing === undefined) {
            indexByKey[key] = chosen.length;
            chosen.push(entry);
        } else if (entry.rank < chosen[existing].rank) {
            chosen[existing] = entry;
        }
    }

    chosen.sort(function (a, b) {
        return a.number - b.number;
    });

    let items = [];
    for (let j = 0; j < chosen.length; j++) {
        let entry = chosen[j];
        let name = entry.key ? "Chương " + entry.key : (entry.title || "Oneshot");
        if (entry.key && entry.title) name = name + " - " + entry.title;

        let description = entry.group || "";
        if (entry.language) {
            description = description ? description + " [" + entry.language + "]" : "[" + entry.language + "]";
        }

        items.push({
            name: name,
            url: siteUrl("/chapter/" + entry.id),
            description: description,
            lock: false,
            pay: false
        });
    }

    return items;
}

function execute(url) {
    url = normalizeUrl(url);
    let id = mangaIdFromUrl(url);
    if (!id) return Response.error("URL không hợp lệ");

    let chapters = fetchFeed(id, CHAPTER_LANGS);
    if (chapters === null) return Response.error("Không tải được danh sách chương");
    let items = buildItems(readableEntries(chapters));

    // Licensed titles often expose only external (official) chapters; fall back
    // to every language before giving up.
    if (items.length === 0) {
        chapters = fetchFeed(id, []);
        if (chapters === null) return Response.error("Không tải được danh sách chương");
        items = buildItems(readableEntries(chapters));
    }

    if (items.length === 0) {
        return Response.error("MangaDex không có chương đọc được (truyện có thể chỉ có bản chính thức)");
    }
    return Response.success(items);
}
