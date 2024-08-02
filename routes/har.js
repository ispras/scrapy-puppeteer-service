const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();
const PuppeteerHar = require('puppeteer-har');


async function action(page, request) {
    const options = request.body.options;
    const harState = options.hasOwnProperty('har_state') ? options.har_state : null;

    if (harState === "start"){
        utils.puppeteerHar = new PuppeteerHar(page)
        await utils.puppeteerHar.start();
        return {
            har: "no Har data"
        };
    }
    if (harState === "stop" && utils.puppeteerHar !== null){
        har_data = await utils.puppeteerHar.stop();
        har = JSON.stringify(har_data);
        return {
            har: har
        };
    }
    return {har: "no Har data"};
}


//TODO Method that returns har of page downloads using https://www.npmjs.com/package/puppeteer-har
router.post('/', async function (req, res, next) {

    if (!req.body.options) {
        res.status(400);
        res.send("No options provided in har request");
        next();
        return;
    }

    try {
        let response = await utils.performAction(req, action);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
