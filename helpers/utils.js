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

exports.formResponse = async function formResponse(page, closePage) {
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

async function newPage(context, proxyPort) {
    let page = await context.newPage();

    await page.setRequestInterception(true);

    if (typeof proxyPort == 'number') {
        page.on('request', async interceptedRequest => {
            const uri = new URL(interceptedRequest.url());

            if ('puppeteer-service-proxy-url' in interceptedRequest.headers() && 'https:' === uri.protocol) {

                uri.protocol = 'http:';
                const headers = interceptedRequest.headers();
                headers['is-Https'] = '1';

                interceptedRequest.continue({'url': uri.href, 'headers': headers});
            } else {
                interceptedRequest.continue();
            }
        });
    } else {
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
    }
    return page;
}

/***
 * This function returns a page from browser context or create new page or even context if pageId or contextId are
 * none. If no context or now page found throw an error.
 * @param browser
 * @param contextId - identifier of context to find.
 * @param pageId - identifier of page to find.
 * @param proxyPort - port of proxy to redirect requests.
 * @returns {Promise<Page>}
 */
exports.getBrowserPage = async function getBrowserPage(browser, contextId, pageId, proxyPort) {

    if (contextId && pageId) {
        let context = await findContextInBrowser(browser, contextId);
        return await findPageInContext(context, pageId);
    } else if (contextId) {
        let context = await findContextInBrowser(browser, contextId);
        return await newPage(context, proxyPort);
    } else {
        let context = await browser.createIncognitoBrowserContext();
        return await newPage(context, proxyPort);
    }
};

exports.perfomAction = async function perfomAction(request, action) {
    let lock = request.app.get('lock');
    let page = await exports.getBrowserPage(request.app.get('browser'), request.query.contextId, request.query.pageId, request.app.get('proxyPort'));
    return lock.acquire(await page._target._targetId, async () => {

        if ('body' in request && 'headers' in request.body) {
            await page.setExtraHTTPHeaders(request.body.headers);
        }

        if ('body' in request && 'proxy' in request.body) {
            await page.setExtraHTTPHeaders({
                'puppeteer-service-proxy-url': request.body.proxy
            });
        }

        return action(page, request);
    });
};
