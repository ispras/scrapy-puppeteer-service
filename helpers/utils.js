const fetch = require('./fetcher');

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
        const {selectorOrTimeout, options} = waitFor;
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
    let page = await context.newPage();

    await page.setRequestInterception(true);

    // This is request interception in order to make request through proxies
    page.on('request', async interceptedRequest => {
        const schemaType = new URL(interceptedRequest.url()).protocol;

        if ('puppeteer-service-proxy-url' in interceptedRequest.headers() && ['http:', 'https:'].indexOf(schemaType) !== -1) {
            const options = {
                method: interceptedRequest.method(),
                headers: interceptedRequest.headers(),
                body: interceptedRequest.postData(),
            };

            let proxy = options.headers['puppeteer-service-proxy-url'];
            delete options.headers['puppeteer-service-proxy-url'];

            fetch(interceptedRequest.url(), options, proxy)
                .then(async (response) => {
                    interceptedRequest.respond({
                        status: response.statusCode,
                        contentType: response.headers['content-type'],
                        headers: response.headers,
                        body: response.body,
                    });
                })
                .catch((err) => {
                    interceptedRequest.respond({
                        status: 404,
                        body: err.stack,
                    });
                });

        } else {
            interceptedRequest.continue();
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
        let context = await findContextInBrowser(browser, contextId);
        return await findPageInContext(context, pageId);
    } else if (contextId) {
        let context = await findContextInBrowser(browser, contextId);
        return await newPage(context);
    } else {
        let context = await browser.createIncognitoBrowserContext();
        return await newPage(context);
    }
};

exports.performAction = async function performAction(request, action) {
    let lock = request.app.get('lock');
    let page = await exports.getBrowserPage(request.app.get('browser'), request.query.contextId, request.query.pageId);
    return lock.acquire(await page._target._targetId, async () => {

        let extraHeaders = {};

        if ('body' in request && 'headers' in request.body) {
            extraHeaders = { ...request.body.headers };
        }

        if ('body' in request && 'proxy' in request.body) {
            extraHeaders['puppeteer-service-proxy-url'] = request.body.proxy
        }

        if ('cookie' in extraHeaders) {
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
