const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();


async function action(page, request) {
    await page.goBack(request.body.options);
    return utils.formResponse(page, request.query.closePage);
}

router.post('/', async function (req, res, next) {

    if (!req.query.contextId || !req.query.pageId) {
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
