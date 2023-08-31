exports.exceptionMiddleware = async function exceptionMiddleware(err, req, res, next) {
    if (!err.contextId) {
        err.contextId = req.query.contextId;
        err.pageId = req.query.pageId;
    }

    if (!err.contextId) {
        next(err);
    }

    res.status(500);
    res.header('scrapy-puppeteer-service-context-id', err.contextId);
    res.send({
        'contextId': err.contextId,
        'pageId': err.pageId,
        'error_msg': err.message,
    });
    next(err);
}
