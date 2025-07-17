const {recaptchaSolver} = require("./recaptcha_solver");
const {cloudflareCaptchaSolver} = require("./cloudflare_captcha_solver");


/**
 * The function solves captchas on the page.
 * Currently available captcha types: Recaptcha, Cloudflare.
 * Only work with enabled PuppeteerExtra.
 */
exports.captchaSolver = async function captchaSolver(page, request) {
    let responseData = {}
    if ("solveCloudflareCaptcha" in request.body) {
        Object.assign(responseData, await cloudflareCaptchaSolver(page, request));
    }
    if ("solveRecaptcha" in request.body) {
        Object.assign(responseData, await recaptchaSolver(page, request));
    }

    return responseData;
}
