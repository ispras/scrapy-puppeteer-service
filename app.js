const express = require('express');
const puppeteer = require('puppeteer');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const AsyncLock = require('async-lock');

const indexRouter = require('./routes/index');
const gotoRouter = require('./routes/goto');
const clickRouter = require('./routes/click');
const actionRouter = require('./routes/action');
const scrollRouter = require('./routes/scroll');
const screenshotRouter = require('./routes/screenshot');
const harRouter = require('./routes/har');

const app = express();

(async () => {
    //TODO add params for puppeteer launch
    const browser = await puppeteer.launch({"headless": true});
    app.set('browser', browser);
    app.set('lock', new AsyncLock());
})();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(logger('dev'));
app.use(bodyParser.raw({inflate: true, limit: '200kb', type: 'application/javascript'}));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/goto', gotoRouter);
app.use('/click', clickRouter);
app.use('/action', actionRouter);
app.use('/scroll', scrollRouter);
app.use('/screenshot', screenshotRouter);
app.use('/har', harRouter);


module.exports = app;
