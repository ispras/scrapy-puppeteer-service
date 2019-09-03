const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();

/**
 * Content-Type: application/javascript
 * body = js function  as pattern "async function action(page) { ... some actions with page in puppeteer syntax};"
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
            res.send("Valid action function: \"async function action(page) { ... some actions with page in puppeteer " +
                "syntax};\"");
            next();
            return;
        }

        let lock = req.app.get('lock');
        let page = await utils.getBrowserPage(req.app.get('browser'), req.query.context_id, req.query.page_id);
        let response = {};

        await lock.acquire(await page._target._targetId, async () => {
            await action(page);
            response = await utils.formResponse(page, req.query.closePage);
        });

        console.log("page_id=" + response.page_id + "&context_id=" + response.context_id);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    } catch (e) {
        next(e);
    }

});

module.exports = router;