const winston = require('winston');

const log_printer = winston.format.printf((info) => {
    const log = `[${info.timestamp}] ${info.level}: ${info.message}`;

    return info.stack ? `${log}\n${info.stack}` : log;
});

const format = winston.format.combine(
    winston.format.errors({stack: true}),
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
    // winston.format.colorize({all:true}),
    log_printer,
);

const transports = [
    new winston.transports.File({
        level: 'error',
        filename: 'errors.log',
    }),
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
]

const logger = winston.createLogger({
    level: 'verbose',
    format: format,
    transports: transports,
});

exports.logger = logger;
