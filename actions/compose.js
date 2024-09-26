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

async function compose(page, request) {
    const originalClosePage = request.query.closePage;
    const originalBody = structuredClone(request.body);

    request.query.closePage = false;
    delete request.body["actions"];

    let response;
    try {
        for (const action of originalBody["actions"]) {
            request.body = action["body"];
            response = await endpoint2action[action["endpoint"]](page, request);
        }
    } finally {
        request.query.closePage = originalClosePage;
        request.body = originalBody;
    }

    return response;
}
exports.compose = compose;
