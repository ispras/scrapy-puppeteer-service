const winston = require('winston');

const log_printer = winston.format.printf((info) => {
    const log = `[${info.timestamp}] ${info.level}: ${info.message}`;

    return info.stack ? `${log}\n${info.stack}` : log;
});

const common_format = winston.format.combine(
    winston.format.errors({stack: true}),
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
    log_printer,
);

const file_format = winston.format.combine(
    common_format,
)

const console_format = winston.format.combine(
    common_format,
    winston.format.colorize({all:true}),
)

const transports = [
    new winston.transports.File({
        level: 'error',
        filename: 'errors.log',
        format: file_format,
    }),
    new winston.transports.Console({
        format: console_format,
    }),
    new winston.transports.File({
        filename: 'combined.log',
        format: file_format,
    }),
]

const logger = winston.createLogger({
    level: 'verbose',
    transports: transports,
});
exports.logger = logger;
