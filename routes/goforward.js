const express = require('express');

const {goForward} = require('../actions/goforward');
const utils = require('../helpers/utils');
const exceptions = require('../helpers/exceptions');

const router = express.Router();

router.post('/', async function (req, res, next) {
    if (!req.query.contextId || !req.query.pageId) {
        throw new exceptions.IncorrectArgumentError("No page in request");
    }

    try {
        let response = await utils.performAction(req, goForward);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response)
    } catch (e) {
        next(e);
    }
});

module.exports = router;
