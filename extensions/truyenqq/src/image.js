// The image CDN (i*.truyenvua.com / hinhhinh.com) answers 403 with a Cloudflare HTML page
// when the Referer header is missing. The app downloads images without a referer, saved
// that HTML as the image and still reported the download as successful. Fetching the bytes
// here adds the referer, and a real block now returns null instead of a broken image.
function execute(url) {
    var referer = "https://truyenqqko.com/";
    try {
        if (DOMAIN) referer = DOMAIN;
    } catch (e) {
    }

    var res = fetch(url, {
        headers: {
            referer: referer
        }
    });
    if (!res.ok) return null;
    if ((res.header("content-type") + "").indexOf("image/") !== 0) return null;
    return res.base64() + "";
}
