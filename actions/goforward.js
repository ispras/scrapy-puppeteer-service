const utils = require('../helpers/utils');

exports.goForward = async function goForward(page, request) {
    await page.goForward(request.body.navigationOptions);
    return await utils.getContents(page, request.body.waitOptions);
}
