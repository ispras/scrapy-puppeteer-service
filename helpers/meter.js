const {metrics} = require('@opentelemetry/api');  // TODO: beautify imports
const {MeterProvider} = require("@opentelemetry/sdk-metrics");
const {HostMetrics} = require("@opentelemetry/host-metrics");
const {PrometheusExporter} = require("@opentelemetry/exporter-prometheus");
const {registerInstrumentations} = require("@opentelemetry/instrumentation");
const {HttpInstrumentation} = require("@opentelemetry/instrumentation-http");


metrics.setGlobalMeterProvider(new MeterProvider({
    readers: [
        new PrometheusExporter({port: 9100}),
    ],
}));

let puppeteerContexts;
let puppeteerPages;
const hardwareMetrics = new HostMetrics();
hardwareMetrics.start();

registerInstrumentations({
    instrumentations: [
        new HttpInstrumentation(),
    ],
});

let meter = metrics.getMeter("puppeteer-metrics");

exports.createPuppeteerMetrics = function (app) {
    puppeteerContexts = meter.createObservableGauge("puppeteer-contexts",
        {description: "Puppeteer service's number of contexts"});
    puppeteerPages = meter.createObservableGauge("puppeteer-pages",
        {description: "Puppeteer service's number of pages"});

    meter.addBatchObservableCallback(async (observableResult) => {
        observableResult.observe(puppeteerContexts, app.get('browser').browserContexts().length);
        observableResult.observe(puppeteerPages, (await app.get('browser').pages()).length);
    }, [puppeteerContexts, puppeteerPages]);
};
