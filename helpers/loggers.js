const winston = require('winston');
const LogstashTransport = require('winston-logstash/lib/winston-logstash-latest')

const logPrinter = winston.format.printf((info) => {
    let log = `[${info.timestamp}] ${info.level}: ${info.message}`;

    if (info.stack) {
        log = `${log}`
            + `\ncontextId: ${info.contextId}`
            + `\npageId: ${info.pageId}`
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

function createTransports(logLevel, logFilePath, logstashHost, logstashPort) {
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
    if (logstashHost !== undefined && logstashPort !== undefined) {
        transports.push(new LogstashTransport({
            host: logstashHost,
            port: logstashPort,
            format: fileFormat,
            level: logLevel,
            max_connect_retries: -1,
        }));
    }

    return transports;
}

/***
 * The function initializes logger.
 *
 * @param logLevel Logging level which controls amount of logs
 * @param logFilePath (Optional) Logging file to which logs will be written
 * @param logstashHost (Optional) Logstash Host (e.g. 0.0.0.0)
 * @param logstashPort (Optional) Logstash Port (e.g. 9091)
 * @returns void
***/
exports.initLogger = function initLogger(logLevel, logFilePath, logstashHost, logstashPort) {
    const transports = createTransports(logLevel, logFilePath, logstashHost, logstashPort);

    logger = winston.createLogger({
        level: logLevel,
        transports: transports,
    });
}

function getBody(body) {
    if (body instanceof Buffer) {  // Action request
        body = body.toString()
    } else {  // Other requests
        body = JSON.stringify(body, null, 8);
    }

    return body;
}

/***
 * Format for the request-response logging messages.
***/
exports.HTTPFormat = function HTTPFormat(tokens, req, res) {
    const reqContextId = req.query["contextId"];
    const reqPageId = req.query["pageId"];
    const resContextId = res.get('scrapy-puppeteer-service-context-id');
    const closePage = req.query["closePage"] === "1";

    const url = req.baseUrl || req.originalUrl || req.url;
    const queryIndex = url.indexOf('?');
    const pathname = queryIndex !== -1 ? url.slice(1, queryIndex) : url.slice(1);

    return `${pathname} (${tokens.status(req, res)})`
        + `${reqContextId ? `\ncontextId: ${reqContextId}` : ""}`
        + `${reqPageId ? `\npageId: ${reqPageId}` : ""}`
        + `\nclosePage: ${closePage}`
        + "\nRequest parameters:"
        + `\n    body: ${getBody(req.body)}`
        + `${!reqContextId && resContextId ? `\nCreated page with ${resContextId} contextId` : ""}`;
}

/***
 * Get instance of service's logger.
***/
exports.getLogger = function getLogger() {
    return logger;
}
