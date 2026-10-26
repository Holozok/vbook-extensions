load('config.js');
load('gen.js');

function execute(url) {
    url = normalizeUrl(url);
    let id = chapterIdFromUrl(url);
    if (!id) return Response.error("URL không hợp lệ");

    let result = apiJson(API_BASE + "/at-home/server/" + id);
    if (!result.ok) return Response.error("MangaDex HTTP " + result.status);

    let baseUrl = result.json.baseUrl || "";
    let chapter = result.json.chapter || {};
    let hash = chapter.hash || "";
    let files = chapter.data || [];
    let folder = "data";
    if (files.length === 0) {
        files = chapter.dataSaver || [];
        folder = "data-saver";
    }
    if (!baseUrl || !hash || files.length === 0) return Response.error("Chương không có ảnh");

    let images = [];
    for (let i = 0; i < files.length; i++) {
        images.push(baseUrl + "/" + folder + "/" + hash + "/" + files[i]);
    }

    return Response.success(images);
}
