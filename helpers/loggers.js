const winston = require('winston');

const logPrinter = winston.format.printf((info) => {
    let log = `[${info.timestamp}] ${info.level}: ${info.message}`;

    if (info.stack) {
        log = `${log}`
            + "\nRequest parameters:"
            + `\n    contextId: ${info.contextId}`
            + `\n    pageId: ${info.pageId}`
            + `\n${info.stack}\n`
    }

    return log;
});

const fileFormat = winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
    winston.format.errors({stack: true}),
    logPrinter,
);

const consoleFormat = winston.format.combine(
    winston.format.errors({stack: true}),
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
    winston.format.colorize({level: true}),
    logPrinter,
);

let logger;

function createTransports(logLevel, logFilePath) {
    let transports = [];

    transports.push(new winston.transports.Console({
        level: logLevel,
        format: consoleFormat,
    }));
    if (logFilePath !== undefined) {
        transports.push(new winston.transports.File({
            level: logLevel,
            filename: logFilePath,
            format: fileFormat,
        }));
    }

    return transports;
}

exports.initLogger = function initLogger(logLevel, logFilePath) {
    const transports = createTransports(logLevel, logFilePath);

    logger = winston.createLogger({
        level: logLevel,
        transports: transports,
    });
}

function getBody(body) {
    if (body instanceof Buffer) {  // Action request
        body = JSON.stringify(body, null, 8);
        body = body.replace(/\\n/g, "\n");  // To log new lines and not `\n`
    } else {  // Other requests
        body = JSON.stringify(body, null, 8);
    }

    return body;
}

exports.format = function format(tokens, req, res) {
    const reqContextId = req.query["contextId"];
    const reqPageId = req.query["pageId"];
    const resContextId = res.get('scrapy-puppeteer-service-context-id');
    const closePage = req.query["closePage"] === "1";

    const url = req.baseUrl || req.originalUrl || req.url;
    const queryIndex = url.indexOf('?');
    const pathname = queryIndex !== -1 ? url.slice(1, queryIndex) : url.slice(1);

    return `${pathname} (${tokens.status(req, res)})`
        + "\nRequest parameters:"
        + `${reqContextId ? `\n    contextId: ${reqContextId}` : ""}`
        + `${reqPageId ? `\n    pageId: ${reqPageId}` : ""}`
        + `\n    closePage: ${closePage}`
        + `\n    body: ${getBody(req.body)}`
        + `${!reqContextId && resContextId ? `\nCreated page with ${resContextId} contextId` : ""}`;
}

exports.getLogger = function getLogger() {
    return logger;
}
