const express = require("express")
const utils = require("../helpers/utils")
const router = express.Router()
const cheerio = require("cheerio")

async function action(page, request) {
	const productItemsSelector = "li.product-list--list-item"
	await page.goto(request.body.url, request.body.navigationOptions)
	const $ = cheerio.load(await page.evaluate(() => document.body.innerHTML))
    
	const productItems$ = $(productItemsSelector).slice(0, 10)
	const searchResults = getSearchResults(productItems$, $)
	return utils.formScrapeResponse(page, request.query.closePage, request.body.waitOptions, searchResults)
}
  
function getSearchResults(productItems$, $) {

	const searchResults = []

	for (let i = 0; i < productItems$.length; i++) {
		const item$ = $(productItems$[i])

		const product = {}

		const titleLinkSelector = "a[data-auto=\"product-tile--title\"]"  
		const titleLink$ = item$.find(titleLinkSelector)
		if (titleLink$.length === 0) {
			console.log("Couldn't locate product title link element for product at index: " + i)
			continue
		}
		product.url = titleLink$.attr("href")

		// id
		product.productId = titleLink$.attr("href").trim().split("/").pop()

		if (!product.productId) {
			console.log("Couldn't parse product ID from URL at index: " + i)
			continue
		}

		// title
		const titleSelector = "a[data-auto=\"product-tile--title\"]"  
		const title$ = item$.find(titleSelector)
		if (title$.length === 0) {
			console.log("Couldn't locate product title element for product at index: " + i)
			continue
		}
		product.title = title$.text().trim()

		const unitInfoSelector = ""
		const unitInfo$ = item$.find(unitInfoSelector)
		if (unitInfo$.length > 0) {
			if (product.title != unitInfo$.text().trim())
				product.title = product.title + " " + unitInfo$.text().trim()
		}

		const stockCheckSelector = ".with-warning-background p"
		const stockCheck$ = item$.find(stockCheckSelector).slice(0,1)
		const stockCheckString = stockCheck$.text()
		if (stockCheckString.includes("unavailable")) {
			product.inStock = false
		}
		else {
			product.inStock = true
		}
       
		const promoSelector = "span.offer-text"  
		const promo$ = item$.find(promoSelector).slice(0,1)
		const promoString = promo$.text()
		if (promo$.length > 0) {
			product.promotion = promoString
		}


		if (promo$.text().includes("Was")) {

			const indexStart = promoString.indexOf("Was")
			const indexEnd = promoString.indexOf("Now")
			const oldPriceString = promoString.substring(indexStart, indexEnd)
			const oldPriceRegex =  /([0-9]+\.[0-9]+)/g
			const oldPriceMatch = oldPriceRegex.exec(oldPriceString)
			const oldPrice = oldPriceMatch[0]
			product.preDiscountPrice = oldPrice

		}

		else {
			product.preDiscountPrice = null
		}

		const priceSelector = ".beans-price__text"
		const price$ = item$.find(priceSelector).slice(0,1) // get the first match
		const priceText = price$.text().trim().replace(",","")
      
		if (priceText === "") {
			product.price = null
		}
		else {    
			const priceRegex = /([0-9]+\.[0-9]+)/g
			const priceMatch = priceRegex.exec(priceText)
			product.price = parseFloat(priceMatch[1])
		}

		if (isNaN(product.price)) {  
			console.log("Couldn't parse price for product at index: " + i)
		}

		// image url
		const imageSelector = "img.product-image"  
		const image$ = item$.find(imageSelector)
		if (image$ && image$.length > 0) {
			if (image$.attr("data-src")) {
				product.imageUrl = image$.attr("data-src")
			} 
			else if (image$.attr("src")){ 
				product.imageUrl = image$.attr("src")
			}
			else {
				console.log("Couldn't parse image url for product at index: " + i)
			}
		}
		else {
			console.log("Couldn't parse image url for product at index: " + i)
		}
        
		// hasVariants
		product.hasVariants = false
   
		searchResults.push(product)
	}

	return searchResults
}


router.post("/", async (req, res, next) => {

	if (!req.body.url) {
		res.status(400)
		res.send("No URL provided in goto request")
		next()
		return
	}

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
