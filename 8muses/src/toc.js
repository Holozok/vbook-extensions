load('libs.js');

function execute(url) {
    var host = 'https://8muses.io/';

    let response = fetch(url);

    if (response.ok) {
        let doc = response.html();
        var elems = $.QA(doc, '.c-tile[href^="/album/"]');

        var data = [];
        elems.forEach(function(e) {
            let subUrl = host + e.attr('href');
            let subResponse = fetch(subUrl);
            
            if (subResponse.ok) {
                let subDoc = subResponse.html();
                let subElems = $.QA(subDoc, '.c-tile[href^="/album/"]');
                
                // If subElems is not empty, continue searching
                if (subElems.length > 0) {
                    subElems.forEach(function(subE) {
                        let subSubUrl = host + subE.attr('href');
                        let subSubResponse = fetch(subSubUrl);
                        
                        if (subSubResponse.ok) {
                            let subSubDoc = subSubResponse.html();
                            let subSubElems = $.QA(subSubDoc, '.c-tile[href^="/album/"]');
                            
                            // If subSubElems is not empty, continue searching
                            if (subSubElems.length > 0) {
                                subSubElems.forEach(function(subSubE) {
                                    data.push({
                                        name: subSubE.attr('title').trim(),
                                        url: subSubE.attr('href'),
                                        host: host
                                    });
                                });
                            } else {
                                // subSubElems is empty, add this item
                                data.push({
                                    name: subE.attr('title').trim(),
                                    url: subE.attr('href'),
                                    host: host
                                });
                            }
                        }
                    });
                } else {
                    // subElems is empty, add this item directly
                    data.push({
                        name: e.attr('title').trim(),
                        url: e.attr('href'),
                        host: host
                    });
                }
            }
        });

        if (data.length) return Response.success(data);
        else {
            data.push({
                name: 'Oneshot',
                url: url,
                host: host
            })
            return Response.success(data);
        }
    }
    return null;
}