const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();

const DEFAULT_TIMEOUT = 1000;  // 1 second

async function action(page, request) {
    await Promise.all([
        page.waitFor(request.body.waitOptions.selectorOrTimeout || DEFAULT_TIMEOUT),
        page.click(request.body.selector, request.body.clickOptions),
    ]);

    return utils.formResponse(page, request.query.closePage);
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
        // if selectorOrFunctionOrTimeout is a string, then the first argument is treated as a selector or xpath, depending on whether or not it starts with '//', and the method is a shortcut for page.waitForSelector or page.waitForXPath
        // if selectorOrFunctionOrTimeout is a number, then the first argument is treated as a timeout in milliseconds and the method returns a promise which resolves after the timeout
        "selectorOrTimeout":... default 1,
    }
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
        let response = await utils.perfomAction(req, action);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    } catch (e) {
        next(e);
    }
});

module.exports = router;
