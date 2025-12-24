---
title: "Tracing"
source: spring-boot-docs-v4
tokens: ~1221
---

# Tracing

Spring Boot Actuator provides dependency management and auto-configuration for [Micrometer Tracing], a facade for popular tracer libraries.

> **Tip:** To learn more about Micrometer Tracing capabilities, see its [reference documentation].

## Supported Tracers

Spring Boot ships auto-configuration for the following tracers:

* [OpenTelemetry](https://opentelemetry.io/) with [Zipkin](https://zipkin.io/) or [OTLP](https://opentelemetry.io/docs/reference/specification/protocol/).
* [OpenZipkin Brave](https://github.com/openzipkin/brave) with [Zipkin](https://zipkin.io/).

## Getting Started

We need an example application that we can use to get started with tracing.
For our purposes, the simple "`Hello World!`" web application that's covered in the  section will suffice.
We're going to use the Brave tracer with Zipkin as trace backend.

To recap, our main application code looks like this:

```java
// Example: MyApplication
```

> **Note:** There's an added logger statement in the `home()` method, which will be important later.

Now we have to add the `org.springframework.boot:spring-boot-starter-zipkin` dependency.

Then add the following application properties:

```yaml
management:
  tracing:
    sampling:
      probability: 1.0
```

By default, Spring Boot samples only 10% of requests to prevent overwhelming the trace backend.
This property switches it to 100% so that every request is sent to the trace backend.

To collect and visualize the traces, we need a running trace backend.
We use Zipkin as our trace backend here.
The [Zipkin Quickstart guide](https://zipkin.io/pages/quickstart) provides instructions how to start Zipkin locally.

After Zipkin is running, you can start your application.

If you open a web browser to `<http://localhost:8080`,> you should see the following output:

[source]
```
Hello World!
```

Behind the scenes, an observation has been created for the HTTP request, which in turn gets bridged to Brave, which reports a new trace to Zipkin.

Now open the Zipkin UI at `<http://localhost:9411`> and press the "Run Query" button to list all collected traces.
You should see one trace.
Press the "Show" button to see the details of that trace.

## Logging Correlation IDs

Correlation IDs provide a helpful way to link lines in your log files to spans/traces.
If you are using Micrometer Tracing, Spring Boot will include correlation IDs in your logs by default.

The default correlation ID is built from `traceId` and `spanId` [MDC](https://logback.qos.ch/manual/mdc.html) values.
For example, if Micrometer Tracing has added an MDC `traceId` of `803B448A0489F84084905D3093480352` and an MDC `spanId` of `3425F23BB2432450` the log output will include the correlation ID `[803B448A0489F84084905D3093480352-3425F23BB2432450]`.

If you prefer to use a different format for your correlation ID, you can use the `logging.pattern.correlation` property to define one.
For example, the following will provide a correlation ID for Logback in format previously used by Spring Cloud Sleuth:

```yaml
logging:
  pattern:
    correlation: "[${spring.application.name:},%X{traceId:-},%X{spanId:-}] "
  include-application-name: false
```

> **Note:** In the example above, `logging.include-application-name` is set to `false` to avoid the application name being duplicated in the log messages (`logging.pattern.correlation` already contains it).
It's also worth mentioning that `logging.pattern.correlation` contains a trailing space so that it is separated from the logger name that comes right after it by default.

> **Tip:** Correlation IDs rely on context propagation.
Please read this documentation for more details.

## Propagating Traces

To automatically propagate traces over the network, use the auto-configured `RestTemplateBuilder`, `RestClient.Builder` or `WebClient.Builder` to construct the client.

> **Warning:** If you create the `RestTemplate`, the `RestClient` or the `WebClient` without using the auto-configured builders, automatic trace propagation won't work!

## Tracer Implementations

As Micrometer Tracer supports multiple tracer implementations, there are multiple dependency combinations possible with Spring Boot.
The combinations OpenTelemetry with OTLP and Brave with Zipkin are common and have dedicated starters.

### OpenTelemetry With OTLP

Tracing with OpenTelemetry and reporting using OTLP requires the following dependencies:

* `org.springframework.boot:spring-boot-starter-opentelemetry`

Use the `management.opentelemetry.tracing.export.otlp.*` configuration properties to configure reporting using OTLP.

> **Note:** If you need to apply advanced customizations to OTLP span exporters, consider registering `OtlpHttpSpanExporterBuilderCustomizer` or `OtlpGrpcSpanExporterBuilderCustomizer` beans.
These will be invoked before the creation of the `OtlpHttpSpanExporter` or `OtlpGrpcSpanExporter`.
The customizers take precedence over anything applied by the auto-configuration.

### OpenTelemetry With Zipkin

Tracing with OpenTelemetry and reporting to Zipkin requires the following dependencies:

* `org.springframework.boot:spring-boot-micrometer-tracing-opentelemetry` - Spring Boot's support for Micrometer Tracing over OpenTelemetry.
* `io.micrometer:micrometer-tracing-bridge-otel` - bridges the Micrometer Observation API to OpenTelemetry.
* `org.springframework.boot:spring-boot-zipkin` - Spring Boot's support for Zipkin.
* `io.opentelemetry:opentelemetry-exporter-zipkin` - OpenTelemetry exporter that reports traces to Zipkin.

Use the `management.tracing.export.zipkin.*` configuration properties to configure reporting to Zipkin.

### OpenZipkin Brave With Zipkin

Tracing with OpenZipkin Brave and reporting to Zipkin requires the following dependencies:

* `org.springframework.boot:spring-boot-starter-zipkin`

Use the `management.tracing.export.zipkin.*` configuration properties to configure reporting to Zipkin.

## Integration with Micrometer Observation

A `TracingAwareMeterObservationHandler` is automatically registered on the `ObservationRegistry`, which creates spans for every completed observation.

## Creating Custom Spans

You can create your own spans by starting an observation.
For this, inject `ObservationRegistry` into your component:

```java
// Example: CustomObservation
```

This will create an observation named "some-operation" with the tag "some-tag=some-value".

> **Tip:** If you want to create a span without creating a metric, you need to use the /api[lower-level `Tracer` API] from Micrometer.

## Baggage

You can create baggage with the `Tracer` API:

```java
// Example: CreatingBaggage
```

This example creates baggage named `baggage1` with the value `value1`.
The baggage is automatically propagated over the network if you're using W3C propagation.
If you're using B3 propagation, baggage is not automatically propagated.
To manually propagate baggage over the network, use the `management.tracing.baggage.remote-fields` configuration property (this works for W3C, too).
For the example above, setting this property to `baggage1` results in an HTTP header `baggage1: value1`.

If you want to propagate the baggage to the MDC, use the `management.tracing.baggage.correlation.fields` configuration property.
For the example above, setting this property to `baggage1` results in an MDC entry named `baggage1`.

## Tests

Tracing components which are reporting data are not auto-configured when using `@SpringBootTest`.
See  for more details.
