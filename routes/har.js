const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();
const PuppeteerHar = require('puppeteer-har');
const exceptions = require("../helpers/exceptions");

async function action(page, request) {

    if (!(page.harWriter)){
        throw new exceptions.NoHarWriterError();
    }

    harData = await page.harWriter.stop();
    harJson  = JSON.stringify(harData);
    return {
        har: harJson 
    };
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