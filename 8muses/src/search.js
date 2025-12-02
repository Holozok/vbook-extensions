load('libs.js');

function execute(key, page) {
    var host = 'https://8muses.io/';
    
    let response = fetch('https://8muses.io/search', {
        method: "GET",
        queries: {
            'q': key,
        }
    });
    
    if (response.ok) {
        let doc = response.html();
        var data = [];

        var elems = $.QA(doc, '.c-tile');
        if (!elems.length) return Response.error(url);

        elems.forEach(function(e) {
            data.push({
                name: e.attr('title'),
                link: e.attr('href'),
                cover: $.Q(e, 'img').attr('data-src').mayBeFillHost(host),
                description: '',
                host: host
            })
        });

        return Response.success(data);
    }
    return null;
}