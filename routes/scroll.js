const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();

const DEFAULT_TIMEOUT = 1000;  // 1 second

async function action(page, request) {
    await Promise.all([
        page.waitFor(request.body.waitOptions.selectorOrTimeout || DEFAULT_TIMEOUT),
        page.hover(request.body.selector),
    ]);
    return utils.formResponse(page, request.query.closePage);
}

// Method that scrolls page to a certain selector.
// Example body:
//  body = {
//     "selector": "", //<string> A selector to search for element to scroll
//     "waitOptions": {
//         // if selectorOrFunctionOrTimeout is a string, then the first argument is treated as a selector or xpath, depending on whether or not it starts with '//', and the method is a shortcut for page.waitForSelector or page.waitForXPath
//         // if selectorOrFunctionOrTimeout is a number, then the first argument is treated as a timeout in milliseconds and the method returns a promise which resolves after the timeout
//         "selectorOrTimeout":...,
//     }
//  }
router.post('/', async function (req, res, next) {

    if (!("selector" in req.body)) {
        res.status("400");
        res.send("No selector to scroll in request");
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
