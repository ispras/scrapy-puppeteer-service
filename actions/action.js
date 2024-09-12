const exceptions = require('../helpers/exceptions');
const utils = require('../helpers/utils');  // For usage inside user's action(page, request) function

/**
 * Content-Type: application/javascript
 * body = js function  as pattern:
 * async function action(page, request) {
 *      ...
 *      some actions with page in puppeteer syntax
 *      ...
 *      return {
 *          context_id: page.browserContext().id,
 *          page_id: page.target()._targetId,
 *          html: await page.content(),
 *          cookies: await page.cookies()
 *      };
 * };
 */
exports.action = async function action(page, request) {
    eval(request.body.toString());

    // check action function existence
    if (!(typeof action === "function" && action.length >= 1)) {
        throw new exceptions.IncorrectArgumentError("Invalid action function.\n" +
            "Valid action function: \"async function action(page, request) " +
            "{ ... some actions with request and page in puppeteer " +
            "syntax};\"");
    }

    return {
        data: await action(page, request)
    }
}
