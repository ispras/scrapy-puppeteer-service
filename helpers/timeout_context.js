const {BrowserContext} = require('puppeteer');
const loggers = require('./loggers');

/**
 * ContextId -> Timeout timer' IDs
 *
 * @type {{string: number}}
 */
let contextTimeoutIds = {};
let contextTimeout;

/**
 * Set timeout for context.
 *
 * @param {BrowserContext} context
 */
function setContextTimeout(context) {
    const logger = loggers.getLogger();

    contextTimeoutIds[context.id] = setTimeout(
        async () => {
            logger.warn(`Closing context ${context.id} due to timeout\n`);
            await context.close();
            delete contextTimeoutIds[context.id];
        },
        contextTimeout);
}
exports.setContextTimeout = setContextTimeout;

/**
 * The function clears context's timeout timer.
 *
 * @param {BrowserContext} context context to be cleared
 */
function clearContextTimeout(context) {
    clearTimeout(contextTimeoutIds[context.id]);
    delete contextTimeoutIds[context.id];
}
exports.clearContextTimeout = clearContextTimeout;

/**
 * Update timeout for context.
 *
 * @param {BrowserContext} context
 */
exports.updateContextTimeout = function updateContextTimeout (context) {
    clearContextTimeout(context);
    setContextTimeout(context);
}

/**
 * Init service that timeouts contexts after CONTEXT_TIMEOUT ms.
 *
 * @param {number} timeout
 */
exports.initTimeoutContext = function initTimeoutContext (timeout) {
    contextTimeout = timeout;
}
