const exceptions = require("./exceptions");
const { proxyRequest } = require('puppeteer-proxy');

const PROXY_URL_KEY = 'puppeteer-service-proxy-url'

async function findContextInBrowser(browser, contextId) {
    for (const context of browser.browserContexts()) {
        if (contextId === context.id) {
            return context;
        }
    }
    throw new exceptions.ContextNotFoundError();
}

async function findPageInContext(context, pageId) {
    for (const page of await context.pages()) {
        if (pageId === page.target()._targetId) {
            return page;
        }
    }
    throw new exceptions.PageNotFoundError();
}

exports.closeContexts = async function closeContexts(browser, contextIds) {
    // TODO shared locks on contexts and exclusive on pages?
    const closePromises = [];
    for (const context of browser.browserContexts()) {
        if (contextIds.includes(context.id)) {
            closePromises.push(context.close());
        }
    }
    await Promise.all(closePromises);
};

async function wait(page, waitFor) {
    let { selector, xpath, timeout, options } = waitFor;

    // for compatibility with old waitFor interface
    const { selectorOrTimeout } = waitFor;
    if (selectorOrTimeout) {
        if (!isNaN(selectorOrTimeout)) {
            timeout = selectorOrTimeout;
        } else if (typeof selectorOrTimeout === 'string') {
            if (selectorOrTimeout.startsWith('//')) {
                xpath = selectorOrTimeout;
            } else {
                selector = selectorOrTimeout;
            }
        }
    }

    if ([selector, xpath, timeout].filter(Boolean).length > 1) {
        throw new Error("Wait options must contain either a selector, an xpath or a timeout");
    }

    if (selector) {
        return page.waitForSelector(selector, options);
    }
    if (xpath) {
        return page.waitForXPath(xpath, options);
    }
    if (timeout) {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }
}

/***
 * This function returns `pageId` and `contextId` of corresponding page.
 * @param page
 * @returns Promise
 */
async function getIds(page) {
    return {
        contextId: page.browserContext().id,
        pageId: page.target()._targetId,
    }
}

exports.getContents = async function getContents(page, waitFor) {
    if (waitFor) {
        await wait(page, waitFor);
    }

    return {
        html: await page.content(),
        cookies: await page.cookies(),
    };
};

async function newPage(context) {
    const page = await context.newPage();

    await page.setRequestInterception(true);

    // This is request interception in order to make request through proxies
    page.on('request', async request => {
        const proxyUrl = page[PROXY_URL_KEY];
        const contextProxyUrl = page.browserContext()[PROXY_URL_KEY];
        if (proxyUrl && proxyUrl !== contextProxyUrl) {
            proxyRequest({ page, proxyUrl, request });
        } else {
            request.continue();
        }
    });

    return page;
}

function getProxy(request) {
    if ('body' in request && 'proxy' in request.body) {
        return request.body.proxy;
    }
}

/***
 * This function returns a page from browser context or create new page or even context if pageId or contextId are
 * none. If no context or now page found throw an error.
 * @param browser
 * @param request
 * @returns {Promise<Page>}
 */
exports.getBrowserPage = async function getBrowserPage(browser, request) {
    const { contextId, pageId } = request.query;
    if (contextId) {
        const context = await findContextInBrowser(browser, contextId);
        return pageId ? findPageInContext(context, pageId) : newPage(context);
    }
    const proxy = getProxy(request);
    if (!proxy) {
        const context = await browser.createIncognitoBrowserContext();
        return newPage(context);
    }
    const { origin: proxyServer, username, password } = new URL(proxy);

    const context = await browser.createIncognitoBrowserContext({ proxyServer });
    context[PROXY_URL_KEY] = proxy;
    const page = await newPage(context);
    if (username) {
        await page.authenticate({
            username: decodeURIComponent(username),
            password: decodeURIComponent(password)
        });
    }
    return page;
};

exports.performAction = async function performAction(request, action) {
    const lock = request.app.get('lock');
    const page = await exports.getBrowserPage(request.app.get('browser'), request);
    return lock.acquire(page.target()._targetId, async () => {
        let extraHeaders = {};

        if ('body' in request && 'headers' in request.body) {
            extraHeaders = { ...request.body.headers };
        }

        const proxy = getProxy(request);
        if (proxy) {
            page[PROXY_URL_KEY] = proxy;
        }

        if ('cookie' in extraHeaders) {
            // TODO set cookies from request body like headers
            const url = request.body.url || page.url()
            const cookies = extraHeaders.cookie.split(';').map(s => {
                const [name, value] = s.trim().split(/=(.*)/, 2);
                return { name, value, url };
            });
            delete extraHeaders.cookie;
            await page.setCookie(...cookies);
        }

        if (Object.keys(extraHeaders).length !== 0) {
            await page.setExtraHTTPHeaders(extraHeaders);
        }

        const response = await getIds(page);

        try {
            Object.assign(response, await action(page, request));
        } catch (err) {
            err.contextId = response.contextId;
            err.pageId = response.pageId;
            throw err;
        }

        if (request.query.closePage && !page.isClosed()) {
            await page.close();
        }
        if (page.isClosed()) {
            delete response.pageId;
        }

        return response;
    });
};
