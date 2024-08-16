const {getLogger} = require('../helpers/loggers');

let contextCounter = 0;

function incContextCounter() {}
exports.incContextCounter = incContextCounter;  // Empty function or incrementer

function decContextCounter() {}
exports.decContextCounter = decContextCounter;  // Empty function or decrementer

function canCreateContext() { return true; }
exports.canCreateContext = canCreateContext;  // Truish function or checker if the context can be created

function updateContextTimeout(contextNumber) {}
exports.updateContextTimeout = updateContextTimeout;  // Empty function or setter

exports.initContextCounter = function (maxContextCounter) {
    if (!isNaN(maxContextCounter)) {
        exports.incContextCounter = () => { contextCounter++ };
        exports.decContextCounter = () => { contextCounter-- };
        exports.canCreateContext = () => { return contextCounter < maxContextCounter };
        exports.updateContextTimeout = (contextsNumber) => {
            getLogger().warn(`Changing contextCounter from ${contextCounter} to ${contextsNumber} due to synchronization\n`);
            contextCounter = contextsNumber;
        };
    }
}
