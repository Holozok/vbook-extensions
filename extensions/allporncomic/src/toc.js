load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/, BASE_URL);
    if (url.slice(-1) === "/") url = url.slice(0, -1);

    var chapters = [];
    var seen = {};

    var collectChapters = function (doc) {
        var countBefore = chapters.length;
        doc.select("li.wp-manga-chapter > a, .wp-manga-chapter a, .listing-chapters_wrap a, .chapter-list a, .chapters a").forEach(function (el) {
            var chapUrl = (el.attr("href") || "") + "";
            if (!chapUrl) return;
            if (!chapUrl.startsWith("http")) chapUrl = BASE_URL + chapUrl;
            if (seen[chapUrl]) return;
            seen[chapUrl] = true;

            var name = (el.text() || "").trim() + "";
            if (!name) name = chapUrl.replace(/\/$/, "").split("/").pop();

            chapters.push({
                name: name,
                url: chapUrl,
                host: BASE_URL
            });
        });
        return chapters.length > countBefore;
    };

    var res = fetch(url,{
        headers: {
            'user-agent': UserAgent.android()
        }
    });
    if (!res.ok) return Response.error("Cannot load: " + res.status);
    var doc = res.html();
    collectChapters(doc);

    if (chapters.length === 0) {
        var ajaxUrl = url + "/ajax/chapters/";
        var ajaxRes = fetch(ajaxUrl, { method: "POST" });
        if (ajaxRes.ok) {
            collectChapters(ajaxRes.html());
        }
    }

    if (chapters.length === 0) {
        var holder = doc.select("[id^=manga-chapters-holder][data-id]").first();
        if (holder) {
            var mangaId = (holder.attr("data-id") || "") + "";
            if (mangaId) {
                var legacy = fetch(BASE_URL + "/wp-admin/admin-ajax.php", {
                    method: "POST",
                    headers: {
                        "x-referer": BASE_URL
                    },
                    body: {
                        action: "manga_get_chapters",
                        manga: mangaId
                    }
                });
                if (legacy.ok) {
                    collectChapters(legacy.html());
                }
            }
        }
    }

    if (chapters.length === 0) {
        doc.select("a").forEach(function (el) {
            var chapUrl = (el.attr("href") || "") + "";
            if (!chapUrl || chapUrl.indexOf("/porncomic/") === -1) return;
            if (!/\/porncomic\/[^\/]+\/[0-9]+-/.test(chapUrl)) return;
            if (!chapUrl.startsWith("http")) chapUrl = BASE_URL + chapUrl;
            if (seen[chapUrl]) return;
            seen[chapUrl] = true;

            var name = (el.text() || "").trim() + "";
            if (!name) name = chapUrl.replace(/\/$/, "").split("/").pop();

            chapters.push({
                name: name,
                url: chapUrl,
                host: BASE_URL
            });
        });
    }

    if (chapters.length === 0) return Response.error("No chapters found");
    return Response.success(chapters);
}
