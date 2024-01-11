const winston = require('winston');

const logPrinter = winston.format.printf((info) => {
    let log = `[${info.timestamp}] ${info.level}: ${info.message}`;
    log = info.stack ? `${log}\n${info.stack}\n` : log;
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

exports.format = function format(tokens, req, res) {
    const contextId = req.query["contextId"] || "no context";
    const pageId = req.query["pageId"] || "no page";

    const url = req.baseUrl || req.originalUrl || req.url;
    const query_index = url.indexOf('?');
    const pathname = query_index !== -1 ? url.slice(1, query_index) : url.slice(1);

    return `${pathname} (${tokens.status(req, res)})\n`
        + "Request parameters:\n"
        + `    contextId: ${contextId}\n`
        + `    pageId: ${pageId}\n`
        + `    body: ${JSON.stringify(req.body, null, 8)}`;
}

exports.getMorganOptions = function getMorganOptions() {
    return {
        stream: {
            write: (message) => logger.http(message),
        },
    };
}
