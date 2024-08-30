const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();

const DEFAULT_TIMEOUT = 1000;  // 1 second

async function action(page, request) {
    await page.hover(request.body.selector);
    if (request.body.navigationOptions) {
        await Promise.all([
            page.waitForNavigation(request.body.navigationOptions),
            page.click(request.body.selector, request.body.clickOptions),
        ]);
    } else {
        await page.click(request.body.selector, request.body.clickOptions);
    }
    const waitOptions = request.body.waitOptions || { timeout: DEFAULT_TIMEOUT };
    return await utils.getContents(page, waitOptions);
}

/**
 body = {
    "selector": "", //<string> A selector to search for element to click. If there are multiple elements satisfying the selector, the first will be clicked.
    "clickOptions": {
        "button", //<"left"|"right"|"middle"> Defaults to left.
        "clickCount", //<number> defaults to 1.
        "delay" //<number> Time to wait between mousedown and mouseup in milliseconds. Defaults to 0.
    },
    "waitOptions": {...}, // same as in goto action, defaults to 1s timeout
    "navigationOptions": {...} // same as in goto action
 }
 */
router.post('/', async function (req, res, next) {

    //TODO better request error handling
    if (!("selector" in req.body)) {
        res.status(400);
        res.send("No selector to click in request");
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
