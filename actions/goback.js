const utils = require('../helpers/utils');

exports.goBack = async function goBack(page, request) {
    await page.goBack(request.body.navigationOptions);
    return await utils.getContents(page, request.body.waitOptions);
}
