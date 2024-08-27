const express = require('express');

const utils = require('../helpers/utils');
const {screenshot} = require('../actions/screenshot');

const router = express.Router();

router.post('/', async function (req, res, next) {
    try {
        let response = await utils.performAction(req, screenshot);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
