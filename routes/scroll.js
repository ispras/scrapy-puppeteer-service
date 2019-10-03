const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();

const DEFAULT_TIMEOUT = 1000;  // 1 second

async function action(page, request) {
    let promises = [];
    if (request.body.selector) {
        promises.push(page.hover(request.body.selector));
    } else {
        promises.push(page.evaluate(() => {
            // scroll down by window height
            // XXX scroll up is necessary to trigger scroll event even at the bottom of a page
            // XXX it helps when the scroll gets locked on some sites with ajax-loaded content
            window.scrollBy(0, -1);
            window.scrollBy(0, window.innerHeight);
        }));
    }
    promises.push(page.waitFor(request.body.waitOptions.selectorOrTimeout || DEFAULT_TIMEOUT));

    await Promise.all(promises);

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
    
    try {
        let response = await utils.perfomAction(req, action);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    } catch (e) {
        next(e);
    }
});

module.exports = router;
