const express = require('express');

const utils = require('../helpers/utils');
const exceptions = require('../helpers/exceptions');

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
 *          html: await page.content(),
 *          cookies: await page.cookies()
 *      };
 * };
 */
router.post('/', async function (req, res, next) {
    try {
        if (!(/^\s*(async)?\s*function\s*action\s*\(\s*page\s*(,\s*request)?\)\s*{(.|\s)*}$/.test(req.body))) {
            throw new exceptions.IncorrectArgumentError("Invalid action function.\n" +
                "Valid action function: \"async function action(page, request) " +
                "{ ... some actions with request and page in puppeteer " +
                "syntax};\"");
        }

        eval(req.body.toString());

        // check action function existence
        if (!(typeof action === "function" && action.length >= 1)) {
            throw new exceptions.IncorrectArgumentError("Invalid action function.\n" +
                "Valid action function: \"async function action(page, request) " +
                "{ ... some actions with request and page in puppeteer " +
                "syntax};\"");
        }

        let response = await utils.performAction(req, async (page, request) => {
            return {
                data: await action(page, request)
            }
        });
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
