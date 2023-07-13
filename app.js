const express = require('express');
const puppeteer = require('puppeteer-extra')

const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
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
const recaptchaSolverRouter = require('./routes/recaptcha_solver')
const mhtmlRouter = require('./routes/mhtml');
const harRouter = require('./routes/har');
const closeContextRouter = require('./routes/close_context');

const app = express();

const HEADLESS = (process.env.HEADLESS || "true").toLowerCase() === "true";
const CONNECT_TIMEOUT = parseInt(process.env.CONNECT_TIMEOUT) || 180000;
const VIEWPORT_WIDTH = parseInt(process.env.VIEWPORT_WIDTH) || 1280;
const VIEWPORT_HEIGHT = parseInt(process.env.VIEWPORT_HEIGHT) || 720;
const TOKEN_2CAPTCHA = process.env.TOKEN_2CAPTCHA || "0";
const STEALTH_BROWSING = (process.env.STEALTH_BROWSING || "true").toLowerCase() === "true";

async function setupBrowser() {
    try {
        if (TOKEN_2CAPTCHA !== "0") {  // If token is given then RecapcthaPlugin is activated
            puppeteer.use(
                RecaptchaPlugin({
                    provider: {
                        id: '2captcha',
                        token: TOKEN_2CAPTCHA
                    },
                    visualFeedback: true
                })
            )
        }
    } catch (error) {
        console.error('Failed to proceed 2captcha token:', error);
        process.exit(1);
    }

    try {
        if (STEALTH_BROWSING) {  // Activate or not StealthPlugin
            puppeteer.use(StealthPlugin());
        }
    } catch (error) {
        console.error('Failed to enable StealthPlugin:', error);
        process.exit(1);
    }

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
app.use('/recaptcha_solver', recaptchaSolverRouter)
app.use('/mhtml', mhtmlRouter);
app.use('/har', harRouter);
app.use('/close_context', closeContextRouter);


module.exports = app;
