const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();
const cheerio = require('cheerio');

async function action(page, request) {
    var productItemsSelector = 'li.product-list--list-item';
    await page.goto(request.body.url, request.body.navigationOptions);
    var $ = cheerio.load(await page.evaluate(() => document.body.innerHTML));
    
	var productItems$ = $(productItemsSelector).slice(0, 10);
	let searchResults = getSearchResults(productItems$, $)
    return utils.formScrapeResponse(page, request.query.closePage, request.body.waitOptions, searchResults);
}
  
function getSearchResults(productItems$, $) {

    var searchResults = [];

    for (var i = 0; i < productItems$.length; i++) {
        var item$ = $(productItems$[i]);

        var product = {};

        var titleLinkSelector = 'a[data-auto="product-tile--title"]'  
        var titleLink$ = item$.find(titleLinkSelector);
        if (titleLink$.length === 0) {
            console.log('Couldn\'t locate product title link element for product at index: ' + i);
            continue;
        }
        product.url = titleLink$.attr('href');

        // id
        product.productId = titleLink$.attr('href').trim().split("/").pop()

        if (!product.productId) {
            console.log('Couldn\'t parse product ID from URL at index: ' + i);
            continue;
        }

        // title
        var titleSelector = 'a[data-auto="product-tile--title"]'  
        var title$ = item$.find(titleSelector);
        if (title$.length === 0) {
            console.log('Couldn\'t locate product title element for product at index: ' + i);
            continue;
        }
        product.title = title$.text().trim();

        var unitInfoSelector = '';
        var unitInfo$ = item$.find(unitInfoSelector);
        if (unitInfo$.length > 0) {
            if (product.title != unitInfo$.text().trim())
                product.title = product.title + ' ' + unitInfo$.text().trim();
        }

        var stockCheckSelector = '.with-warning-background p';
        var stockCheck$ = item$.find(stockCheckSelector).slice(0,1);
        var stockCheckString = stockCheck$.text();
        if (stockCheckString.includes("unavailable")) {
            product.inStock = false;
        }
        else {
            product.inStock = true;
        }
       
        var promoSelector = 'span.offer-text'  
        var promo$ = item$.find(promoSelector).slice(0,1);
        var promoString = promo$.text();
        if (promo$.length > 0) {
            product.promotion = promoString;
        }


        if (promo$.text().includes("Was")) {

            var indexStart = promoString.indexOf("Was");
            var indexEnd = promoString.indexOf("Now");
            var oldPriceString = promoString.substring(indexStart, indexEnd);
            var oldPriceRegex =  /([0-9]+\.[0-9]+)/g;
            var oldPriceMatch = oldPriceRegex.exec(oldPriceString);
            var oldPrice = oldPriceMatch[0];
            product.preDiscountPrice = oldPrice;

        }

        else {
            product.preDiscountPrice = null;
        }

        var priceSelector = '.beans-price__text';
        var price$ = item$.find(priceSelector).slice(0,1); // get the first match
        var priceText = price$.text().trim().replace(',','');
      
        if (priceText === '') {
            product.price = null;
        }
        else {    
            var priceRegex = /([0-9]+\.[0-9]+)/g;
            var priceMatch = priceRegex.exec(priceText);
            product.price = parseFloat(priceMatch[1]);
        }

            if (isNaN(product.price)) {  
                console.log('Couldn\'t parse price for product at index: ' + i);
            }

            // image url
            var imageSelector = 'img.product-image'  
            var image$ = item$.find(imageSelector);
            if (image$ && image$.length > 0) {
                if (image$.attr('data-src'))
                {
                    product.imageUrl = image$.attr('data-src')
                } 
                else if (image$.attr('src')){ 
                    product.imageUrl = image$.attr('src')
                } else {
                    console.log('Couldn\'t parse image url for product at index: ' + i);
                }
            } else {
                console.log('Couldn\'t parse image url for product at index: ' + i);
            }
        
            // hasVariants
            product.hasVariants = false;
   
        searchResults.push(product);
    }

    return searchResults;
}


router.post('/', async function (req, res, next) {

    if (!req.body.url) {
        res.status(400);
        res.send("No URL provided in goto request");
        next();
        return;
    }

    try {
        let response = await utils.performAction(req, action);
        res.header('scrapy-puppeteer-service-context-id', response.contextId);
        res.send(response);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
