const express = require('express');
const router = express.Router();

/**
 * HealthCheck endpoint.
 * Sends 2xx status code if the server is up,
 *       5xx otherwise.
 * As a response returns an object:
 * {
 *     timestamp: timestamp,
 *     uptime: number,
 *     message: string,
 *     browser: {  // browser info
 *         connection: boolean,
 *         version: string,
 *         contexts: number,
 *         pages: number,
 *     }
 * }
 **/
router.get('/', async (req, res, next) => {
    const healthCheck = {
        timestamp: Date.now(),
        uptime: process.uptime(),
        message: "OK",
    };

    const browser = req.app.get('browser');
    if (browser) {
        healthCheck.browser = {
            connection: browser.isConnected(),
            version: await browser.version(),
            contexts: browser.browserContexts().length,
            pages: (await browser.pages()).length,
        }
    } else {
        healthCheck.message = "Browser is undefined";
    }

    try {
        res.send(healthCheck);
    } catch (e) {
        healthCheck.message = e.toString();
        res.status(503);  // Service Unavailable
        res.send(healthCheck);
    }
});

module.exports = router;
