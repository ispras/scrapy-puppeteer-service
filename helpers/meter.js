const { metrics } = require('@opentelemetry/api');
const {MeterProvider} = require("@opentelemetry/sdk-metrics");
const { HostMetrics } = require("@opentelemetry/host-metrics");
const {PrometheusExporter} = require("@opentelemetry/exporter-prometheus");
const {registerInstrumentations} = require("@opentelemetry/instrumentation");
const {HttpInstrumentation} = require("@opentelemetry/instrumentation-http");
const {ExpressInstrumentation} = require("@opentelemetry/instrumentation-express");

const metricReader = new PrometheusExporter({ port: 9100 });
const meterProvider = new MeterProvider({
    readers: [metricReader],
})
const hostMetrics = new HostMetrics({ meterProvider });

metrics.setGlobalMeterProvider(meterProvider);
hostMetrics.start();

registerInstrumentations({
    instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
    ],
});
