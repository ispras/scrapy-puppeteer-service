/**
 * Method that returns screenshots of pages
 * more description of options you can see on GitHub:
 * https://github.com/GoogleChrome/puppeteer/blob/v1.19.0/docs/api.md#pagescreenshotoptions
 */
exports.screenshot = async function screenshot(page, request) {
    delete request.body.options.path; // no path for saving images
    request.body.options.encoding = "base64"; // return in base64 
    let screenshot = await page.screenshot(request.body.options);
    return {
        screenshot: screenshot
    };
}
