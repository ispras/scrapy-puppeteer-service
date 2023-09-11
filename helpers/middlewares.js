exports.exceptionMiddleware = async function exceptionMiddleware(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const contextId = err.contextId || req.query.contextId;
    const pageId = err.pageId || req.query.pageId;
    const errorMessage = err.message || 'Unknown error';

    res.status(500);
    if (contextId) {
        res.header('scrapy-puppeteer-service-context-id', contextId);
    }
    res.send({
        contextId,
        pageId,
        error: errorMessage
    });
    next(err);
}
