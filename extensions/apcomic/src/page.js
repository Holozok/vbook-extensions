load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/, BASE_URL);
    if (url.slice(-1) === "/") url = url.slice(0, -1);

    // Most AllPornComic TOCs are not paginated — return the detail URL itself
    return Response.success([url]);
}
