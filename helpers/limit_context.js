const { getLogger } = require('../helpers/loggers');

let contextCounter = 0;

function incContextCounter() {}
exports.incContextCounter = incContextCounter;  // Empty function or incrementer

function decContextCounter() {}
exports.decContextCounter = decContextCounter;  // Empty function or decrementer

function canCreateContext() { return true; }
exports.canCreateContext = canCreateContext;  // Truish function or checker if the context can be created

exports.initContextCounter = function (app, maxContextCounter) {
    if (!isNaN(maxContextCounter)) {
        exports.incContextCounter = () => { contextCounter++ };
        exports.decContextCounter = () => { contextCounter-- };
        exports.canCreateContext = () => { return contextCounter < maxContextCounter };

        setInterval(() => {  // Synchronize number of contexts every 1 minute
            const contextsNumber = app.get('browser').browserContexts().length - 1;  // Minus permanent context

            if (contextsNumber !== contextCounter) {
                getLogger().warn(`Changing contextCounter from ${contextCounter} to ${contextsNumber} due to synchronization\n`);
                contextCounter = contextsNumber;
            }
        }, 60000);
    }
}
