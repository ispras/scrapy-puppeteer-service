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
 */

/**
 *
 * @param page - page with possible recaptcha.
 * @param request - request to the page.
 */

async function action(page, request) {
    const {
        captchas,
        filtered,
        solutions,
        solved,
        error
    } = await page.solveRecaptchas();

    const waitOptions = request.body.waitOptions || { timeout: DEFAULT_TIMEOUT };
    return utils.formResponse(page, request.query.closePage, waitOptions);
}

router.post('/', async function (req, res, next) {
    if (!req.query.contextId || !req.query.pageId) {
        res.status(400);
        res.send("No page in request");
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