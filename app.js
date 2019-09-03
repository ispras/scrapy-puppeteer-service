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

const app = express();

(async () => {
    const browser = await puppeteer.launch({"headless": false});
    app.set('browser', browser);
    app.set('lock', new AsyncLock());
})();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(logger('dev'));
app.use(bodyParser.raw({inflate: true, limit: '100kb', type: 'application/javascript'}));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/goto', gotoRouter);
app.use('/click', clickRouter);
app.use('/action', actionRouter);


module.exports = app;
