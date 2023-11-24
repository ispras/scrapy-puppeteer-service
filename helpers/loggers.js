const winston = require('winston');

const log_printer = winston.format.printf((info) => {
    const log = `[${info.timestamp}] ${info.level}: ${info.message}`;

    return info.stack ? `${log}\n${info.stack}` : log;
});

const file_format = winston.format.combine(
    winston.format.errors({stack: true}),
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
    log_printer,
);

const console_format = winston.format.combine(
    winston.format.errors({stack: true}),
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
    winston.format.colorize({message: true}),
    log_printer,
);

// const common_format = winston.format.combine(
//     winston.format.errors({stack: true}),
//     winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
//     log_printer,
// );

// const file_format = winston.format.combine(
//     common_format,
// )

// const console_format = winston.format.combine(
//     winston.format.colorize({all: true}),
//     common_format,
// )

const transports = [
    new winston.transports.File({
        level: 'error',
        filename: 'errors.log',
        format: file_format,
    }),
    new winston.transports.Console({
        level: 'http',
        format: console_format,
    }),
    new winston.transports.File({
        level: 'http',
        filename: 'combined.log',
        format: file_format,
    }),
]

const logger = winston.createLogger({
    level: 'verbose',
    // format: console_format,
    transports: transports,
});
exports.logger = logger;
