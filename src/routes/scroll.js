const express = require("express")
const utils = require("../helpers/utils")
const router = express.Router()

const DEFAULT_TIMEOUT = 1000  // 1 second

async function action(page, request) {
	if (request.body.selector) {
		await page.hover(request.body.selector)
	}
	else {
		await page.evaluate(() => {
			// scroll down until the bottom of the page to trigger scroll event even at the bottom of a page
			window.scrollBy(0, document.body.scrollHeight)
		})
	}
	return utils.formResponse(page, request.query.closePage, request.body.waitOptions || DEFAULT_TIMEOUT)
}

// Method that scrolls page to a certain selector.
// Example body:
//  body = {
//     "selector": "", //<string> A selector to search for element to scroll
//     "waitOptions": {
//         // if selectorOrFunctionOrTimeout is a string, then the first argument is treated as a selector or xpath, depending on whether or not it starts with '//', and the method is a shortcut for page.waitForSelector or page.waitForXPath
//         // if selectorOrFunctionOrTimeout is a number, then the first argument is treated as a timeout in milliseconds and the method returns a promise which resolves after the timeout
//         "selectorOrTimeout":...,
//     }
//  }
router.post("/", async (req, res, next) => {
    
	try {
		const response = await utils.performAction(req, action)
		res.header("scrapy-puppeteer-service-context-id", response.contextId)
		res.send(response)
	}
	catch (e) {
		next(e)
	}
})

module.exports = router
