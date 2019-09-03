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
        let lock = req.app.get('lock');
        let page = await utils.getBrowserPage(req.app.get('browser'), req.query.context_id, req.query.page_id);
        let response = await lock.acquire(await page._target._targetId, async () => {
            return action(page, req);
        });

        console.log("page_id=" + response.page_id + "&context_id=" + response.context_id);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    } catch (e) {
        next(e);
    }
});

module.exports = router;