const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();


async function action(page, request) {
    await page.goto(request.body.url, request.body.options);
    return utils.formResponse(page, request.query.closePage);
}

// body = {
// "url": <string> URL to navigate page to. The url should include scheme, e.g. https://.
// "options": { Navigation parameters which might have the following properties:
//     "timeout": <number> Maximum navigation time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout. The default value can be changed by using the page.setDefaultNavigationTimeout(timeout) or page.setDefaultTimeout(timeout) methods.
//     "waitUntil": <string|Array<string>> When to consider navigation succeeded, defaults to load. Given an array of event strings, navigation is considered to be successful after all events have been fired. Events can be either:
//          load - consider navigation to be finished when the load event is fired.
//          domcontentloaded - consider navigation to be finished when the DOMContentLoaded event is fired.
//          networkidle0 - consider navigation to be finished when there are no more than 0 network connections for at least 500 ms.
//          networkidle2 - consider navigation to be finished when there are no more than 2 network connections for at least 500 ms.
//     "referer" <string> Referer header value. If provided it will take preference over the referer header value set by page.setExtraHTTPHeaders().
// }
router.post('/', async function (req, res, next) {

    if (!req.body.url) {
        res.status(400);
        res.send("No URL provided in goto request");
        next();
        return;
    }

    try {
        let response = await utils.perfomAction(req, action);
        res.send(response);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
