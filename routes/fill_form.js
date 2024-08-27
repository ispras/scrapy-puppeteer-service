const express = require('express');

const {fillForm} = require('../actions/fill_form');
const utils = require('../helpers/utils');

const router = express.Router();

router.post('/', async function (req, res, next) {
    if (!req.body.inputMapping) {
        res.status(400);
        res.send("No inputMapping provided in fill_form request");
        next();
        return;
    }

    try {
        let response = await utils.performAction(req, fillForm);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
