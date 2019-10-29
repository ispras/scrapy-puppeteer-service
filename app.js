const express = require('express');
const puppeteer = require('puppeteer');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const AsyncLock = require('async-lock');
const ProxyChain = require('proxy-chain');

const indexRouter = require('./routes/index');
const gotoRouter = require('./routes/goto');
const backRouter = require('./routes/goback');
const forwardRouter = require('./routes/goforward');
const clickRouter = require('./routes/click');
const actionRouter = require('./routes/action');
const scrollRouter = require('./routes/scroll');
const screenshotRouter = require('./routes/screenshot');
const harRouter = require('./routes/har');
const closeContextRouter = require('./routes/close_context');

const app = express();
app.set('PROXY_PORT', 8000);

(async () => {
    //TODO add params for puppeteer launch
    const browser = await puppeteer.launch(
        {
            "headless": false,
            args: [
                `--proxy-server=http://127.0.0.1:${app.get('PROXY_PORT')}`,
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080',
            ]
        });
    app.set('browser', browser);
    app.set('lock', new AsyncLock());
})();

const server = new ProxyChain.Server({
    // Port where the server the server will listen. By default 8000.
    port: app.get('PROXY_PORT'),

    // Enables verbose logging
    verbose: true,

    prepareRequestFunction: ({
                                 request,
                                 username,
                                 password,
                                 hostname,
                                 port,
                                 isHttp,
                             }) => {
        if (!!request.headers['puppeteer-service-proxy-url']) {
            let proxyUrl = request.headers['puppeteer-service-proxy-url'];
            delete request.headers['puppeteer-service-proxy-url'];
            return {'upstreamProxyUrl': proxyUrl};
        } else {
            return {'upstreamProxyUrl': null};
        }
    },
});

server.listen(() => {
    console.log(`Router Proxy server is listening on port ${server.port}`);
});

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(logger('dev'));
app.use(bodyParser.raw({inflate: true, limit: '200kb', type: 'application/javascript'}));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/goto', gotoRouter);
app.use('/back', backRouter);
app.use('/forward', forwardRouter);
app.use('/click', clickRouter);
app.use('/action', actionRouter);
app.use('/scroll', scrollRouter);
app.use('/screenshot', screenshotRouter);
app.use('/har', harRouter);
app.use('/close_context', closeContextRouter);


module.exports = app;
