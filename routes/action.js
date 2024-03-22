const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();

/**
 * Content-Type: application/javascript
 * body = js function  as pattern:
 * async function action(page, request) {
 *      ...
 *      some actions with page in puppeteer syntax
 *      ...
 *      return {
 *          context_id: page.browserContext().id,
 *          page_id: page.target()._targetId,
            html: await page.content(),
            cookies: await page.cookies()
 *      };
 * };
 */
router.post('/', async function (req, res, next) {

    //TODO better request error handling
    // if (!("action" in req.body)) {
    //     res.status("400");
    //     res.send("No action in request")
    // }

    try {
        eval(req.body.toString());

        //check action function exists
        if (!(typeof action === "function" && action.length >= 1)) {
            res.status("400");
            res.send("Valid action function: \"async function action(page, request) " +
                "{ ... some actions with request and page in puppeteer " +
                "syntax};\"");
            throw new Error("Invalid action function");
        }

        let response = await utils.performAction(req, action);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response);
    } catch (e) {
        next(e);
    }

});

module.exports = router;
