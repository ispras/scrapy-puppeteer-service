/**
 * Captures mhtml snapshot of the page.
 */
exports.captureSnapshot = async function captureSnapshot(page, request) {
    const cdpSession = await page.target().createCDPSession();
    const { data } = await cdpSession.send('Page.captureSnapshot', { format: 'mhtml' });
    await cdpSession.detach()
    return {
        mhtml: data,
    };
}
