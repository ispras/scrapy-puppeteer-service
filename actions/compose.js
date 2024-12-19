const exceptions = require("../helpers/exceptions");

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

/**
 * Compose is a sequence of other actions that are performed on the page.
 * The function does not allow body to contain compose endpoint inside.
 *
 * body = {
 *      "actions": [  An array of actions
 *          {
 *              "endpoint": <string>,  Action endpoint
 *              "body": <object>,  A body that is processable by action on the endpoint
 *          },
 *          ...,
 *     ],
 * }
 */
async function compose(page, request) {
    // Validation
    if (!(request.body instanceof Object)) {
        throw new exceptions.IncorrectArgumentError("Body of compose method should be an Object.");
    }

    // Evaluation
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
