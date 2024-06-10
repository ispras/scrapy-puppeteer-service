const express = require('express');
const router = express.Router();

/**
 * HealthCheck endpoint.
 * Sends 2xx status code if the server is up,
 *       5xx otherwise.
 * As a response returns an object:
 * {
 *     uptime: number,
 *     message: string,
 *     timestamp: timestamp,
 * }
 **/
router.get('/', async (req, res, next) => {
    const healthCheck = {
        uptime: process.uptime(),
        message: "OK",
        timestamp: Date.now(),
    };

    try {
        res.send(healthCheck);
    } catch (e) {
        healthCheck.message = e.toString();
        res.status(503);  // Service Unavailable
        res.send(healthCheck);
    }
});

module.exports = router;
