let MAX_CONTEXT_COUNTER;
let contextCounter = 0;

function incContextCounter() {}
exports.incContextCounter = incContextCounter;  // Empty function or incrementer

function decContextCounter() {}
exports.decContextCounter = decContextCounter;  // Empty function or decrementer

exports.initContextCounter = function (maxContextCounter) {
    if (!isNaN(maxContextCounter)) {
        MAX_CONTEXT_COUNTER = maxContextCounter;
        exports.incContextCounter = () => { contextCounter++ };
        exports.decContextCounter = () => { contextCounter-- };
    }
}

exports.limitContextMiddleware = async function limitContextMiddleware(req, res, next) {
    if (contextCounter > MAX_CONTEXT_COUNTER) {
        res.status(429);  // Too many requests
        res.send({msg: "Page counter expired"});
        next()
    }

    next();
}
