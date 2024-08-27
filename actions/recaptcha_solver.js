const utils = require('../helpers/utils')

const DEFAULT_TIMEOUT = 1000;  // 1 second

/*
 * This module introduces new ability to puppeteer-service.
 * It is capable of solving recaptchas on a given web-page.
 * If there is no recaptcha on the page nothing bad will happen.
 * If there is recaptcha it solves it and then inserts the special code
 * into the page automatically.
 *
 * Returns useful information about recaptcha_solving.
 * For more information about return value visit
 * https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-recaptcha#result-object
 */
exports.recaptchaSolver = async function recaptchaSolver(page, request) {
    let recaptcha_data;

    if (request.body.solve_recaptcha) {
        recaptcha_data = await page.solveRecaptchas();
    } else {
        recaptcha_data = await page.findRecaptchas();
    }

    const waitOptions = request.body.waitOptions || { timeout: DEFAULT_TIMEOUT };
    const contents = await utils.getContents(page, waitOptions);

    if (request.query.closePage ||
        (request.body.close_on_empty && recaptcha_data['captchas'].length === 0)) {
        await page.close();
    }

    return {
        ...contents,
        recaptcha_data: recaptcha_data,
    }
}
