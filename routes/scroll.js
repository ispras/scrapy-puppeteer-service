const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();

const DEFAULT_TIMEOUT = 1000;  // 1 second

async function action(page, request) {
    if (request.body.selector) {
        await page.hover(request.body.selector);
    } else {
        await page.evaluate(() => {
            // scroll down until the bottom of the page to trigger scroll event even at the bottom of a page
            window.scrollBy(0, document.body.scrollHeight)
        });
    }
    const waitOptions = request.body.waitOptions || { timeout: DEFAULT_TIMEOUT};
    return utils.formResponse(page, request.query.closePage, waitOptions);
}

// Method that scrolls page to a certain selector.
// Example body:
//  body = {
//     "selector": "", //<string> A selector to search for element to scroll
//     "waitOptions": {...} // same as in goto action, defaults to 1s timeout
//  }
router.post('/', async function (req, res, next) {
    
    try {
        let response = await utils.performAction(req, action);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
