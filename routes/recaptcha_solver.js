const express = require('express')
const router = express.Router()
const utils = require('../helpers/utils')

const DEFAULT_TIMEOUT = 1000;  // 1 second

/*
 * This module introduces new ability to puppeteer-service.
 * It is capable of solving recaptchas on the given web-page.
 * If there is no recaptcha on the page nothing bad will happen.
 * If there is recaptcha it solves it and then inserts the special code
 * into the page automatically.
 *
 * Returns useful information about recaptcha_solving.
 * For more information about return value visit
 * https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-recaptcha#result-object
 */

/**
 *
 * @param page - page with possible recaptcha.
 * @param request - request to the page.
 */

async function action(page, request) {
    let recaptcha_data;

    if (request.body.solve_recaptcha) {
        recaptcha_data = await page.solveRecaptchas();
    } else {
        recaptcha_data = await page.findRecaptchas();
    }

    const waitOptions = request.body.waitOptions || { timeout: DEFAULT_TIMEOUT };
    request.query.closePage = request.query.closePage ||
        (request.body.close_on_empty && recaptcha_data['captchas'].length === 0)
    return {
        ...await utils.getContents(page, waitOptions),
        recaptcha_data: recaptcha_data,
    }
}

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
        let response = await utils.performAction(req, action);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response)
    } catch (e) {
        next(e);
    }
});

module.exports = router;