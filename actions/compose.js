const utils = require("../helpers/utils");

endpoint2action = {
    action: require("./action").action,
    click: require("./click").click,
    fill_form: require("./fill_form").fillForm,
    back: require("./goback").goBack,
    forward: require("./goforward").goForward,
    goto: require("./goto").goto,
    har: require("./har").har,
    mhtml: require("./mhtml").captureSnapshot,
    recaptcha_solver: require("./recaptcha_solver").recaptchaSolver,
    screenshot: require("./screenshot").screenshot,
    scroll: require("./scroll").scroll,
}

exports.compose = async function compose(page, request) {
    const originalBody = request.body;  // TODO: to test!
    let response;
    for (const action of originalBody) {
        request.body = action["body"];
        response = await utils.performAction(request, endpoint2action[action.endpoint]);
    }
    return response;
}
