const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();


async function action(page, request) {
    delete request.body.options.path; // no path for saving images
    request.body.options.encoding = "base64"; // return in base64 
    let screenshot = await page.screenshot(request.body.options);
    return {
        screenshot: screenshot
    };
}

// Method that returns screenshots of pages
// more description of options you can see on github:
// https://github.com/GoogleChrome/puppeteer/blob/v1.19.0/docs/api.md#pagescreenshotoptions
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
