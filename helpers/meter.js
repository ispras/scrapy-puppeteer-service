const {metrics} = require('@opentelemetry/api');
const {MeterProvider} = require("@opentelemetry/sdk-metrics");
const {HostMetrics} = require("@opentelemetry/host-metrics");
const {PrometheusExporter} = require("@opentelemetry/exporter-prometheus");
const {registerInstrumentations} = require("@opentelemetry/instrumentation");
const {HttpInstrumentation} = require("@opentelemetry/instrumentation-http");

function setupMetrics() {
    metrics.setGlobalMeterProvider(new MeterProvider({
        readers: [
            new PrometheusExporter({
                host: process.env.PROMETHEUS_HOST,
                port: process.env.PROMETHEUS_PORT,
            }),
        ],
    }));

    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
        ],
    });

    const hardwareMetrics = new HostMetrics();
    hardwareMetrics.start();
}

exports.createPuppeteerMetrics = function (app) {
    const meter = metrics.getMeter("puppeteer-metrics");

    const puppeteerContexts = meter.createObservableGauge("puppeteer-contexts",
        {description: "Puppeteer service's number of contexts"});
    const puppeteerPages = meter.createObservableGauge("puppeteer-pages",
        {description: "Puppeteer service's number of pages"});

    meter.addBatchObservableCallback(async (observableResult) => {
        observableResult.observe(puppeteerContexts, app.get('browser').browserContexts().length);
        observableResult.observe(puppeteerPages, (await app.get('browser').pages()).length);
    }, [puppeteerContexts, puppeteerPages]);
};

setupMetrics();
