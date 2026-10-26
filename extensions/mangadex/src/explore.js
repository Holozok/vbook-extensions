load('config.js');
load('gen.js');

function section(id, title, subtitle, input, items) {
    return {
        id: id,
        title: title,
        subtitle: subtitle,
        type: "grid",
        shape: "book",
        items: items,
        more: {
            type: "list",
            name: title,
            script: "search.js",
            input: input
        }
    };
}

function execute() {
    let sections = [];

    let popular = mangaList(["order[followedCount]=desc", "hasAvailableChapters=true"]);
    if (popular) sections.push(section("popular", "Phổ biến", "Được theo dõi nhiều nhất", "@popular", popular));

    let updated = mangaList(["order[latestUploadedChapter]=desc", "hasAvailableChapters=true"]);
    if (updated) sections.push(section("updated", "Mới cập nhật", "Vừa có chương mới", "@updated", updated));

    let fresh = mangaList(["order[createdAt]=desc", "hasAvailableChapters=true"]);
    if (fresh) sections.push(section("new", "Mới thêm", "Truyện vừa đăng", "@new", fresh));

    if (sections.length === 0) return Response.error("Không tải được dữ liệu MangaDex");
    return Response.success(sections);
}
