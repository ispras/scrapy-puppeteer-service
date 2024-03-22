const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();


async function captureSnapshot(page) {  // TODO: actually, we have ...(page, request) interface
    const cdpSession = await page.target().createCDPSession();
    const { data } = await cdpSession.send('Page.captureSnapshot', { format: 'mhtml' });
    await cdpSession.detach()
    return {
        ...utils.getIds(page),
        mhtml: data,
    };
}

/**
 * Captures mhtml snapshot of a page
 */
router.post('/', async function (req, res, next) {

    try {
        const response = await utils.performAction(req, captureSnapshot);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
