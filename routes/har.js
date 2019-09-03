const express = require('express');
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
        let response = await utils.perfomAction(req, action);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
    } catch (e) {
        next(e);
    }

});

module.exports = router;