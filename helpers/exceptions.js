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
