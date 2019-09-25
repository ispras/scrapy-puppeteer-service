const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();


async function action(page, request) {
    await page.goForward(request.body.options);
    return utils.formResponse(page, request.query.closePage);
}

router.post('/', async function (req, res, next) {

    if (!req.query.context_id || !req.query.page_id) {
        res.status(400);
        res.send("No page in request");
        next();
        return;
    }

    try {
        let response = await utils.perfomAction(req, action);
        res.send(response)
        // res.setHeader('Content-Type', 'application/json');
        // res.send(JSON.stringify(response));
    } catch (e) {
        next(e);
    }
});

module.exports = router;
