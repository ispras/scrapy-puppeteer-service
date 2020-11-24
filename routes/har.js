const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();


//TODO Method that returns har of page downloads using https://www.npmjs.com/package/puppeteer-har
router.post('/', async function (req, res, next) {

    if (!(typeof action === "function" && action.length >= 1)) {
        res.status("501");
        res.send("Not implemented yet");
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
