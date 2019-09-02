const express = require('express');
const router = express.Router();


router.post('/', async function (req, res) {

    const browser = req.app.get('browser');
    let contexts = req.app.get('contexts'),
        page_id = req.query.page_id,
        context_id = req.query.context_id,
        context, page;

    if ("context_id" in req.query && "page_id" in req.query) {
        if (context_id in contexts) {
            context = contexts[context_id];
        }
        //TODO should be moved to utils
        //Maybe should return error if contex or page not exist
        if (context && page_id in context.pages) {
            page = contexts[context_id]["pages"][page_id];
        }
    }
    if (!context) {
        let browserContext = await browser.createIncognitoBrowserContext();
        context_id = browserContext._id;
        context = {"value": browserContext, "pages": {}}
    }
    if (!page) {
        page = await context.value.newPage();
        page_id = await page._target._targetId;
        context.pages[page_id] = page;
    }
    contexts[context_id] = context;

    await page.goto(req.body.url);

    let html = await page.content();
    let cookies = await page.cookies();

    let response = {};
    response.context_id = context_id;

    if (!("closePage" in req.body) || req.body.closePage) {
        page.close();
    } else {
        response.page_id = page_id;
    }

    response.html = html;
    response.cookies = cookies;

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(response));
});

module.exports = router;
