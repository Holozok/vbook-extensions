load('libs.js');

function execute(url) {
    var host = 'https://8muses.io';

    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        log($.Q(doc, '.gallery img').attr('data-src'));

        // Try to read breadcrumbs to get name and author
        let crumbs = $.QA(doc, '.top-menu-breadcrumb ol li a[href^="/album/"]');
        var name = '';
        var author = 'Unknown';
        if (crumbs && crumbs.length) {
            // last crumb is the album name
            try {
                name = crumbs[crumbs.length - 1].text().trim();
            } catch (e) {
                name = $.Q(doc, 'a[href*="/album/"]').text().trim();
            }
            // previous crumb (if present) is the author
            if (crumbs.length >= 2) {
                try {
                    author = crumbs[crumbs.length - 2].text().trim();
                } catch (e) {
                    author = 'Unknown';
                }
            }
        } else {
            name = $.Q(doc, 'a[href*="/album/"]').text().trim();
        }

        return Response.success({
            name: name,
            cover: $.Q(doc, '.gallery img').attr('data-src').mayBeFillHost(host),
            author: author,
            description: '',
            detail: '',
            host: host
        })
    }
    return null;
}