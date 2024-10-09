const express = require('express');

const {captureSnapshot} = require('../actions/mhtml');
const utils = require('../helpers/utils');

const router = express.Router();

router.post('/', async function (req, res, next) {
    try {
        const response = await utils.performAction(req, captureSnapshot);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
