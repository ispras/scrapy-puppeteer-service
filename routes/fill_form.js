const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();

async function action(page, request) {
    const inputMapping = request.body.inputMapping;
    const submitButton = request.body.submitButton || null;

    for (const [selector, params] of Object.entries(inputMapping)) {
        const value = params.value || "";
        const delay = params.delay || 0;
        await page.type(selector, value, { delay });
    }

    if (submitButton) {
        await page.click(submitButton);
    }

    return await utils.getContents(page);

}

// body = {
//     "inputMapping": { A dictionary where each key is a CSS selector, and each value is another dictionary containing details about the input for that element:
//         "selector": <string> The CSS selector for the input element (used as the key).
//         "value": <string> The text to be inputted into the element.
//         "delay": <number> A delay (in milliseconds) between each keystroke when inputting the text. Defaults to 0 if not provided.
//     },
//     "submitButton": <string> The CSS selector for the form's submit button. If provided, the button will be clicked after filling in the form.
// }
//
router.post('/', async function (req, res, next) {

    if (!req.body.inputMapping) {
        res.status(400);
        res.send("No inputMapping provided in fill_form request");
        next();
        return;
    }

    try {
        let response = await utils.performAction(req, action);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response);
    } catch (e) {
        next(e);
    }
});

module.exports = router;