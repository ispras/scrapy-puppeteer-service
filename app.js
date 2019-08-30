const express = require('express');
const puppeteer = require('puppeteer');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const gotoRouter = require('./routes/goto');

const app = express();

(async () => {
    const browser = await puppeteer.launch({"headless": false});
    app.set('browser', browser);
    app.set('contexts', {});
})();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/goto', gotoRouter);

module.exports = app;
