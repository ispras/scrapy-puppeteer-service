const morgan = require('morgan');
const loggers = require('./loggers');
const exceptions = require("./exceptions");


exports.logHTTPMiddleware = function logHTTPMiddleware() {
    const logger = loggers.getLogger();

    return morgan(
        loggers.HTTPFormat,
        {
            stream: {
                write: (message) => logger.http(message),
            },
        }
    );
}

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

    if (err.contextId) {  // there was a context, but something went wrong
        res.status(500);
    } else {  // No context. Possibly, our service was restarted
        if (err instanceof exceptions.PageNotFoundError || err instanceof exceptions.ContextNotFoundError) {
            res.status(422);
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

exports.logExceptionMiddleware = async function logExceptionMiddleware(err, req, res, next) {
    loggers.getLogger().error({
        message: err,
        contextId: req.query["contextId"],
        pageId: req.query["pageId"],
    });
    next();
}
