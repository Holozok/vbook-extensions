function execute(url) {
    // Trích xuất ID truyện từ URL
    let mangaId = url.split('/').pop();
    let apiUrl = `https://mimihentai.moe/api/manga/${mangaId}/chapters`;
    
    let response = fetch(apiUrl);
    if (!response.ok) return Response.error("Lỗi kết nối API");
    
    let json = response.json();
    
    // Sắp xếp chương theo thứ tự tăng dần
    let sortedChapters = json.sort((a, b) => a.order - b.order);
    
    let data = sortedChapters.map(chapter => ({
        name: chapter.title,
        url: `https://mimihentai.moe/manga/${mangaId}/chapter/${chapter.id}`,
        host: "https://mimihentai.moe"
    }));
    
    return Response.success(data);
}
