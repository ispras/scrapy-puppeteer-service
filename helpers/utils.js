const { proxyRequest } = require('puppeteer-proxy');
const PROXY_URL_KEY = 'puppeteer-service-proxy-url'

async function findContextInBrowser(browser, contextId) {

    for (let context of browser.browserContexts()) {
        if (contextId === await context._id) {
            return context;
        }
    }
    throw "Context not found";
}

async function findPageInContext(context, pageId) {
    for (let page of await context.pages()) {
        if (pageId === await page._target._targetId) {
            return page;
        }
    }
    throw "Page not found";
}

exports.closeContexts = async function closeContexts(browser, contextIds) {
    // TODO shared locks on contexts and exclusive on pages?
    let close_promises = [];
    for (let context of browser.browserContexts()) {
        if (contextIds.includes(context._id)) {
            close_promises.push(context.close());
        }
    }
    await Promise.all(close_promises);
};

async function wait(page, waitFor) {
    if (waitFor instanceof Object) {
        const { selectorOrTimeout, options } = waitFor;
        if (selectorOrTimeout) {
            await page.waitFor(selectorOrTimeout, options);
        }
    } else if (waitFor) {
        await page.waitFor(waitFor);
    }
}

exports.formResponse = async function formResponse(page, closePage, waitFor) {
    await wait(page, waitFor);

    let response = {
        contextId: page.browserContext()._id,
        html: await page.content(),
        cookies: await page.cookies(),
    };

    if (closePage) {
        await page.close();
    }

    if (!page.isClosed()) {
        response.pageId = await page._target._targetId;
    }

    return response;
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
        await page.authenticate({ username, password });
    }
    return page;
};

exports.performAction = async function performAction(request, action) {
    const lock = request.app.get('lock');
    const page = await exports.getBrowserPage(request.app.get('browser'), request);
    return lock.acquire(await page._target._targetId, async () => {
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

        return await action(page, request);
    });
};
