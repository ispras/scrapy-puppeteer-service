let MAX_CONTEXT_COUNTER;
let contextCounter = 0;

function incContextCounter() {}
exports.incContextCounter = incContextCounter;  // Empty function or incrementer

function decContextCounter() {}
exports.decContextCounter = decContextCounter;  // Empty function or decrementer

function canCreateContext() { return true; }
exports.canCreateContext = canCreateContext;  // Truish function or checker if the context can be created

exports.initContextCounter = function (maxContextCounter) {
    if (!isNaN(maxContextCounter)) {
        MAX_CONTEXT_COUNTER = maxContextCounter;
        exports.incContextCounter = () => { contextCounter++ };
        exports.decContextCounter = () => { contextCounter-- };
        exports.canCreateContext = () => { return contextCounter < MAX_CONTEXT_COUNTER }
    }
}
