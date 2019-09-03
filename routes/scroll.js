const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();


async function action(page, request) {
    await page.hover(request.body.selector);
    return utils.formResponse(page, request.query.closePage);
}

// Method that scrolls page to a certain selector
router.post('/', async function (req, res, next) {
    try {
        let response = await utils.perfomAction(req, action);

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    } catch (e) {
        next(e);
    }
});

module.exports = router;