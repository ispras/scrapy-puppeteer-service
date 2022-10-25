import type { ChromiumBrowser, Page } from "playwright"
import { proxyRequest } from "puppeteer-proxy"
const PAGE_PROXY_URL_KEY = "puppeteer-service-proxy-url"
import type { Product } from "@recipopdev/retailer-api-v2-shared"

// async function findContextInBrowser(browser, contextId) {
// 	for (const context of browser.browserContexts()) {
// 		if (contextId === await context._id) {
// 			return context
// 		}
// 	}

// 	throw "Context not found"
// }

// async function findPageInContext(context, pageId) {
// 	for (const page of await context.pages()) {
// 		if (pageId === await page._target._targetId) {
// 			return page
// 		}
// 	}
// 	throw "Page not found"
// }

// export async function closeContexts(browser: ChromiumBrowser, contextIds: number[]) {
// 	// TODO shared locks on contexts and exclusive on pages?
// 	const close_promises = []
// 	for (const context of browser.browserContexts()) {
// 		if (contextIds.includes(context._id)) {
// 			close_promises.push(context.close())
// 		}
// 	}
// 	await Promise.all(close_promises)
// }

// async function wait(page: Page, waitFor: any) {
// 	if (waitFor instanceof Object) {
// 		const { selectorOrTimeout, options } = waitFor
// 		if (selectorOrTimeout) {
// 			await page.waitFor(selectorOrTimeout, options)
// 		}
// 	}
// 	else if (waitFor) {
// 		await page.waitFor(waitFor)
// 	}
// }

// export async function formResponse(page, closePage, waitFor) {
// 	await wait(page, waitFor)

// 	const response = {
// 		contextId: page.browserContext()._id,
// 		html: await page.content(),
// 		cookies: await page.cookies(),
// 	}

// 	if (closePage) {
// 		await page.close()
// 	}

// 	if (!page.isClosed()) {
// 		response.pageId = await page._target._targetId
// 	}

// 	return response
// }

export async function formScrapeResponse(page: Page, closePage: boolean, waitFor: any, data: Product[]) {
	// await wait(page, waitFor)

	const response = {
		contextId: null,
		html: await page.content(),
		cookies: await page.context().cookies(),
		data: data
	}

	if (closePage === true) {
		await page.close()
	}

	// if (page.isClosed() === false) {
	// 	response.pageId = await page._target._targetId
	// }

	return response
}

// async function newPage(context) {
// 	const page = await context.newPage()

// 	await page.setRequestInterception(true)

// 	// This is request interception in order to make request through proxies
// 	page.on("request", async request => {
// 		const { [PAGE_PROXY_URL_KEY]: proxyUrl } = page
// 		if (proxyUrl) {
// 			proxyRequest({ page, proxyUrl, request })
// 		}
// 		else {
// 			request.continue()
// 		}
// 	})

// 	return page
// }

// /***
//  * This function returns a page from browser context or create new page or even context if pageId or contextId are
//  * none. If no context or now page found throw an error.
//  * @param browser
//  * @param contextId - identifier of context to find.
//  * @param pageId - identifier of page to find.
//  * @returns {Promise<Page>}
//  */
// export async function getBrowserPage(browser, contextId, pageId) {

// 	if (contextId && pageId) {
// 		const context = await findContextInBrowser(browser, contextId)
// 		return await findPageInContext(context, pageId)
// 	}
// 	else if (contextId) {
// 		const context = await findContextInBrowser(browser, contextId)
// 		return await newPage(context)
// 	}
// 	else {
// 		const context = await browser.createIncognitoBrowserContext()
// 		return await newPage(context)
// 	}
// }

// export async function performAction(request, action) {
// 	const { contextId, pageId } = request.query
// 	const lock = request.app.get("lock")
// 	const page = await exports.getBrowserPage(request.app.get("browser"), contextId, pageId)
// 	return lock.acquire(await page._target._targetId, async () => {
// 		let extraHeaders = {}

// 		if ("body" in request && "headers" in request.body) {
// 			extraHeaders = { ...request.body.headers }
// 		}

// 		if ("body" in request && "proxy" in request.body) {
// 			// TODO maybe we should map page ids to proxies instead
// 			page[PAGE_PROXY_URL_KEY] = request.body.proxy
// 		}

// 		if ("cookie" in extraHeaders) {
// 			// TODO set cookies from request body like headers
// 			const url = request.body.url || page.url()
// 			const cookies = extraHeaders.cookie.split(";").map(s => {
// 				const [name, value] = s.trim().split(/=(.*)/, 2)
// 				return { name, value, url }
// 			})
// 			delete extraHeaders.cookie
// 			await page.setCookie(...cookies)
// 		}

// 		if (Object.keys(extraHeaders).length !== 0) {
// 			await page.setExtraHTTPHeaders(extraHeaders)
// 		}

// 		return await action(page, request)
// 	})
// }