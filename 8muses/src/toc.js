load('libs.js');

function execute(url) {
    var host = 'https://8muses.io/';

    let response = fetch(url);

    if (response.ok) {
        let doc = response.html();
        var elems = $.QA(doc, '.c-tile[href^="/album/"]');

        var data = [];
        elems.forEach(function(e) {
            data.push({
                name: e.attr('title').trim(),
                url: e.attr('href'),
                host: host
            })
        })

        if (data.length) return Response.success(data);

        return Response.error(url);
    }
    return null;
}