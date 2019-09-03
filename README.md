# scrapy-puputeer-service
This is special service that runs puppeteer instances. 
It is a part of [scrapy-pupeteer middleware](https://github.com/ispras/scrapy-puppeteer) that helps to handle javascript pages in [scrapy](https://github.com/scrapy/scrapy) using puppeteer. 
This allows to scrape sites that require JS to function properly and to make the scraper more similar to humans.

## ⚠️ This repository is under development.

This project is under development. Use it at your own risk.

## Usage 

To start service run the docker container.

```shell script
$ docker run -p 3000:3000 scrapy-puppeteer-service
```


## API

Here is the list of implemented methods that could be used to connect to puppeteer.
For All requests puppeteer browser creates new incognito browser context and new page in it.
If your want to reuse your browser context simple send context_id in your query. 
All request return their context ids in response. 
Also you could reuse your browser page and more actions with it.
In order to so you should send closePage=false in your previous request, that would made service save current page and 
return its page_id. 
If you want to send request to this use page_id and context_id params in your next request.

### **/goto**

This method allow to goto a page with a specific url in puppeteer.

Params: url - the url which puppeteer should navigate to.

### **/click**

This method allow to click on first element that is matched by selector and return page result.

Example request body:
```json5
{
    "selector": "", //<string> A selector to search for element to click. If there are multiple elements satisfying the selector, the first will be clicked.
    "clickOptions": {
        "button":  "left", //<",left"|"right"|"middle"> Defaults to left.
        "clickCount": 1, //<number> defaults to 1.
        "delay": 0 //<number> Time to wait between mousedown and mouseup in milliseconds. Defaults to 0.
    },
    "waitOptions": {
        // if selectorOrFunctionOrTimeout is a string, then the first argument is treated as a selector or xpath, depending on whether or not it starts with '//', and the method is a shortcut for page.waitForSelector or page.waitForXPath
        // if selectorOrFunctionOrTimeout is a number, then the first argument is treated as a timeout in milliseconds and the method returns a promise which resolves after the timeout
        "selectorOrTimeout": 5,
    }
 }
```

### **/action**

Body of this request should be a js code that declares function action with at least page
parameter. The content type of request should be:
```http request
 Content-Type: application/javascript
```
 
Simple example request body of goto:
```js
async function action(page, request) {
    await page.goto(request.query.uri);
    await page.close();
    return { //return response that you want to see as result
        context_id: page.browserContext()._id,
        page_id: await page._target._targetId,
        html: await page.content(),
        cookies: await page.cookies()
    };
 }
```



### **/screenshot**

This method returns screenshots of current page more.  Description of options you can see on puppeteer github:
https://github.com/GoogleChrome/puppeteer/blob/v1.19.0/docs/api.md#pagescreenshotoptions
                                                            
Example request body:
```json5
{
    "options": {
        "type": "png",
        "quality": 100,
        "fullPage" : true 
     }
 }
```


## Notes on memory usage
You need to explicitly close the browser tab once you don't need it (e.g. at the end of the parse method).

##TODO

- [x] skeleton that could handle goto, click, scroll, and actions.
- [ ] proxy support for puppeteer
- [ ] error handling for requests
- [ ] har support
- [ ] scaling to several docker containers
