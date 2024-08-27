const express = require('express');

const {click} = require('../actions/click');
const utils = require('../helpers/utils');
const router = express.Router();

router.post('/', async function (req, res, next) {

    //TODO better request error handling
    if (!("selector" in req.body)) {
        res.status("400");
        res.send("No selector to click in request");
        next();
        return;
    }

    try {
        let response = await utils.performAction(req, click);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response)
    } catch (e) {
        next(e);
    }
});

module.exports = router;
