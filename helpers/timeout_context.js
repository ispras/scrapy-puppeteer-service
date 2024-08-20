const {BrowserContext} = require('puppeteer');

const loggers = require('./loggers');
const limitContext = require("./limit_context");

/**
 * ContextId -> Timeout timer's IDs
 *
 * @type {{string: number}}
 */
let contextTimeoutIds = {};
let contextTimeout;

/**
 * Set timeout for context.
 *
 * @param {BrowserContext} context Browser context.
 **/
function setContextTimeout(context) {
    const logger = loggers.getLogger();

    contextTimeoutIds[context.id] = setTimeout(
        async () => {
            try {
                await context.close();
                limitContext.decContextCounter();
                logger.warn(`Context ${context.id} is closed due to timeout\n`);
            } catch (e) {
                logger.warn(`Context ${context.id} has fallen off\n`);
            } finally {
                delete contextTimeoutIds[context.id];
            }
        },
        contextTimeout,
    );
}
exports.setContextTimeout = setContextTimeout;

/**
 * The function clears context's timeout timer.
 *
 * @param {BrowserContext} context Context to be cleared
 */
function clearContextTimeout(context) {
    clearTimeout(contextTimeoutIds[context.id]);
    delete contextTimeoutIds[context.id];
}
exports.clearContextTimeout = clearContextTimeout;

/**
 * Update timeout for context.
 *
 * @param {BrowserContext} context Context.
 */
exports.updateContextTimeout = function updateContextTimeout (context) {
    clearContextTimeout(context);
    setContextTimeout(context);
}

/**
 * Init service that timeouts contexts after CONTEXT_TIMEOUT ms.
 *
 * @param {number} timeout Context timeout for the service.
 */
exports.initTimeoutContext = function initTimeoutContext (timeout) {
    contextTimeout = timeout;
}
