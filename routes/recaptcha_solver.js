const express = require('express')
const router = express.Router()

const {recaptchaSolver} = require('../actions/recaptcha_solver');
const utils = require('../helpers/utils')
const exceptions = require('../helpers/exceptions');

router.post('/', async function (req, res, next) {
    if (!req.query.contextId || !req.query.pageId) {
        throw new exceptions.IncorrectArgumentError("No page in request");
    }

    if (!process.env.TOKEN_2CAPTCHA) {
        res.status(501);
        res.send("TOKEN_2CAPTCHA is not provided!");
        next();
        return;
    }

    if (!("solve_recaptcha" in req.body)) {
        throw new exceptions.IncorrectArgumentError("No solve_recaptcha parameter in request");
    }

    try {
        let response = await utils.performAction(req, recaptchaSolver);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response)
    } catch (e) {
        next(e);
    }
});

module.exports = router;
