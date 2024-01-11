const morgan= require('morgan');
const loggers = require('./loggers');

exports.createLogMiddleware = function createLogMiddleware(logLevel, logFilePath) {
    loggers.initLogger(logLevel, logFilePath);
    return morgan(loggers.format, loggers.getMorganOptions());
}

exports.processExceptionMiddleware = async function processExceptionMiddleware(err, req, res, next) {
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

exports.logExceptionMiddleware = async function logExceptionMiddleware(err, req, res, next){
    loggers.logger.error({message: err, req, res});
    next();
}
