load("config.js");

function execute() {
    return Response.success([
        { title: "Latest", input: BASE_URL + "/porncomic/", script: "gen.js" },
        { title: "Rating", input: BASE_URL + "/porncomic/?m_orderby=rating", script: "gen.js" },
        { title: "Trending", input: BASE_URL + "/porncomic/?m_orderby=trending", script: "gen.js" },
        { title: "Most viewed", input: BASE_URL + "/porncomic/?m_orderby=views", script: "gen.js" },
        { title: "New", input: BASE_URL + "/porncomic/?m_orderby=new-manga", script: "gen.js" }
    ]);
}
