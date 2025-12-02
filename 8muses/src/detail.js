load('libs.js');

function execute(url) {
    var host = 'https://8muses.io';

    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        log($.Q(doc, '.gallery img').attr('data-src'));
        return Response.success({
            name: $.Q(doc, 'a[href*="/album/"]').text().trim(),
            cover: $.Q(doc, '.gallery img').attr('data-src').mayBeFillHost(host),
            author: 'Unknown',
            description: '',
            detail: '',
            host: host
        })
    }
    return null;
}