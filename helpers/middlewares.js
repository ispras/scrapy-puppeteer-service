const morgan= require('morgan');
const logger = require('./loggers');
const e = require("express");
const utils = require('./utils');
const url = require("url");

function format(tokens, req, res) {
    const contextId = req.query["contextId"] || "no context";
    const pageId = req.query["pageId"] || "no page";

    const url = req.baseUrl || req.originalUrl || req.url;
    const query_index = url.indexOf('?');
    const pathname = query_index !== -1 ? url.slice(1, query_index) : url.slice(1);

    let message = `${pathname} (${tokens.status(req, res)})\n`
        + "Request parameters:\n"
        + `    contextId: ${contextId}\n`
        + `    pageId: ${pageId}\n`
        + `    body: ${JSON.stringify(req.body, null, 8)}`;
    return message;
}

const options = {
    stream: {
        write: (message) => logger.logger.http(message)
    },
}

exports.logMiddleware = morgan(format, options);

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
    logger.logger.error({message: err, req, res});
    next();
}
