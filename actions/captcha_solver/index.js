const {recaptchaSolver} = require("./recaptcha_solver");
const {cloudflareCaptchaSolver} = require("./cloudflare_captcha_solver");
const utils = require("../../helpers/utils");


DEFAULT_TIMEOUT = 1000;

/**
 * The function solves captchas on the page.
 * Currently available captcha types: Recaptcha, Cloudflare.
 * Only work with enabled PuppeteerExtra.
 */
exports.captchaSolver = async function captchaSolver(page, request) {
    let responseData = {}
    if ("solveCloudflareCaptcha" in request.body) {
        Object.assign(responseData, await cloudflareCaptchaSolver(page, request));
    } else {
        console.log("No Solve CloudflareCaptcha");
    }
    if ("solveRecaptcha" in request.body) {
        Object.assign(responseData, await recaptchaSolver(page, request));
    }

    if (request.body.navigationOptions) {
        await page.waitForNavigation(request.body.navigationOptions);
    }

    const waitOptions = request.body.waitOptions || {timeout: DEFAULT_TIMEOUT};
    const contents = await utils.getContents(page, waitOptions);

    if (request.query.closePage ||
        (request.body.closeOnEmpty && !responseData.recaptchaData?.captchas && !responseData.cloudflareCaptchaData?.data)) {
        await page.close();
    }

    return {
        ...contents,
        ...responseData,
    };
}
