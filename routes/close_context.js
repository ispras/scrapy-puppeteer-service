const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();


router.post('/', async function (req, res, next) {
    try {
        let browser = req.app.get('browser');
        if (req.query.contextId) {
            await utils.closeContexts(browser, [req.query.contextId]);
        } else if (req.body instanceof Array) {
            await utils.closeContexts(browser, req.body);
        }
        res.status(200);
        res.send("Successfully closed context");
    } catch (e) {
        next(e);
    }
});

module.exports = router;
