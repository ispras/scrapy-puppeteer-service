const express = require('express');
const utils = require('../helpers/utils');
const router = express.Router();


async function action(page, params) {
    return Promise.all([
        page.waitFor(params.waitOptions.selectorOrTimeout),
        page.click(params.selector, params.clickOptions),
    ]);
}

/**
 body = {
    "selector": "", //<string> A selector to search for element to click. If there are multiple elements satisfying the selector, the first will be clicked.
    "clickOptions": {
        "button", //<"left"|"right"|"middle"> Defaults to left.
        "clickCount", //<number> defaults to 1.
        "delay" //<number> Time to wait between mousedown and mouseup in milliseconds. Defaults to 0.
    },
    "waitOptions": {
        // if selectorOrFunctionOrTimeout is a string, then the first argument is treated as a selector or xpath, depending on whether or not it starts with '//', and the method is a shortcut for page.waitForSelector or page.waitForXPath
        // if selectorOrFunctionOrTimeout is a number, then the first argument is treated as a timeout in milliseconds and the method returns a promise which resolves after the timeout
        "selectorOrTimeout":...,
    }
 }
 */
router.post('/', async function (req, res, next) {

    //TODO better request error handling
    if (!("selector" in req.body)) {
        res.status("400");
        res.send("No selector to click in request")
    }

    utils.getBrowserPage(req.app.get('browser'), req.query.context_id, req.query.page_id)
        .then(async (page) => {
            req.app.get('lock').acquire(await page._target._targetId, () => {
                action(page, req.body)
                    .then(async () => {
                        return utils.formResponse(page, req.query.closePage);
                    }).catch(error => {
                    // TODO Is this handler really needed?
                    next(error);
                });
            })
        })
        .then(response => {
            console.log("page_id=" + response.page_id + "&context_id=" + response.context_id);

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(response));
        }).catch(function (error) {
        next(error);
    });

});

module.exports = router;