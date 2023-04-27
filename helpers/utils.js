const {proxyRequest} = require('puppeteer-proxy');
const PAGE_PROXY_URL_KEY = 'puppeteer-service-proxy-url'

async function findContextInBrowser(browser, contextId) {
    for (const context of browser.browserContexts()) {
        if (contextId === context.id) {
            return context;
        }
    }
    throw "Context not found";
}

async function findPageInContext(context, pageId) {
    for (const page of await context.pages()) {
        if (pageId === page.target()._targetId) {
            return page;
        }
    }
    throw "Page not found";
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

async function wait(page, waitFor, options = {}) {
    // TODO This mimics old page.waitFor behaviour.
    //  Instead we should update our API to support explicit waiting on selector/xpath/timeout.

    if (!waitFor) {
        return;
    }
    if (waitFor instanceof Object) {
        const {selectorOrTimeout, options: moreOptions} = waitFor;
        return wait(page, selectorOrTimeout, {...options, ...moreOptions});
    }
    if (!isNaN(waitFor)) {
        return new Promise(resolve => setTimeout(resolve, waitFor));
    }
    if (typeof waitFor === 'string') {
        if (waitFor.startsWith('//')) {
            return page.waitForXPath(waitFor, options);
        } else {
            return page.waitForSelector(waitFor, options);
        }
    }
    throw `Can't wait on ${typeof waitFor}`;
}

exports.formResponse = async function formResponse(page, closePage, waitFor) {
    await wait(page, waitFor);

    const response = {
        contextId: page.browserContext().id,
        html: await page.content(),
        cookies: await page.cookies(),
    };

    if (closePage) {
        await page.close();
    }

    if (!page.isClosed()) {
        response.pageId = page.target()._targetId;
    }

    return response;
};

async function newPage(context) {
    const page = await context.newPage();

    await page.setRequestInterception(true);

    // This is request interception in order to make request through proxies
    page.on('request', async request => {
        const {[PAGE_PROXY_URL_KEY]: proxyUrl} = page;
        if (proxyUrl) {
            proxyRequest({page, proxyUrl, request});
        } else {
            request.continue();
        }
    });

    return page;
}

/***
 * This function returns a page from browser context or create new page or even context if pageId or contextId are
 * none. If no context or now page found throw an error.
 * @param browser
 * @param contextId - identifier of context to find.
 * @param pageId - identifier of page to find.
 * @returns {Promise<Page>}
 */
exports.getBrowserPage = async function getBrowserPage(browser, contextId, pageId) {
    if (contextId && pageId) {
        const context = await findContextInBrowser(browser, contextId);
        return await findPageInContext(context, pageId);
    } else if (contextId) {
        const context = await findContextInBrowser(browser, contextId);
        return await newPage(context);
    } else {
        const context = await browser.createIncognitoBrowserContext();
        return await newPage(context);
    }
};

exports.performAction = async function performAction(request, action) {
    const {contextId, pageId} = request.query;
    const lock = request.app.get('lock');
    const page = await exports.getBrowserPage(request.app.get('browser'), contextId, pageId);
    return lock.acquire(page.target()._targetId, async () => {
        let extraHeaders = {};

        if ('body' in request && 'headers' in request.body) {
            extraHeaders = {...request.body.headers};
        }

        if ('body' in request && 'proxy' in request.body) {
            // TODO maybe we should map page ids to proxies instead
            page[PAGE_PROXY_URL_KEY] = request.body.proxy;
        }

        if ('cookie' in extraHeaders) {
            // TODO set cookies from request body like headers
            const url = request.body.url || page.url()
            const cookies = extraHeaders.cookie.split(';').map(s => {
                const [name, value] = s.trim().split(/=(.*)/, 2);
                return {name, value, url};
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
