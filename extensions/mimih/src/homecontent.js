function execute(url, page) {
    if (!url) return Response.error("Thiếu URL");
    
    page = page || '1';
    
    url = url.replace(/page=\d+/, 'page=' + page);
    
    let response = fetch(url);
    if (!response.ok) return Response.error("Lỗi kết nối API");
    
    let json = response.json();
    
    let items = json.items || [];
    let data = items.map(item => ({
        name: item.title || item.name,
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
