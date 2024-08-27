const express = require('express');

const {click} = require('../actions/click');
const utils = require('../helpers/utils');
const exceptions = require('../helpers/exceptions');

const router = express.Router();

router.post('/', async function (req, res, next) {
    if (!("selector" in req.body)) {
        throw new exceptions.IncorrectArgumentError("No selector to click in request");
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
