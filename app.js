async function loadESMModule(moduleName) {
    return import(moduleName);
}

const { createPuppeteerMetrics } = require('./helpers/meter');  // Essential to put it first

const express = require('express');
const puppeteer = require('puppeteer-extra')

const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
const CaptchaPlugin = loadESMModule('puppeteer-captcha-plugin');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const AsyncLock = require('async-lock');

const indexRouter = require('./routes/index');
const composeRouter = require('./routes/compose');
const captchaRouter = require("./routes/captcha_solver");
const healthCheckRouter = require('./routes/health_check');
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
const fillFormRouter = require('./routes/fill_form');
const closeContextRouter = require('./routes/close_context');

const middlewares = require('./helpers/middlewares');
const timeoutContext = require('./helpers/timeout_context');
const limitContext = require('./helpers/limit_context');
const loggers = require("./helpers/loggers");

const app = express();

const LOG_LEVEL = process.env.LOG_LEVEL || "http";
const LOG_FILE = process.env.LOG_FILE;
const LOGSTASH_HOST = process.env.LOGSTASH_HOST;
const LOGSTASH_PORT = process.env.LOGSTASH_PORT;
const HEADLESS = (process.env.HEADLESS || "true").toLowerCase() === "true";
const ACCEPT_INSECURE_CERTS = (process.env.ACCEPT_INSECURE_CERTS || "false").toLowerCase() === "true";
const CONNECT_TIMEOUT = parseInt(process.env.CONNECT_TIMEOUT) || 180000;
const VIEWPORT_WIDTH = parseInt(process.env.VIEWPORT_WIDTH) || 1280;
const VIEWPORT_HEIGHT = parseInt(process.env.VIEWPORT_HEIGHT) || 720;
const TOKEN_2CAPTCHA = process.env.TOKEN_2CAPTCHA;
const STEALTH_BROWSING = (process.env.STEALTH_BROWSING || "true").toLowerCase() === "true";
const MAX_CONCURRENT_CONTEXTS = process.env.MAX_CONCURRENT_CONTEXTS === "Infinity" ? Infinity : parseInt(process.env.MAX_CONCURRENT_CONTEXTS);
const CONTEXT_TIMEOUT = parseInt(process.env.CONTEXT_TIMEOUT) || 600000;  // 10 minutes

async function setupBrowser() {
    try {
        if (TOKEN_2CAPTCHA) {  // If token is given then RecaptchaPlugin is activated
            puppeteer.use(
                RecaptchaPlugin({
                    provider: {
                        id: '2captcha',
                        token: TOKEN_2CAPTCHA
                    }
                })
            );
            puppeteer.use(
                new (await CaptchaPlugin).CloudflareCaptchaSolverPlugin({
                    token: TOKEN_2CAPTCHA,
                })
            );
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
                acceptInsecureCerts: ACCEPT_INSECURE_CERTS,
                headless: HEADLESS,
                defaultViewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
                timeout: CONNECT_TIMEOUT,
                args: [
                    '--no-sandbox'
                ]
            }
        );
        browser.on('disconnected', setupBrowser);
        app.set('browser', browser);
    } catch (error) {
        process.exit(1);
    }

    createPuppeteerMetrics(app);  // TODO: to check if we can move it to services initialization part
}

// App initialization
(async () => {
    await setupBrowser();
    app.set('lock', new AsyncLock());
})();

// Services initialization
timeoutContext.initTimeoutContext(CONTEXT_TIMEOUT);
limitContext.initContextCounter(app, MAX_CONCURRENT_CONTEXTS);
loggers.initLogger(LOG_LEVEL, LOG_FILE, LOGSTASH_HOST, LOGSTASH_PORT);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(middlewares.logHTTPMiddleware());
app.use(bodyParser.raw({ inflate: true, limit: '200kb', type: 'application/javascript' }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/compose', composeRouter);
app.use('/captcha_solver', captchaRouter);
app.use('/health_check', healthCheckRouter);
app.use('/goto', gotoRouter);
app.use('/back', backRouter);
app.use('/forward', forwardRouter);
app.use('/click', clickRouter);
app.use('/action', actionRouter);
app.use('/scroll', scrollRouter);
app.use('/screenshot', screenshotRouter);
app.use('/recaptcha_solver', recaptchaSolverRouter);
app.use('/mhtml', mhtmlRouter);
app.use('/har', harRouter);
app.use('/fill_form', fillFormRouter);
app.use('/close_context', closeContextRouter);

app.use(middlewares.processExceptionMiddleware);
app.use(middlewares.logExceptionMiddleware);

module.exports = app;
