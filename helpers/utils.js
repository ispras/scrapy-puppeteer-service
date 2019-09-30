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
        return await context.newPage();
    } else {
        let context = await browser.createIncognitoBrowserContext();
        return await context.newPage();
    }
};

exports.perfomAction = async function perfomAction(request, action) {
    let lock = request.app.get('lock');
    let page = await exports.getBrowserPage(request.app.get('browser'), request.query.contextId, request.query.pageId);
    return lock.acquire(await page._target._targetId, async () => {
        return action(page, request);
    });
};
