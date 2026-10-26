load('config.js');
load('gen.js');

function execute() {
    let result = apiJson(API_BASE + "/manga/tag");
    if (!result.ok) return Response.error("MangaDex HTTP " + result.status);

    let tags = result.json.data || [];
    let prefs = langPrefs();
    let items = [];
    for (let i = 0; i < tags.length; i++) {
        let attrs = tags[i].attributes || {};
        let name = pickLang(attrs.name, prefs);
        if (!name) continue;
        items.push({
            title: name,
            input: "@tag:" + tags[i].id,
            script: "search.js"
        });
    }

    if (items.length === 0) return Response.error("Không tải được thể loại");
    return Response.success(items);
}
