const utils = require('../helpers/utils');

/*
 * body = {
 *     "url": <string> URL to navigate page to. The url should include scheme, e.g. https://.
 *     "navigationOptions": { Navigation parameters which might have the following properties:
 *         "timeout": <number> Maximum navigation time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout. The default value can be changed by using the page.setDefaultNavigationTimeout(timeout) or page.setDefaultTimeout(timeout) methods.
 *         "waitUntil": <string|Array<string>> When to consider navigation succeeded, defaults to load. Given an array of event strings, navigation is considered to be successful after all events have been fired. Events can be either:
 *              load - consider navigation to be finished when the load event is fired.
 *              domcontentloaded - consider navigation to be finished when the DOMContentLoaded event is fired.
 *              networkidle0 - consider navigation to be finished when there are no more than 0 network connections for at least 500 ms.
 *              networkidle2 - consider navigation to be finished when there are no more than 2 network connections for at least 500 ms.
 *         "referer" <string> Referer header value. If provided it will take preference over the referer header value set by page.setExtraHTTPHeaders().
 *     },
 *     "waitOptions": {
 *         "timeout": <number> Wait for given timeout in milliseconds
 *         "selector": <string> Wait for element by selector (see https://pptr.dev/api/puppeteer.page.waitforselector)
 *         "xpath": <string> Wait for element by xpath (see https://pptr.dev/api/puppeteer.page.waitforxpath)
 *         "options": <object> Options to wait for elements (see https://pptr.dev/api/puppeteer.waitforselectoroptions)
 *     },
 *     "harRecording": true,
 * }
 */
exports.goto = async function goto(page, request) {
    await page.goto(request.body.url, request.body.navigationOptions);
    return await utils.getContents(page, request.body.waitOptions);
}
