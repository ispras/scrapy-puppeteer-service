const express = require('express');

const {goto} = require('../actions/goto');
const utils = require('../helpers/utils');
const exceptions = require('../helpers/exceptions');

const router = express.Router();

router.post('/', async function (req, res, next) {
    if (!req.body.url) {
        throw new exceptions.IncorrectArgumentError("No URL provided in goto request");
    }

    try {
        let response = await utils.performAction(req, goto);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
