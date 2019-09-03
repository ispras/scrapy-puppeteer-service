const express = require('express');
const router = express.Router();

//TODO Method that returns har of page downloads using https://www.npmjs.com/package/puppeteer-har
router.post('/', async function (req, res, next) {
    res.status("501");
    res.send("Not implemented yet");
});

module.exports = router;