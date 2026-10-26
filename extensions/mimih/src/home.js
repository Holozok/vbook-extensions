function execute() {
    return Response.success([
        {
            title: "Mới",
            input: "https://mimihentai.moe/api/manga?page=1",
            script: "homecontent.js"
        },
        {
            title: "Truyện Ngẫu Nhiên",
            input: "https://mimihentai.moe/api/manga/random?limit=100",
            script: "suggest.js"
        }
    ]);
}
