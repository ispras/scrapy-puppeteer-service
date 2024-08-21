# scrapy-puppeteer-service
This is special service that runs puppeteer instances. 
It is a part of [scrapy-puppeteer middleware](https://github.com/ispras/scrapy-puppeteer) that helps to handle javascript pages in [scrapy](https://github.com/scrapy/scrapy) using puppeteer. 
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
$ docker run -d -p 3000:3000 --name scrapy-puppeteer-service --cap-add SYS_ADMIN isprascrawlers/scrapy-puppeteer-service 
```

To run example which shows how to deploy several instances of service with load balancer use this command.
```shell script
$ docker-compose up -d
```

To run headfull puppeteer in container provide `HEADLESS=false` environment variable to the container.
In this case a VNC server at `localhost:5901` with password `password` is started.
You may change the password providing `VNC_SERVER` environment variable.

```shell script
$ docker run -d -p 3000:3000 -p 5901:5901 -e HEADLESS=false -e VNC_PASSWORD=puppeteer --name scrapy-puppeteer-service --cap-add SYS_ADMIN scrapy-puppeteer-service
```

## API

Here is the list of implemented methods that could be used to connect to puppeteer.
For All requests puppeteer browser creates new incognito browser context and new page in it.
If your want to reuse your browser context simple send context_id in your query. 
All request return their context ids in response. 
Also, you could reuse your browser page and more actions with it.
In order to do so you should send in your request pageId that is returned in your previous request,
that would make service reuse current page and return again its pageId. 
If you want to close the page you are working with you should send in query param "closePage" with non-empty value.
If you want your requests on page make through proxy, just add to normal request "proxy" param. 
Proxy username and password params are optional.
Also, you can add extra http headers to each request that is made on page.
```json5
{
  //request params  
  "proxy": "{protocol}://{username}:{password}@{proxy_ip}:{proxy_port}",
  "headers": {
    "My-Special-Header": "It's value."
  }
}
```

### **/health_check**

This GET method allows to get liveliness of the server.
You get such responses with 200 status code if the server is up:
```json5
{
    "timestamp": 1719222396341,  // seconds since the epoch
    "uptime": 222.555,  // seconds of uptime
    "message": "OK",  // good or error message
    "browser": {  // connected browser info
        "connection": true,  // is browser connected
        "version": "Chrome/113.0.5672.63",  // browser version
        "contexts": 1,  // number of contexts
        "pages": 1,  // number of pages
    }
}
```
Otherwise, you get 503 status code.

### **/goto**

This POST method allows to goto a page with a specific url in puppeteer.

Params: 

url - the url which puppeteer should navigate to. \
navigationOptions - [possible options to use for request.](https://pptr.dev/api/puppeteer.page.goto#remarks) \
waitOptions - [wait for selector](https://pptr.dev/api/puppeteer.page.waitforselector), [xpath](https://pptr.dev/api/puppeteer.page.waitforxpath), or timeout after navigation completes. \
harRecording - whether to start writing HAR or not.

Example request body
```json5
{
    "url": "https://example.com", // <string> URL to navigate page to. The url should include scheme, e.g. https://.
    "navigationOptions": { // Navigation parameters which might have the following properties:
        "timeout": 30000, // <number> Maximum navigation time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.
        // "waitUntil": <string|Array<string>> When to consider navigation succeeded, defaults to load. Given an array of event strings, navigation is considered to be successful after all events have been fired. Events can be either:
          // load - consider navigation to be finished when the load event is fired.
          // domcontentloaded - consider navigation to be finished when the DOMContentLoaded event is fired.
          // networkidle0 - consider navigation to be finished when there are no more than 0 network connections for at least 500 ms.
          // networkidle2 - consider navigation to be finished when there are no more than 2 network connections for at least 500 ms.
        // "referer": <string> Referer header value. If provided it will take preference over the referer header value set by page.setExtraHTTPHeaders().
    },
    "waitOptions": { // Wait for element or timeout after navigation completes
        // "timeout": <number> Wait for given timeout in milliseconds
        "selector": "span.target", // <string> Wait for element by selector (see https://pptr.dev/api/puppeteer.page.waitforselector)
        // "xpath": <string> Wait for element by xpath (see https://pptr.dev/api/puppeteer.page.waitforxpath)
        "options": { // <object> Options to wait for elements (see https://pptr.dev/api/puppeteer.waitforselectoroptions)
            "timeout": 10000
        } 
    },
    "harRecording": true,
}
```

### **/back** and **/forward**
These POST methods help to navigate back and forward to see previously seen pages.

Example request body
```json5
{
    "navigationOptions": {  // Navigation parameters, same as in the goto method
        "timeout": 30000
    },
    "waitOptions": {  // selector, xpath or timeout, same as in the goto method
        "timeout": 5000, //default timeout is 1000ms
    }
}
```

### **/click**

This POST method allows to click on first element that is matched by selector and return page result.

Example request body:
```json5
{
    "selector": "", //<string> A selector to search for element to click. If there are multiple elements satisfying the selector, the first will be clicked.
    "clickOptions": {
        "button":  "left", //<",left"|"right"|"middle"> Defaults to left.
        "clickCount": 1, //<number> defaults to 1.
        "delay": 0 //<number> Time to wait between mousedown and mouseup in milliseconds. Defaults to 0.
    },
    "waitOptions": {  // selector, xpath or timeout, same as in the goto method
        "timeout": 5000, //default timeout is 1000ms
    },
    "navigationOptions": { // use if click triggers navigation to other page; same as in goXXX methods
        "waitUntil": "domcontentloaded",    
    } 
}
```

### **/scroll**

This POST method allows to scroll page to the first element that is matched by selector and returns page result.

Example request body:
```json5
{
    "selector": "", //<string> A selector to search for element to click. If there are multiple elements satisfying the selector, the first will be clicked.
    "waitOptions": {  // selector, xpath or timeout, same as in the goto method
      "timeout": 5000, //default timeout is 1000ms
    }
 }
```

### **/har**
This POST method allows to get the HAR file

### **/form_action**
This POST method allows filling out and submitting forms on a webpage by interacting with input elements identified by CSS selectors. It also allows clicking a submit button if specified.

Example request body:

```json5
{
    "inputMapping": {  // A dictionary where each key is a CSS selector, and each value is another dictionary containing details about the input for that element.
        "input[name='username']": {
            "value": "myUsername", 
            "delay": 100 
        },
        "input[name='password']": {
            "value": "myPassword",
            "delay": 100
        }
    },
    "submitButton": "button[type='submit']" //<string> (optional) The CSS selector for the form's submit button. If provided, the button will be clicked after filling in the form.
}
```


### **/action**

Body of this POST request should be a js code that declares function action with at least page
parameter. The content type of request should be:
```http request
 Content-Type: application/javascript
```
 
Simple example request body of goto:
```js
async function action(page, request) {
    await page.goto(request.query.uri);
    let response = { //return response that you want to see as result
        context_id: page.browserContext().id,
        page_id: page.target()._targetId,
        html: await page.content(),
        cookies: await page.cookies()
    };
    await page.close();
    return response;
 }
```

### **/screenshot**

This POST method returns screenshots of current page more.  
Description of options you can see on [puppeteer GitHub](https://github.com/GoogleChrome/puppeteer/blob/v1.19.0/docs/api.md#pagescreenshotoptions).
The path options is omitted in options. Also, the only possibly encoding is `base64`.
                                                            
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

### **/recaptcha_solver**

This POST method implements recaptcha solving based on the [puppeteer-extra-plugin-recaptcha](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-recaptcha).

Example request body:
```json5
{
    "waitOptions": {  // selector, xpath or timeout, same as in the goto method
        "timeout": 5000, //default timeout is 1000ms
    },
    "solve_recaptcha": true,  // Whether to solve recaptcha on the page or not
    "close_on_empty": false,  // Whether to close the page if there was no recaptcha
}
```

### **/close_context**
This POST method close browser context and all its pages.
Make sure you finished all your requests to this context.

### **PROMETHEUS_HOST:PROMETHEUS_PORT/metrics**

(for PROMETHEUS_HOST and PROMETHEUS_PORT see [Environment variables](#environment-variables))

This GET method allows to see service's metrics in Prometheus style.

## Environment variables

The scrapy-puppeteer-service uses several environment variables.
Here we list them all with their purpose.

* `LOG_LEVEL = "http"` - level of logging (see [winston logging levels](https://github.com/winstonjs/winston?tab=readme-ov-file#logging-levels))
* `LOG_FILE = undefined` - the file to log
* `LOGSTASH_HOST = undefined` - host address of the logstash
* `LOGSTASH_PORT = undefined` - port of the logstash server
* `HEADLESS = true` - should the service use the "headless" mode
* `CONNECT_TIMEOUT = 180000` - Maximum time in milliseconds to wait for the browser to start
* `VIEWPORT_WIDTH = 1280` - width of the browser's window
* `VIEWPORT_HEIGHT = 720` - height of the browser's window
* `TOKEN_2CAPTCHA = undefined` - token of [2captcha service](https://2captcha.com)
* `STEALTH_BROWSING = true` - should the service use the [stealth browsing](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth) mode
* `MAX_CONCURRENT_CONTEXTS = undefined` - should the service limit the number of contexts
* `CONTEXT_TIMEOUT = 600000` - time (in ms) after the passage of which the context would close
* `PROMETHEUS_HOST = undefined` - host address of the metrics endpoint, if not defined then assigns to "localhost"
* `PROMETHEUS_PORT = undefined` - port of address of the metrics endpoint, if not defined then assigns to "9464"

## Notes on memory usage

You may expect the service to fit 60 open contexts into 1 gigabyte of RAM.

Once you don't need the browser tab you need to explicitly close it (e.g. at the end of the parse method).

## TODO

- [x] skeleton that could handle goto, click, scroll, and actions.
- [x] proxy support for puppeteer
- [x] support of extra headers
- [x] error handling for requests
- [x] har support
- [x] scaling to several docker containers
