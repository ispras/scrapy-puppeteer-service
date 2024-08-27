const express = require('express')
const router = express.Router()

const {recaptchaSolver} = require('../actions/recaptcha_solver');
const utils = require('../helpers/utils')

router.post('/', async function (req, res, next) {
    if (!req.query.contextId || !req.query.pageId) {
        res.status(400);
        res.send("No page in request");
        next();
        return;
    }

    if (!process.env.TOKEN_2CAPTCHA) {
        res.status("501");
        res.send("TOKEN_2CAPTCHA is not provided!");
        next();
        return;
    }

    if (!("solve_recaptcha" in req.body)) {
        res.status("400");
        res.send("No solve_recaptcha parameter in request");
        next();
        return;
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
