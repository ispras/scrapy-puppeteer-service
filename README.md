# scrapy-puppeteer-service
This is special service that runs puppeteer instances. 
It is a part of [scrapy-pupeteer middleware](https://github.com/ispras/scrapy-puppeteer) that helps to handle javascript pages in [scrapy](https://github.com/scrapy/scrapy) using puppeteer. 
This allows to scrape sites that require JS to function properly and to make the scraper more similar to humans.

## ⚠️ This repository is under development.

This project is under development. Use it at your own risk.

## Usage 
On your host machine you should [enable user namespace cloning](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#recommended-enable-user-namespace-cloning).

```shell script
sudo sysctl -w kernel.unprivileged_userns_clone=1
```

To start service run the docker container. 
Since the Dockerfile adds a pptr user as a non-privileged user, it may not have all the necessary privileges.
So you should use `docker run --cap-add=SYS_ADMIN` option.
```shell script
$ git clone https://github.com/ispras/scrapy-puppeteer-service.git
$ cd scrapy-puputeer-service
$ docker build -t scrapy-puppeter-service . 
$ docker run -p 3000:3000 --name scrapy-puppeter-service --cap-add SYS_ADMIN scrapy-puppeter-service 
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

If you want your requests on page make through proxy, just add to normal request "proxy" param. 
Proxy username and password params are optional.
Also you can add extra http headers to each request that is made on page.
```json5
{
  //request params  
  "proxy": "{protocol}://{username}:{password}@{proxy_ip}:{proxy_port}",
  "headers": {
    "My-Special-Header": "It's value."
  }
}
```

### **/goto**

This method allow to goto a page with a specific url in puppeteer.

Params: 

url - the url which puppeteer should navigate to.      
navigationOptions - [possible options to use for request.](https://github.com/GoogleChrome/puppeteer/blob/v1.20.0/docs/api.md#pagegotourl-options)      
waitOptions - [wait for selector or timeout](https://github.com/puppeteer/puppeteer/blob/v1.20.0/docs/api.md#pagewaitforselectororfunctionortimeout-options-args) after navigation completes, same as in click or scroll.

### **/back** and **/forward**
This methods helps to navigate back and forward to see previously seen pages.
 

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
        // if selectorOrTimeout is a string, then the first argument is treated as a selector or xpath, depending on whether or not it starts with '//', and the method is a shortcut for page.waitForSelector or page.waitForXPath
        // if selectorOrTimeout is a number, then the first argument is treated as a timeout in milliseconds and the method returns a promise which resolves after the timeout
        "selectorOrTimeout": 5, //default timeout is 1000ms
    }
 }
```

### **/scroll**

This method allow to scroll page to the first element that is matched by selector and returns page result.

Example request body:
```json5
{
    "selector": "", //<string> A selector to search for element to click. If there are multiple elements satisfying the selector, the first will be clicked.
    "waitOptions": {
        // if selectorOrTimeout is a string, then the first argument is treated as a selector or xpath, depending on whether or not it starts with '//', and the method is a shortcut for page.waitForSelector or page.waitForXPath
        // if selectornOrTimeout is a number, then the first argument is treated as a timeout in milliseconds and the method returns a promise which resolves after the timeout
        "selectorOrTimeout": 5, //default timeout is 1000ms
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
    let response = { //return response that you want to see as result
        context_id: page.browserContext()._id,
        page_id: await page._target._targetId,
        html: await page.content(),
        cookies: await page.cookies()
    };
    await page.close();
    return response;
 }
```

### **/screenshot**

This method returns screenshots of current page more.  
Description of options you can see on [puppeteer github](https://github.com/GoogleChrome/puppeteer/blob/v1.19.0/docs/api.md#pagescreenshotoptions).
The path options is omitted in options. Also the only possibly encoding is `base64`.
                                                            
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

### **/close_context**
This method close browser context and all its pages. Be sure you finished all you requests to this context.

## Notes on memory usage
You need to explicitly close the browser tab once you don't need it (e.g. at the end of the parse method).

## TODO

- [x] skeleton that could handle goto, click, scroll, and actions.
- [x] proxy support for puppeteer
- [x] support of extra headers
- [ ] error handling for requests
- [ ] har support
- [ ] scaling to several docker containers
