const searchProvider = require('./search/v2/index');

async function getHtml(req) {
    if (req.body.provider === undefined || req.body.terms === undefined){
        return "Not enough information provided";
    }

    let provider = req.body.provider;
    let terms = req.body.terms;

    await sleep(1000); // this is a long, long search!!

    return await searchProvider.search({
        query: { terms: terms },
        session: req.session
    });
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = { html: getHtml };