const express = require('express');
const puppeteer = require('puppeteer');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const AsyncLock = require('async-lock');

const indexRouter = require('./routes/index');
const gotoRouter = require('./routes/goto');
const backRouter = require('./routes/goback');
const forwardRouter = require('./routes/goforward');
const clickRouter = require('./routes/click');
const actionRouter = require('./routes/action');
const scrollRouter = require('./routes/scroll');
const screenshotRouter = require('./routes/screenshot');
const mhtmlRouter = require('./routes/mhtml');
const harRouter = require('./routes/har');
const closeContextRouter = require('./routes/close_context');

const app = express();

const HEADLESS = (process.env.HEADLESS || "true").toLowerCase() === "true";
const CONNECT_TIMEOUT = parseInt(process.env.CONNECT_TIMEOUT) || 180000;
const VIEWPORT_WIDTH = parseInt(process.env.VIEWPORT_WIDTH) || 1280;
const VIEWPORT_HEIGHT = parseInt(process.env.VIEWPORT_HEIGHT) || 720;

async function setupBrowser() {
    try {
        //TODO add more params for puppeteer launch
        const browser = await puppeteer.launch(
            {
                headless: HEADLESS,
                defaultViewport: {width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT},
                timeout: CONNECT_TIMEOUT
            });
        browser.on('disconnected', setupBrowser);
        app.set('browser', browser);
    } catch (error) {
        console.error('Failed to start browser:', error);
        process.exit(1);
    }
}

(async () => {
    await setupBrowser();
    app.set('lock', new AsyncLock());
})();

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
app.use('/mhtml', mhtmlRouter);
app.use('/har', harRouter);
app.use('/close_context', closeContextRouter);


module.exports = app;
