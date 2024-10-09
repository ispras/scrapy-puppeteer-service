const exceptions = require("../helpers/exceptions");

exports.har = async function har(page, request) {
    if (!(page.harWriter)){
        throw new exceptions.NoHarWriterError();
    }

    return {
        har: JSON.stringify(await page.harWriter.stop())  // TODO: do we really need JSON.stringify?
    };
}
