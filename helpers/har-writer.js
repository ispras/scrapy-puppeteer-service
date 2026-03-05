const fs = require('fs');
const { promisify } = require('util');
const { harFromMessages } = require('chrome-har');


class HarWriter {
    constructor(page) {
        this.page = page;
        this.client = null;
        this.addResponseBodyPromises = [];
        this.events = [];
        this.responseMap = new Map();
    }

    async start() {
        this.client = await this.page.target().createCDPSession();
        await this.client.send('Page.enable');
        await this.client.send('Network.enable');

        const observe = [
            'Page.loadEventFired',
            'Page.domContentEventFired',
            'Page.frameStartedLoading',
            'Page.frameAttached',
            'Page.frameScheduledNavigation',
            'Network.requestWillBeSent',
            'Network.requestServedFromCache',
            'Network.dataReceived',
            'Network.responseReceived',
            'Network.resourceChangedPriority',
            'Network.loadingFailed',
            'Network.loadingFinished'
        ];

        observe.forEach(method => {
            this.client.on(method, params => this.#handleEvent(method, params));
        });
    }

    async stop() {
        await Promise.all(this.addResponseBodyPromises);

        const harObject = harFromMessages(this.events, {
            includeTextFromResponseBody: true
        });

        this.events = [];
        this.addResponseBodyPromises = [];
        this.responseMap.clear();

        if (this.client) {
            await this.client.detach();
        }

        return harObject;
    }

    #handleEvent(method, params) {
        const harEvent = { method, params };
        this.events.push(harEvent);

        if (method === 'Network.responseReceived') {
            this.#handleResponseReceived(harEvent);
        }

        if (method === 'Network.loadingFinished') {
            this.#handleLoadingFinished(harEvent);
        }
    }

    #handleResponseReceived(harEvent) {
        const response = harEvent.params.response;
        const requestId = harEvent.params.requestId;

        if (this.#shouldCaptureResponseBody(response)) {
            this.responseMap.set(requestId, {
                harEvent,
                response,
                requestId,
                bodyFetched: false
            });
        }
    }

    #shouldCaptureResponseBody(response) {
        return response.status !== 204 &&
            response.headers.location == null &&
            !response.mimeType.includes('image') &&
            !response.mimeType.includes('audio') &&
            !response.mimeType.includes('video') &&
            !response.mimeType.includes('application/octet-stream');
    }

    #handleLoadingFinished(harEvent) {
        const requestId = harEvent.params.requestId;
        const responseInfo = this.responseMap.get(requestId);

        if (responseInfo && !responseInfo.bodyFetched) {
            responseInfo.bodyFetched = true;
            this.#fetchResponseBody(requestId, responseInfo.harEvent, responseInfo.response)
                .then(() => {
                    this.responseMap.delete(requestId);
                })
                .catch(error => {
                    console.debug(`Failed to fetch body for ${requestId}:`, error.message);
                    this.responseMap.delete(requestId);
                });
        }
    }

    #fetchResponseBody(requestId, harEvent, response) {
        return this.client.send('Network.getResponseBody', { requestId })
            .then(responseBody => {
                harEvent.params.response = {
                    ...response,
                    body: Buffer.from(
                        responseBody.body,
                        responseBody.base64Encoded ? 'base64' : 'utf8'
                    ).toString()
                };
            });
    }
}

module.exports = { HarWriter };
