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

const transports = [
    new winston.transports.Console({
        level: 'http',
        format: consoleFormat,
    }),
    new winston.transports.File({
        level: 'http',
        filename: 'logs.log',
        format: fileFormat,
    }),
]

exports.logger = winston.createLogger({
    level: 'verbose',
    transports: transports,
});
