exports.exceptionMiddleware = async function exceptionMiddleware(err, req, res, next) {
    res.status(500);
    res.send({
        'contextId': err.contextId,
        'pageId': err.pageId,
    });
    next(err.error);
}