const express = require('express');
const router = express.Router();

/**
 *
 **/

router.get('/', async (req, res) => {
    const metrics = {
        timestamp: Date.now(),
        uptime: process.uptime(),
    };

    const browser = req.app.get('browser');
    if (browser) {
        metrics.browser = {
            contexts: browser.browserContexts().length,
            pages: (await browser.pages()).length,
        }
    }

    try {
        res.send(metrics);
    } catch (e) {
        res.status(503);  // Service Unavailable
        res.send(metrics);
    }
});

module.exports = router;
