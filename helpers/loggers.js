const winston = require('winston');

const log_printer = winston.format.printf((info) => {
    let log = `[${info.timestamp}] ${info.level}: ${info.message}`;
    log = info.stack ? `${log}\n${info.stack}\n` : log;
    return log;
});

const file_format = winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
    winston.format.errors({stack: true}),
    log_printer,
);

const console_format = winston.format.combine(
    winston.format.errors({stack: true}),
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
    winston.format.colorize({level: true}),
    log_printer,
);

const transports = [
    new winston.transports.Console({
        level: 'http',
        format: console_format,
    }),
    new winston.transports.File({
        level: 'http',
        filename: 'logs.log',
        format: file_format,
    }),
]

exports.logger = winston.createLogger({
    level: 'verbose',
    transports: transports,
});
