function execute(url) {
    let mangaId = url.split('/').pop();
    let apiUrl = `https://mimihentai.moe/api/manga/${mangaId}`;
    
    let response = fetch(apiUrl);
    if (!response.ok) return Response.error("Lỗi kết nối API");
    
    let json = response.json();

    // Lấy genres
    let genres = [];
    if (json.genres && json.genres.length > 0) {
        genres = json.genres.map(genre => ({
            title: genre.name,
            input: `https://mimihentai.moe/api/manga/by-genre/${genre.id}?page=1`,
            script: "homecontent.js"
        }));
    }

    // Lấy tác giả
    let authors = (json.authors && json.authors.length > 0)
        ? json.authors.map(a => a.name).join(', ')
        : 'Không rõ';

    // Trạng thái
    let ongoing = false;
    if (json.status) {
        let status = json.status.toLowerCase();
        ongoing = status.includes('ongoing') || status.includes('đang') || status.includes('updating');
    }

    // Chi tiết
    let detail = [
        `Lượt xem: ${json.view || 'Chưa có'}`,
        `Người đăng: ${(json.uploader && json.uploader.display_name) || 'Không rõ'}`,
        `Trạng thái: ${ongoing ? 'Đang cập nhật' : 'Hoàn thành'}`,
        `Ngày cập nhật: ${json.last_updated ? new Date(json.last_updated).toLocaleDateString() : 'Không rõ'}`
    ].join('\n');

    return Response.success({
        name: json.title || '',
        cover: json.cover_url || '',
        host: "https://mimihentai.moe",
        author: authors,
        description: json.description || '',
        detail: detail,
        ongoing: ongoing,
        genres: genres,
        suggests: [
            {
                title: "Truyện Ngẫu Nhiên",
                input: "https://mimihentai.moe/api/manga/random?limit=20",
                script: "suggest.js"
            }
        ]
    });
}
