const exceptions = require('../helpers/exceptions');

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
    if (!(/^\s*(async)?\s*function\s*action\s*\(\s*page\s*(,\s*request)?\)\s*{(.|\s)*}$/.test(request.body))) {
        throw new exceptions.IncorrectArgumentError("Invalid action function.\n" +
            "Valid action function: \"async function action(page, request) " +
            "{ ... some actions with request and page in puppeteer " +
            "syntax};\"");
    }

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
