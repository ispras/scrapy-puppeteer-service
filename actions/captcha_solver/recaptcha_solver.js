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
    let recaptchaData;

    if (request.body.solveRecaptcha) {
        recaptchaData = await page.solveRecaptchas();
    } else {
        recaptchaData = await page.findRecaptchas();
    }

    if (request.body.navigationOptions) {
        await page.waitForNavigation(request.body.navigationOptions);
    }

    return {
        recaptchaData: recaptchaData,
    }
}
