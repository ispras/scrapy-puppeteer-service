const utils = require('../helpers/utils')
const exceptions = require("../helpers/exceptions");

const DEFAULT_TIMEOUT = 1000;  // 1 second

/**
 * The function solves recaptchas on the page.
 * If there is no recaptcha on the page nothing will happen.
 * If there is a recaptcha the function solves it and then inserts the special code
 * into the page automatically.
 *
 * Returns useful information about recaptcha_solving.
 * For more information about return value visit
 * https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-recaptcha#result-object
 */
exports.recaptchaSolver = async function recaptchaSolver(page, request) {
    if (!("solve_recaptcha" in request.body)) {
        throw new exceptions.IncorrectArgumentError("No solve_recaptcha parameter in request");
    }

    let recaptchaData;

    if (request.body.solve_recaptcha) {
        recaptchaData = await page.solveRecaptchas();
    } else {
        recaptchaData = await page.findRecaptchas();
    }

    if (request.body.navigationOptions) {
        await page.waitForNavigation(request.body.navigationOptions);
    }
    const waitOptions = request.body.waitOptions || {timeout: DEFAULT_TIMEOUT};
    const contents = await utils.getContents(page, waitOptions);

    if (request.query.closePage ||
        (request.body.close_on_empty && recaptchaData['captchas'].length === 0)) {
        await page.close();
    }

    return {
        ...contents,
        recaptcha_data: recaptchaData,
    }
}
