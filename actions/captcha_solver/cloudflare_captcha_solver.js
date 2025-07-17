const utils = require('../../helpers/utils');

const DEFAULT_TIMEOUT = 1000;  // 1 second

/**
 * The function solves cloudflare captcha on the page.
 * If there is no cloudflare captcha on the page nothing will happen.
 * If there is a cloudflare captcha the function solves it and then inserts the special code
 * into the page automatically.
 *
 * Returns useful information about solving cloudflare captcha.
 * For more information about return value visit
 * https://www.npmjs.com/package/puppeteer-captcha-plugin
 */
exports.cloudflareCaptchaSolver = async function cloudflareCaptchaSolver(page, request) {
    let cloudflareCaptchaData;

    if (request.body.solveCloudflareCaptcha) {
        cloudflareCaptchaData = await page.solveCloudflareCaptcha();
    } else {
        cloudflareCaptchaData = await page.findCloudflareCaptcha();
    }

    if (request.body.navigationOptions) {
        await page.waitForNavigation(request.body.navigationOptions);
    }

    const waitOptions = request.body.waitOptions || {timeout: DEFAULT_TIMEOUT};
    const contents = await utils.getContents(page, waitOptions);

    return {
        ...contents,
        cloudflare_captcha_data: cloudflareCaptchaData,
    }
}
