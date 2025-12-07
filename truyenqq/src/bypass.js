function bypass(url, doc) {
    var cookie = doc.html().match(/document.cookie="(.*?)"/);
    if (cookie) {
        cookie = cookie[1];
        doc = Http.get(url)
            .headers({
                "Cookie": cookie,
                "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
            })
            .html();
    }
    return doc
}