---
title: "Observability"
source: spring-boot-docs-v4
tokens: ~1538
---

# Observability

Observability is the ability to observe the internal state of a running system from the outside.
It consists of the three pillars: logging, metrics and traces.

For metrics and traces, Spring Boot uses /observation[Micrometer Observation].
To create your own observations (which will lead to metrics and traces), you can inject an `ObservationRegistry`.

```java
// Example: MyCustomObservation
```

> **Note:** Low cardinality tags will be added to metrics and traces, while high cardinality tags will only be added to traces.

Beans of type `ObservationPredicate`, `GlobalObservationConvention`, `ObservationFilter` and `ObservationHandler` will be automatically registered on the `ObservationRegistry`.
You can additionally register any number of `ObservationRegistryCustomizer` beans to further configure the registry.

> **Tip:** Observability for JDBC can be configured using a separate project.
The [Datasource Micrometer project](https://github.com/jdbc-observations/datasource-micrometer) provides a Spring Boot starter which automatically creates observations when JDBC operations are invoked.
Read more about it [in the reference documentation](https://jdbc-observations.github.io/datasource-micrometer/docs/current/docs/html/).

> **Tip:** Observability for R2DBC is built into Spring Boot.
To enable it, add the `io.r2dbc:r2dbc-proxy` dependency to your project.

## Context Propagation
Observability support relies on the [Context Propagation library](https://github.com/micrometer-metrics/context-propagation) for forwarding the current observation across threads and reactive pipelines.
By default, `ThreadLocal` values are not automatically reinstated in reactive operators.
This behavior is controlled with the `spring.reactor.context-propagation` property, which can be set to `auto` to enable automatic propagation.

If you're working with `@Async` methods and the `AsyncTaskExecutor` is auto-configured, you have to opt-in for context propagation using the `spring.task.execution.propagate-context` property.

If you are configuring the `AsyncTaskExecutor` yourself, then you need to register a `ContextPropagatingTaskDecorator` bean, as shown in the following example:

```java
// Example: ContextPropagationConfiguration
```

For more details about observations please see the /observation[Micrometer Observation documentation].

## Common Tags

Common tags are generally used for dimensional drill-down on the operating environment, such as host, instance, region, stack, and others.
Common tags are applied to all observations as low cardinality tags and can be configured, as the following example shows:

```yaml
management:
  observations:
    key-values:
      region: "us-east-1"
      stack: "prod"
```

The preceding example adds `region` and `stack` tags to all observations with a value of `us-east-1` and `prod`, respectively.

## Preventing Observations

If you'd like to prevent some observations from being reported, you can use the `management.observations.enable` properties:

```yaml
management:
  observations:
    enable:
      denied:
        prefix: false
      another:
        denied:
          prefix: false
```

The preceding example will prevent all observations with a name starting with `denied.prefix` or `another.denied.prefix`.

> **Tip:** If you want to prevent Spring Security from reporting observations, set the property `management.observations.enable.spring.security` to `false`.

If you need greater control over the prevention of observations, you can register beans of type `ObservationPredicate`.
Observations are only reported if all the `ObservationPredicate` beans return `true` for that observation.

```java
// Example: MyObservationPredicate
```

The preceding example will prevent all observations whose name contains "denied".

## Micrometer Observation Annotations support

To enable scanning of observability annotations like `@Observed`, `@Timed`, `@Counted`, `@MeterTag` and `@NewSpan`, set the `management.observations.annotations.enabled` property to `true`.
A dependency on `org.aspectj:aspectjweaver`, which is part of `spring-boot-starter-aspectj`, is also required.
This feature is supported by Micrometer directly.
Please refer to the /timers.html#*the*timed*annotation[Micrometer], /components.html#micrometer-observation-annotations[Micrometer Observation] and /api.html#*aspect*oriented*programming[Micrometer Tracing] reference docs.

> **Note:** When you annotate methods or classes which are already instrumented (for example, Spring Data repositories or Spring MVC controllers), you will get duplicate observations.
In that case you can either disable the automatic instrumentation using properties or an `ObservationPredicate` and rely on your annotations, or you can remove your annotations.

## OpenTelemetry Support

> **Note:** There are several ways to support [OpenTelemetry](https://opentelemetry.io/) in your application.
You can use the [OpenTelemetry Java Agent](https://opentelemetry.io/docs/zero-code/java/agent/) or the [OpenTelemetry Spring Boot Starter](https://opentelemetry.io/docs/zero-code/java/spring-boot-starter/),
which are supported by the OTel community; the metrics and traces use the semantic conventions defined by OTel libraries.
This documentation describes OpenTelemetry as officially supported by the Spring team, using Micrometer and the OTLP exporter;
the metrics and traces use the semantic conventions described in the Spring projects documentation, such as /integration/observability.html[Spring Framework].

Spring Boot's actuator module includes basic support for OpenTelemetry.

It provides a bean of type `OpenTelemetry`, and if there are beans of type `SdkTracerProvider`, `ContextPropagators`, `SdkLoggerProvider` or `SdkMeterProvider` in the application context, they automatically get registered.
Additionally, it provides a `Resource` bean.
The attributes of the auto-configured `Resource` can be configured via the `management.opentelemetry.resource-attributes` configuration property.
Auto-configured attributes will be merged with attributes from the `OTEL*RESOURCE*ATTRIBUTES` and `OTEL*SERVICE*NAME` environment variables, with attributes configured through the configuration property taking precedence over those from the environment variables.

If you have defined your own `Resource` bean, this will no longer be the case.

> **Note:** Spring Boot does not provide automatic exporting of OpenTelemetry metrics or logs.
Exporting OpenTelemetry traces is only auto-configured when used together with Micrometer Tracing.

### Environment variables

Spring Boot supports the following environment variables to configure the OpenTelemetry resource:

* [`OTEL*RESOURCE*ATTRIBUTES`](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)
* [`OTEL*SERVICE*NAME`](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)

> **Note:** The `OTEL*RESOURCE*ATTRIBUTES` environment variable consists of a list of key-value pairs.
For example: `key1=value1,key2=value2,key3=spring%20boot`.
All attribute values are treated as strings, and any characters outside the baggage-octet range must be **percent-encoded**.

Micrometer also supports the following environment variables to configure the metrics export over OTLP:

* [`OTEL*EXPORTER*OTLP*ENDPOINT`](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/#otel*exporter*otlp*endpoint)
* [`OTEL*EXPORTER*OTLP*METRICS*ENDPOINT`](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/#otel*exporter*otlp*metrics*endpoint)
* [`OTEL*EXPORTER*OTLP*HEADERS`](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/#otel*exporter*otlp*headers)
* [`OTEL*EXPORTER*OTLP*METRICS*HEADERS`](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/#otel*exporter*otlp*metrics*headers)

Other environment variables as described in [the OpenTelemetry documentation](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/) are not supported.

If you want all environment variables specified by OpenTelemetry's SDK to be effective, you have to supply your own `OpenTelemetry` bean.

> **Warning:** Doing this will switch off Spring Boot's OpenTelemetry auto-configuration and may break the built-in observability functionality.

First, add a dependency to `io.opentelemetry:opentelemetry-sdk-extension-autoconfigure` to get [OpenTelemetry's zero-code SDK autoconfigure module](https://opentelemetry.io/docs/languages/java/configuration/#zero-code-sdk-autoconfigure), then add this configuration:

```java
// Example: AutoConfiguredOpenTelemetrySdkConfiguration
```

### Logging

The `OpenTelemetryLoggingAutoConfiguration` configures OpenTelemetry's `SdkLoggerProvider`.
Exporting logs via OTLP is supported through the `OtlpLoggingAutoConfiguration`, which enables OTLP log exporting over HTTP or gRPC.

However, while there is a `SdkLoggerProvider` bean, Spring Boot doesn't support bridging logs to this bean out of the box.
This can be done with 3rd-party log bridges, as described in the Logging with OpenTelemetry section.

### Metrics

The choice of metrics in the Spring portfolio is Micrometer, which means that metrics are not collected and exported through the OpenTelemetry's `SdkMeterProvider`.
Spring Boot doesn't provide a `SdkMeterProvider` bean.

However, Micrometer metrics can be exported via OTLP to any OpenTelemetry capable backend using the `OtlpMeterRegistry`, as described in the Metrics with OTLP section.

> **Note:** Micrometer's OTLP registry doesn't use the `Resource` bean, but setting `OTEL*RESOURCE*ATTRIBUTES`, `OTEL*SERVICE*NAME` or `management.opentelemetry.resource-attributes` works.

#### Metrics via the OpenTelemetry API and SDK

If you or a dependency you include make use of OpenTelemetry's `MeterProvider`, those metrics are not exported.

We strongly recommend that you report your metrics with Micrometer.
If a dependency you include uses OpenTelemetry's `MeterProvider`, you can include this configuration in your application to configure a `MeterProvider` bean, which you then have to wire into your dependency:

```java
// Example: OpenTelemetryMetricsConfiguration
```

This configuration also enables metrics export via OTLP over HTTP.

### Tracing

If Micrometer tracing is used, the `OpenTelemetryTracingAutoConfiguration` configures OpenTelemetry's `SdkTracerProvider`.
Exporting traces through OTLP is enabled by the `OtlpTracingAutoConfiguration`, which supports exporting traces with OTLP over HTTP or gRPC.

We strongly recommend using the Micrometer Observation or Tracing API instead of using the OpenTelemetry API directly.
