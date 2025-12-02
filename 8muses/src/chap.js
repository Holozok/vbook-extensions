load('libs.js');

function execute(url) {
    let response = fetch(url);

    if (response.ok) {
        let doc = response.html();

        var elems = $.QA(doc, '.image img');
        var data = [];
        for (let i = 0; i < elems.length; i++) {
            let e = elems[i];
            let fullUrl = e.attr('data-src').replace('/th_', '/full_').mayBeFillHost('https://8muses.io');
            data.push({
                link: fullUrl,
                fallback: [fullUrl]
            });
        }
        return Response.success(data);
    }
    return null;
}