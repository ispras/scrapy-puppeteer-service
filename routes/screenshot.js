const express = require('express');
const router = express.Router();

//TODO Method that returns screenshots of pages
router.post('/', async function (req, res, next) {
    res.status("501");
    res.send("Not implemented yet");
});

module.exports = router;