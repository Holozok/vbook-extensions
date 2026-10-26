function execute(url) {
    // Trích xuất ID chương từ URL
    let chapterId = url.split('/').pop();
    let apiUrl = `https://mimihentai.moe/api/chapters/${chapterId}`;

    let response = fetch(apiUrl);
    if (!response.ok) return Response.error("Lỗi kết nối API");

    let json = response.json();

    // Trả về mảng các URL ảnh
    let pages = (json.pages || []).map(p => p.image_url);
    return Response.success(pages);
}
