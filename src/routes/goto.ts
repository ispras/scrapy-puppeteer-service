import type { Request } from "express"
import express from "express"
import { formScrapeResponse } from "../helpers/utils"
import type { ChromiumBrowser, Page } from "playwright"
import * as scripts from "@recipopdev/retailer-api-v2-api"
import type { Retailers } from "@recipopdev/retailer-api-v2-shared"

const router = express.Router()

async function action(page: Page, request: Request) {
	const retailerConfig: Retailers = request.body.retailer_config

	const nameTag = <keyof typeof scripts>retailerConfig.nameTag
	const script = new scripts[nameTag]()

	// TODO: move this to retailer script?
	await page.goto(request.body.url)
	await script.setupPage(page)

	const html = await page.content()
	const products = script.scrape(html, page)

	return formScrapeResponse(page, true, request.body.waitOptions, products)
}

router.post("/", async (req, res, next) => {
	if (!req.body.url) {
		res.status(400)
		res.send("No URL provided in goto request")
		next()
		return
	}

	try {
		const browser: ChromiumBrowser = req.app.get("browser")
		const page = await browser.newPage()
		const response = await action(page, req)
		
		console.log({ response })
		return res.send(response)
	}
	catch (e) {
		next(e)
	}
})

export { router as gotoRouter }