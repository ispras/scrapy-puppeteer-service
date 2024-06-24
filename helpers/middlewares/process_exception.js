const exceptions = require("../exceptions");

/***
 * Middleware for processing exceptions.
 ***/
exports.processExceptionMiddleware = async function processExceptionMiddleware(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const contextId = err.contextId || req.query.contextId;
    const pageId = err.pageId || req.query.pageId;
    const errorMessage = err.message || 'Unknown error';

    if (contextId) {
        res.header('scrapy-puppeteer-service-context-id', contextId);
    }

    if (err instanceof exceptions.TooManyContextsError) {
        res.status(429);  // Too Many Requests
    } else if (err.contextId) {  // there was a context, but something went wrong
        res.status(500);
    } else {  // No context. Possibly, our service was restarted
        if (err instanceof exceptions.PageNotFoundError || err instanceof exceptions.ContextNotFoundError) {
            res.status(422);  // Unprocessable Entity
        } else {
            res.status(500);
        }
    }

    res.send({
        contextId,
        pageId,
        error: errorMessage
    });

    next(err);
}
