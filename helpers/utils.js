async function findContextInBrowser(browser, context_id) {

    for (let context of browser.browserContexts()) {
        if (context_id === await context._id) {
            return context;
        }
    }
    throw "Context not found";
}



async function findPageInContext(context, page_id) {
    for (let page of await context.pages()) {
        if (page_id === await page._target._targetId) {
            return page;
        }
    }
    throw "Page not found";
}

exports.closeContext = async function closeContext(request) {

    //shared locks on contexts and exclusive on pages?
    let context = await findContextInBrowser(request.app.get('browser'), request.query.context_id);
    await context.close();
};

exports.formResponse = async function formResponse(page, closePage) {
    let response = {
        context_id: page.browserContext()._id,
        html: await page.content(),
        cookies: await page.cookies(),
    };

    if (closePage) {
        await page.close();
    }

    if (!page.isClosed()) {
        response.page_id = await page._target._targetId;
    }

    return response;
};

/***
 * This function returns a page from browser context or create new page or even context if page_id or context_id are
 * none. If no context or now page found throw an error.
 * @param browser
 * @param context_id - identifier of context to find.
 * @param page_id - identifier of page to find.
 * @returns {Promise<Page>}
 */
exports.getBrowserPage = async function getBrowserPage(browser, context_id, page_id) {

    if (context_id && page_id) {
        let context = await findContextInBrowser(browser, context_id);
        return await findPageInContext(context, page_id);
    } else if (context_id) {
        let context = await findContextInBrowser(browser, context_id);
        return await context.newPage();
    } else {
        let context = await browser.createIncognitoBrowserContext();
        return await context.newPage();
    }
};

exports.perfomAction = async function perfomAction(request, action) {
    let lock = request.app.get('lock');
    let page = await exports.getBrowserPage(request.app.get('browser'), request.query.context_id, request.query.page_id);
    return lock.acquire(await page._target._targetId, async () => {
        return action(page, request);
    });
};