const morgan= require('morgan');
const logger = require('./loggers');
const e = require("express");

const stream = {
    write: (message) => logger.logger.http(message),
};

const logMiddleware = morgan("short", {stream});
exports.logMiddleware = logMiddleware;


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
    logger.logger.error(err);
    next();
}
