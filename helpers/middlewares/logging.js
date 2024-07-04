const loggers = require("../loggers");
const morgan = require("morgan");

/***
 * Returns the middleware for logging HTTP request-response.
 ***/
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

/***
 * Middleware for logging exceptions.
 ***/
exports.logExceptionMiddleware = async function logExceptionMiddleware(err, req, res, next) {
    loggers.getLogger().error({
        message: err,
        contextId: req.query["contextId"],
        pageId: req.query["pageId"],
    });
    next();
}
