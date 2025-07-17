const express = require('express');
const router = express.Router();

const {captchaSolver} = require('../actions/captcha_solver');
const utils = require('../helpers/utils');

router.post('/', async function (req, res, next) {
    if (!process.env.TOKEN_2CAPTCHA) {
        res.status(501);
        res.send("TOKEN_2CAPTCHA is not provided!");
        next();
        return;
    }

    try {
        let response = await utils.performAction(req, captchaSolver);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response)
    } catch (e) {
        next(e);
    }
});

module.exports = router;
