function execute() {
    let apiUrl = "https://mimihentai.moe/api/genres";
    let response = fetch(apiUrl);
    if (!response.ok) return Response.error("Lỗi kết nối API");
    
    let genres = response.json();
    let data = genres
        .filter(genre => genre.manga_count > 0)
        .sort((a, b) => b.manga_count - a.manga_count)
        .slice(0, 100)
        .map(genre => ({
            title: `${genre.name} (${genre.manga_count})`,
            input: `https://mimihentai.moe/api/manga/by-genre/${genre.id}?page=1`,
            script: "gen.js"
        }));
    
    return Response.success(data);
}
