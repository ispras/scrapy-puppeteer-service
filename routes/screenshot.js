const express = require('express');
const router = express.Router();


async function action(page, request) {
    let screenshot = await page.screenshot(request.body.options);
    return {
        screenshot: screenshot
    };
}

// Method that returns screenshots of pages
// more description of options you can see on github:
// https://github.com/GoogleChrome/puppeteer/blob/v1.19.0/docs/api.md#pagescreenshotoptions
router.post('/', async function (req, res, next) {

    if (!(typeof action === "function" && action.length >= 1)) {
        res.status("501");
        res.send("Not implemented yet");
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