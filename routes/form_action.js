const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();

async function action(page, request) {
    const inputMapping = request.body.inputMapping;
    const submitButton = request.body.submitButton || null;

    for (const [selector, params] of Object.entries(inputMapping)) {
        const value = params.value || "no value was provided";
        const delay = params.delay || 0;
        await page.type(selector, value, { delay });
    }

    if (submitButton) {
        await page.click(submitButton);
    }

    return await utils.getContents(page);

}

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