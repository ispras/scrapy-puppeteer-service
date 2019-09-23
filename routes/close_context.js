const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();


router.post('/', async function (req, res, next) {
    try {
        await utils.closeContext(req);
        res.status(200);
        res.send("Successfully closed context");
    } catch (e) {
        next(e);
    }
});

module.exports = router;
