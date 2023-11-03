exports.exceptionMiddleware = async function exceptionMiddleware(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const contextId = err.contextId || req.query.contextId;
    const pageId = err.pageId || req.query.pageId;
    const errorMessage = err.message || 'Unknown error';


    if (contextId) {
        res.header('scrapy-puppeteer-service-context-id', contextId);
    }  // What if contextId is undefined? Maybe we should skip such situations...

    if (err.contextId) {  // there was a context, but something went wrong
        res.status(500);

        res.send({
            contextId,
            pageId,
            error: errorMessage
        });
    } else {  // No context. Possibly, our service was restarted
        res.status(422);

        res.send({
            error: errorMessage
        });
    }

    next(err);
}

exports.noContextMiddleware = async function noContextMiddleware(err, req, res, next) {
    res.status(422);

    res.send({
        error: "no context"
    });
    next(err);
}
