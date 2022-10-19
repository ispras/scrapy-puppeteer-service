const express = require("express")
const utils = require("../helpers/utils")
const router = express.Router()


async function action(page, request) {
	delete request.body.options.path // no path for saving images
	request.body.options.encoding = "base64" // return in base64 
	const screenshot = await page.screenshot(request.body.options)
	return {
		screenshot: screenshot
	}
}

// Method that returns screenshots of pages
// more description of options you can see on github:
// https://github.com/GoogleChrome/puppeteer/blob/v1.19.0/docs/api.md#pagescreenshotoptions
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
