const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();

const DEFAULT_TIMEOUT = 1000;  // 1 second

async function action(page, request) {
    if (request.body.navigationOptions) {
        await Promise.all([
            page.waitForNavigation(request.body.navigationOptions),
            page.click(request.body.selector, request.body.clickOptions),
        ]);
    } else {
        await page.click(request.body.selector, request.body.clickOptions);
    }
    return utils.formResponse(page, request.query.closePage, request.body.waitOptions || DEFAULT_TIMEOUT);
}

/**
 body = {
    "selector": "", //<string> A selector to search for element to click. If there are multiple elements satisfying the selector, the first will be clicked.
    "clickOptions": {
        "button", //<"left"|"right"|"middle"> Defaults to left.
        "clickCount", //<number> defaults to 1.
        "delay" //<number> Time to wait between mousedown and mouseup in milliseconds. Defaults to 0.
    },
    "waitOptions": {
        // if selectorOrTimeout is a string, then the first argument is treated as a selector or xpath, depending on whether or not it starts with '//', and the method is a shortcut for page.waitForSelector or page.waitForXPath
        // if selectorOrTimeout is a number, then the first argument is treated as a timeout in milliseconds and the method returns a promise which resolves after the timeout
        "selectorOrTimeout":... default 1,
    },
    "navigationOptions": {...} // same as in goto action
 }
 */
router.post('/', async function (req, res, next) {

    //TODO better request error handling
    if (!("selector" in req.body)) {
        res.status("400");
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
