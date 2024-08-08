exports.PageNotFoundError = class PageNotFoundError extends Error {
    constructor(message="Page not found", ...args) {
        super(message, ...args);
        this.message = message;
        this.name = "PageNotFoundError";
    }
}

exports.ContextNotFoundError = class ContextNotFoundError extends Error {
    constructor(message="Context not found", ...args) {
        super(message, ...args);
        this.message = message;
        this.name = "ContextNotFoundError";
    }
}

exports.TooManyContextsError = class TooManyContextsError extends Error {
    constructor(message="Could not create new context due to restriction", ...args) {
        super(message, ...args);
        this.message = message;
        this.name = "TooManyContextsError";
    }
}

exports.NoHarWriterError = class NoHarWriterError extends Error {
    constructor(message="There is no initialized Har Writer on the page to which the Har action was applied.", ...args) {
        super(message, ...args);
        this.message = message;
        this.name = "NoHarWriterError";
    }
}