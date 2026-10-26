function execute(url, page) {
    if (!url) {
        url = "https://mimihentai.moe/api/manga/random?limit=20";
    }
    
    let response = fetch(url);
    if (!response.ok) return Response.error("Lỗi kết nối API");
    
    let json = response.json();
    let data = json.map(item => ({
        name: item.title,
        link: `https://mimihentai.moe/manga/${item.id}`,
        host: "https://mimihentai.moe",
        cover: item.cover_url,
        description: item.description || ''
    }));
    
    return Response.success(data);
}
