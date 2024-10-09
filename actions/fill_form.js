const utils = require('../helpers/utils');

/*
 * body = {
 *     "inputMapping": { A dictionary where each key is a CSS selector, and each value is another dictionary containing details about the input for that element:
 *         "selector": <string> The CSS selector for the input element (used as the key).
 *         "value": <string> The text to be inputted into the element.
 *         "delay": <number> A delay (in milliseconds) between each keystroke when inputting the text. Defaults to 0 if not provided.
 *     },
 *     "submitButton": <string> The CSS selector for the form's submit button. If provided, the button will be clicked after filling in the form.
 * }
 */
exports.fillForm = async function fillForm(page, request) {
    const inputMapping = request.body.inputMapping;
    const submitButton = request.body.submitButton;

    for (const [selector, params] of Object.entries(inputMapping)) {
        const value = params.value;
        const delay = params.delay || 0;
        await page.type(selector, value, { delay });
    }

    if (submitButton) {
        await page.click(submitButton);
    }

    return await utils.getContents(page);

}
