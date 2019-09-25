const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.status(200).send('Express Puppeteer service API');
});

module.exports = router;
