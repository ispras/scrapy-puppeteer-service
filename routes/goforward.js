const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();


async function action(page, request) {
    await page.goForward(request.body.navigationOptions);
    return utils.formResponse(page, request.query.closePage, request.body.waitOptions);
}

router.post('/', async function (req, res, next) {

    if (!req.query.contextId || !req.query.pageId) {
        res.status(400);
        res.send("No page in request");
        next();
        return;
    }

    try {
        let response = await utils.performAction(req, action);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response)
    } catch (e) {
        next(e);
    }
});

module.exports = router;
