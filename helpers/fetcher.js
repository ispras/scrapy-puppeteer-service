const ProxyAgent = require('proxy-agent');
const node_fetch = require('node-fetch');


fetch = async function fetch(url, options, proxy_url) {
    options.agent = new ProxyAgent(proxy_url);
    let response = await node_fetch(url, options);
    let body = await response.buffer();
    return {
        response: response,
        statusCode: response.status,
        headers: response.headers,
        body: body
    };
};

module.exports = fetch;