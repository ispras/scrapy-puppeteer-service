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
