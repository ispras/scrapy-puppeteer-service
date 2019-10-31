const ProxyChain = require('proxy-chain');
const fetch = require('./fetcher');
const debug = require('debug')('scrapy-puppeteer-service:server');

exports.launchMitmProxy = function launchMitmProxy(proxyPort) {
    const server = new ProxyChain.Server({
        // Port where the server the server will listen. By default 8000.
        port: proxyPort,

        // Enables verbose logging
        verbose: true,

        prepareRequestFunction: async ({request, method}) => {
            if ('puppeteer-service-proxy-url' in request.headers) {
                let proxyUrl = request.headers['puppeteer-service-proxy-url'];
                delete request.headers['puppeteer-service-proxy-url'];

                // if https then make request with fetch
                if ('is-https' in request.headers) {
                    delete request.headers['is-https'];
                    const uri = new URL(request.url);
                    uri.protocol = 'https:';

                    // How to read body?

                    // var readBody = true;
                    // var body = "";
                    // request.on('readable', function() {
                    //     body += r.read();
                    // });
                    // request.on('end', function() {
                    //     readBody = false;
                    // });

                    // while (readBody){};

                    const options = {
                        method: method,
                        headers: request.headers,
                        // body: body,
                    };

                    const response = await fetch(uri.href, options, proxyUrl);

                    return {
                        customResponseFunction: () => {
                            return {
                                statusCode: response.statusCode,
                                headers: response.headers,
                                body: response.body
                            };
                        },
                    };
                } else {
                    return {'upstreamProxyUrl': proxyUrl};
                }
            } else {
                return {'upstreamProxyUrl': null};
            }
        },
    });

    server.listen(() => {
        debug(`Router Proxy server is listening on port ${server.port}`);
    });
};