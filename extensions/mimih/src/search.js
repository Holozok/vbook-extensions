function execute(key, page) {
    if (!key) return Response.error("Thiếu từ khóa tìm kiếm");
    
    page = page || '1';
    
    let apiUrl = `https://mimihentai.moe/api/manga/search?q=${encodeURIComponent(key)}&page=${page}`;
    
    let response = fetch(apiUrl);
    if (!response.ok) return Response.error("Lỗi kết nối API");
    
    let json = response.json();
    
    let data = (json.items || []).map(item => ({
        name: item.title,
        link: `https://mimihentai.moe/manga/${item.id}`,
        host: "https://mimihentai.moe",
        cover: item.cover_url,
        description: item.description || ''
    }));
    
    let next = null;
    if (json.has_next) {
        next = (json.page + 1).toString();
    }
    
    return Response.success(data, next);
}
