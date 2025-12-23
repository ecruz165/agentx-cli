---
title: "Metrics"
source: spring-boot-docs-v4
tokens: ~6466
---

# Metrics

Spring Boot Actuator provides dependency management and auto-configuration for [Micrometer], an application metrics facade that supports [numerous monitoring systems], including:

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
-  (in-memory)
- 
- 

> **Tip:** To learn more about Micrometer's capabilities, see its [reference documentation], in particular the [concepts section].

## Getting Started

Spring Boot auto-configures a composite `MeterRegistry` and adds a registry to the composite for each of the supported implementations that it finds on the classpath.
Having a dependency on `micrometer-registry-\` in your runtime classpath is enough for Spring Boot to configure the registry.

Most registries share common features.
For instance, you can disable a particular registry even if the Micrometer registry implementation is on the classpath.
The following example disables Datadog:

```yaml
management:
  datadog:
    metrics:
      export:
        enabled: false
```

You can also disable all registries unless stated otherwise by the registry-specific property, as the following example shows:

```yaml
management:
  defaults:
    metrics:
      export:
        enabled: false
```

Spring Boot also adds any auto-configured registries to the global static composite registry on the `Metrics` class, unless you explicitly tell it not to:

```yaml
management:
  metrics:
    use-global-registry: false
```

You can register any number of `MeterRegistryCustomizer` beans to further configure the registry, such as applying common tags, before any meters are registered with the registry:

```java
// Example: commontags/MyMeterRegistryConfiguration
```

You can apply customizations to particular registry implementations by being more specific about the generic type:

```java
// Example: specifictype/MyMeterRegistryConfiguration
```

Spring Boot also configures built-in instrumentation that you can control through configuration or dedicated annotation markers.

## Supported Monitoring Systems

This section briefly describes each of the supported monitoring systems.

### AppOptics

By default, the AppOptics registry periodically pushes metrics to `<https://api.appoptics.com/v1/measurements`.>
To export metrics to SaaS /appOptics[AppOptics], your API token must be provided:

```yaml
management:
  appoptics:
    metrics:
      export:
        api-token: "YOUR_TOKEN"
```

### Atlas

By default, metrics are exported to /atlas[Atlas] running on your local machine.
You can provide the location of the [Atlas server](https://github.com/Netflix/atlas):

```yaml
management:
  atlas:
    metrics:
      export:
        uri: "<https://atlas.example.com:7101/api/v1/publish">
```

### Datadog

A Datadog registry periodically pushes metrics to [datadoghq](https://www.datadoghq.com).
To export metrics to /datadog[Datadog], you must provide your API key:

```yaml
management:
  datadog:
    metrics:
      export:
        api-key: "YOUR_KEY"
```

If you additionally provide an application key (optional), then metadata such as meter descriptions, types, and base units will also be exported:

```yaml
management:
  datadog:
    metrics:
      export:
        api-key: "YOUR*API*KEY"
        application-key: "YOUR*APPLICATION*KEY"
```

By default, metrics are sent to the Datadog US [site](https://docs.datadoghq.com/getting_started/site) (`<https://api.datadoghq.com`).>
If your Datadog project is hosted on one of the other sites, or you need to send metrics through a proxy, configure the URI accordingly:

```yaml
management:
  datadog:
    metrics:
      export:
        uri: "<https://api.datadoghq.eu">
```

You can also change the interval at which metrics are sent to Datadog:

```yaml
management:
  datadog:
    metrics:
      export:
        step: "30s"
```

### Dynatrace

Dynatrace offers two metrics ingest APIs, both of which are implemented for /dynatrace[Micrometer].
You can find the Dynatrace documentation on Micrometer metrics ingest /micrometer-metrics-ingest[here].
Configuration properties in the `v1` namespace apply only when exporting to the /api-metrics[Timeseries v1 API].
Configuration properties in the `v2` namespace apply only when exporting to the /api-metrics-v2-post-datapoints[Metrics v2 API].
Note that this integration can export only to either the `v1` or `v2` version of the API at a time, with `v2` being preferred.
If the `device-id` (required for v1 but not used in v2) is set in the `v1` namespace, metrics are exported to the `v1` endpoint.
Otherwise, `v2` is assumed.

#### v2 API

You can use the v2 API in two ways.

##### Auto-configuration

Dynatrace auto-configuration is available for hosts that are monitored by the OneAgent or by the Dynatrace Operator for Kubernetes.

**Local OneAgent:** If a OneAgent is running on the host, metrics are automatically exported to the /local-api[local OneAgent ingest endpoint].
The ingest endpoint forwards the metrics to the Dynatrace backend.

**Dynatrace Kubernetes Operator:** When running in Kubernetes with the Dynatrace Operator installed, the registry will automatically pick up your endpoint URI and API token from the operator instead.

This is the default behavior and requires no special setup beyond a dependency on `io.micrometer:micrometer-registry-dynatrace`.

##### Manual Configuration

If no auto-configuration is available, the endpoint of the /api-metrics-v2-post-datapoints[Metrics v2 API] and an API token are required.
The /api-authentication[API token] must have the "`Ingest metrics`" (`metrics.ingest`) permission set.
We recommend limiting the scope of the token to this one permission.
You must ensure that the endpoint URI contains the path (for example, `/api/v2/metrics/ingest`):

The URL of the Metrics API v2 ingest endpoint is different according to your deployment option:

* SaaS: ``<https://.live.dynatrace.com/api/v2/metrics/ingest``>
* Managed deployments: ``<https:///e//api/v2/metrics/ingest``>

The example below configures metrics export using the `example` environment id:

```yaml
management:
  dynatrace:
    metrics:
      export:
        uri: "<https://example.live.dynatrace.com/api/v2/metrics/ingest">
        api-token: "YOUR_TOKEN"
```

When using the Dynatrace v2 API, the following optional features are available (more details can be found in the /micrometer-metrics-ingest#dt-configuration-properties[Dynatrace documentation]):

* Metric key prefix: Sets a prefix that is prepended to all exported metric keys.
* Enrich with Dynatrace metadata: If a OneAgent or Dynatrace operator is running, enrich metrics with additional metadata (for example, about the host, process, or pod).
* Default dimensions: Specify key-value pairs that are added to all exported metrics.
If tags with the same key are specified with Micrometer, they overwrite the default dimensions.
* Use Dynatrace Summary instruments: In some cases the Micrometer Dynatrace registry created metrics that were rejected.
In Micrometer 1.9.x, this was fixed by introducing Dynatrace-specific summary instruments.
Setting this toggle to `false` forces Micrometer to fall back to the behavior that was the default before 1.9.x.
It should only be used when encountering problems while migrating from Micrometer 1.8.x to 1.9.x.
* Export meter metadata: Starting from Micrometer 1.12.0, the Dynatrace exporter will also export meter metadata, such as unit and description by default.
Use the `export-meter-metadata` toggle to turn this feature off.

It is possible to not specify a URI and API token, as shown in the following example.
In this scenario, the automatically configured endpoint is used:

```yaml
management:
  dynatrace:
    metrics:
      export:
        # Specify uri and api-token here if not using the local OneAgent endpoint.
        v2:
          metric-key-prefix: "your.key.prefix"
          enrich-with-dynatrace-metadata: true
          default-dimensions:
            key1: "value1"
            key2: "value2"
          use-dynatrace-summary-instruments: true # (default: true)
          export-meter-metadata: true             # (default: true)
```

#### v1 API (Legacy)

The Dynatrace v1 API metrics registry pushes metrics to the configured URI periodically by using the /api-metrics[Timeseries v1 API].
For backwards-compatibility with existing setups, when `device-id` is set (required for v1, but not used in v2), metrics are exported to the Timeseries v1 endpoint.
To export metrics to /dynatrace[Dynatrace], your API token, device ID, and URI must be provided:

```yaml
management:
  dynatrace:
    metrics:
      export:
        uri: "<https://.live.dynatrace.com">
        api-token: "YOUR_TOKEN"
        v1:
          device-id: "YOUR*DEVICE*ID"
```

For the v1 API, you must specify the base environment URI without a path, as the v1 endpoint path is added automatically.

#### Version-independent Settings

In addition to the API endpoint and token, you can also change the interval at which metrics are sent to Dynatrace.
The default export interval is `60s`.
The following example sets the export interval to 30 seconds:

```yaml
management:
  dynatrace:
    metrics:
      export:
        step: "30s"
```

You can find more information on how to set up the Dynatrace exporter for Micrometer in the /dynatrace[Micrometer documentation] and the /micrometer-metrics-ingest[Dynatrace documentation].

### Elastic

By default, metrics are exported to /elastic[Elastic] running on your local machine.
You can provide the location of the Elastic server to use by using the following property:

```yaml
management:
  elastic:
    metrics:
      export:
        host: "<https://elastic.example.com:8086">
```

### Ganglia

By default, metrics are exported to /ganglia[Ganglia] running on your local machine.
You can provide the [Ganglia server](http://ganglia.sourceforge.net) host and port, as the following example shows:

```yaml
management:
  ganglia:
    metrics:
      export:
        host: "ganglia.example.com"
        port: 9649
```

### Graphite

By default, metrics are exported to /graphite[Graphite] running on your local machine.
You can provide the [Graphite server](https://graphiteapp.org) host and port, as the following example shows:

```yaml
management:
  graphite:
    metrics:
      export:
         host: "graphite.example.com"
         port: 9004
```

Micrometer provides a default `HierarchicalNameMapper` that governs how a dimensional meter ID is /graphite#*hierarchical*name_mapping[mapped to flat hierarchical names].

> **Tip:**
> To take control over this behavior, define your `GraphiteMeterRegistry` and supply your own `HierarchicalNameMapper`.
> Auto-configured `GraphiteConfig` and `Clock` beans are provided unless you define your own:
> 
> ```java
// Example: MyGraphiteConfiguration
```

### Humio

By default, the Humio registry periodically pushes metrics to <https://cloud.humio.com.>
To export metrics to SaaS /humio[Humio], you must provide your API token:

```yaml
management:
  humio:
    metrics:
      export:
        api-token: "YOUR_TOKEN"
```

You should also configure one or more tags to identify the data source to which metrics are pushed:

```yaml
management:
  humio:
    metrics:
      export:
        tags:
          alpha: "a"
          bravo: "b"
```

### Influx

By default, metrics are exported to an /influx[Influx] v1 instance running on your local machine with the default configuration.
To export metrics to InfluxDB v2, configure the `org`, `bucket`, and authentication `token` for writing metrics.
You can provide the location of the [Influx server](https://www.influxdata.com) to use by using:

```yaml
management:
  influx:
    metrics:
      export:
        uri: "<https://influx.example.com:8086">
```

### JMX

Micrometer provides a hierarchical mapping to /jmx[JMX], primarily as a cheap and portable way to view metrics locally.
By default, metrics are exported to the `metrics` JMX domain.
You can provide the domain to use by using:

```yaml
management:
  jmx:
    metrics:
      export:
        domain: "com.example.app.metrics"
```

Micrometer provides a default `HierarchicalNameMapper` that governs how a dimensional meter ID is /jmx#*hierarchical*name_mapping[mapped to flat hierarchical names].

> **Tip:**
> To take control over this behavior, define your `JmxMeterRegistry` and supply your own `HierarchicalNameMapper`.
> Auto-configured `JmxConfig` and `Clock` beans are provided unless you define your own:
> 
> ```java
// Example: MyJmxConfiguration
```

### KairosDB

By default, metrics are exported to /kairos[KairosDB] running on your local machine.
You can provide the location of the [KairosDB server](https://kairosdb.github.io/) to use by using:

```yaml
management:
  kairos:
    metrics:
      export:
        uri: "<https://kairosdb.example.com:8080/api/v1/datapoints">
```

### New Relic

A New Relic registry periodically pushes metrics to /new-relic[New Relic].
To export metrics to [New Relic](https://newrelic.com), you must provide your API key and account ID:

```yaml
management:
  newrelic:
    metrics:
      export:
        api-key: "YOUR_KEY"
        account-id: "YOUR*ACCOUNT*ID"
```

You can also change the interval at which metrics are sent to New Relic:

```yaml
management:
  newrelic:
    metrics:
      export:
        step: "30s"
```

By default, metrics are published through REST calls, but you can also use the Java Agent API if you have it on the classpath:

```yaml
management:
  newrelic:
    metrics:
      export:
        client-provider-type: "insights-agent"
```

Finally, you can take full control by defining your own `NewRelicClientProvider` bean.

### OTLP

By default, metrics are exported over the /otlp[OpenTelemetry protocol (OTLP)] to a consumer running on your local machine.
To export to another location, provide the location of the [OTLP metrics endpoint](https://opentelemetry.io/) using `management.otlp.metrics.export.url`:

```yaml
management:
  otlp:
    metrics:
      export:
        url: "<https://otlp.example.com:4318/v1/metrics">
```

Custom headers, for example for authentication, can also be provided using configprop:management.otlp.metrics.export.headers.*[] properties.

If an `OtlpMetricsSender` bean is available, it will be configured on the `OtlpMeterRegistry` that Spring Boot auto-configures.

### Prometheus

/prometheus[Prometheus] expects to scrape or poll individual application instances for metrics.
Spring Boot provides an actuator endpoint at `/actuator/prometheus` to present a [Prometheus scrape](https://prometheus.io) with the appropriate format.

> **Tip:** By default, the endpoint is not available and must be exposed. See exposing endpoints for more details.

The following example `scrape_config` adds to `prometheus.yml`:

```yaml
scrape_configs:
- job_name: "spring"
  metrics_path: "/actuator/prometheus"
  static_configs:
  - targets: ["HOST:PORT"]
```

[Prometheus Exemplars](https://prometheus.io/docs/prometheus/latest/feature_flags/#exemplars-storage) are also supported.
To enable this feature, a `SpanContext` bean should be present.
If you're using the deprecated Prometheus simpleclient support and want to enable that feature, a `SpanContextSupplier` bean should be present.
If you use [Micrometer Tracing], this will be auto-configured for you, but you can always create your own if you want.
Please check the [Prometheus Docs](https://prometheus.io/docs/prometheus/latest/feature_flags/#exemplars-storage), since this feature needs to be explicitly enabled on Prometheus' side, and it is only supported using the [OpenMetrics](https://github.com/OpenObservability/OpenMetrics/blob/v1.0.0/specification/OpenMetrics.md#exemplars) format.

For ephemeral or batch jobs that may not exist long enough to be scraped, you can use [Prometheus Pushgateway](https://github.com/prometheus/pushgateway) support to expose the metrics to Prometheus.

To enable Prometheus Pushgateway support, add the following dependency to your project:

```xml
<dependency>
	<groupId>io.prometheus</groupId>
	<artifactId>prometheus-metrics-exporter-pushgateway</artifactId>
</dependency>
```

When the Prometheus Pushgateway dependency is present on the classpath and the `management.prometheus.metrics.export.pushgateway.enabled` property is set to `true`, a `PrometheusPushGatewayManager` bean is auto-configured.
This manages the pushing of metrics to a Prometheus Pushgateway.

You can tune the `PrometheusPushGatewayManager` by using properties under `management.prometheus.metrics.export.pushgateway`.
For advanced configuration, you can also provide your own `PrometheusPushGatewayManager` bean.

### Simple

Micrometer ships with a simple, in-memory backend that is automatically used as a fallback if no other registry is configured.
This lets you see what metrics are collected in the metrics endpoint.

The in-memory backend disables itself as soon as you use any other available backend.
You can also disable it explicitly:

```yaml
management:
  simple:
    metrics:
      export:
        enabled: false
```

### Stackdriver

The Stackdriver registry periodically pushes metrics to [Stackdriver](https://cloud.google.com/stackdriver/).
To export metrics to SaaS /stackdriver[Stackdriver], you must provide your Google Cloud project ID:

```yaml
management:
  stackdriver:
    metrics:
      export:
        project-id: "my-project"
```

You can also change the interval at which metrics are sent to Stackdriver:

```yaml
management:
  stackdriver:
    metrics:
      export:
        step: "30s"
```

### StatsD

The StatsD registry eagerly pushes metrics over UDP to a StatsD agent.
By default, metrics are exported to a /statsD[StatsD] agent running on your local machine.
You can provide the StatsD agent host, port, and protocol to use by using:

```yaml
management:
  statsd:
    metrics:
      export:
        host: "statsd.example.com"
        port: 9125
        protocol: "udp"
```

You can also change the StatsD line protocol to use (it defaults to Datadog):

```yaml
management:
  statsd:
    metrics:
      export:
        flavor: "etsy"
```

## Supported Metrics and Meters

Spring Boot provides automatic meter registration for a wide variety of technologies.
In most situations, the defaults provide sensible metrics that can be published to any of the supported monitoring systems.

### JVM Metrics

Auto-configuration enables JVM Metrics by using core Micrometer classes.
JVM metrics are published under the `jvm.` meter name.

The following JVM metrics are provided:

* Various memory and buffer pool details
* Statistics related to garbage collection
* Thread utilization
* [Virtual threads statistics](https://docs.micrometer.io/micrometer/reference/reference/jvm.html#*java*21_metrics) (for this, `io.micrometer:micrometer-java21` has to be on the classpath)
* The number of classes loaded and unloaded
* JVM version information
* JIT compilation time

### System Metrics

Auto-configuration enables system metrics by using core Micrometer classes.
System metrics are published under the `system.`, `process.`, and `disk.` meter names.

The following system metrics are provided:

* CPU metrics
* File descriptor metrics
* Uptime metrics (both the amount of time the application has been running and a fixed gauge of the absolute start time)
* Disk space available

### Application Startup Metrics

Auto-configuration exposes application startup time metrics:

* `application.started.time`: time taken to start the application.
* `application.ready.time`: time taken for the application to be ready to service requests.

Metrics are tagged by the fully qualified name of the application class.

### Logger Metrics

Auto-configuration enables the event metrics for both Logback and Log4J2.
The details are published under the `log4j2.events.` or `logback.events.` meter names.

### Task Execution and Scheduling Metrics

Auto-configuration enables the instrumentation of all available `ThreadPoolTaskExecutor` and `ThreadPoolTaskScheduler` beans, as long as the underling `ThreadPoolExecutor` is available.
Metrics are tagged by the name of the executor, which is derived from the bean name.

### JMS Metrics

Auto-configuration enables the instrumentation of all available `JmsTemplate` beans and `@JmsListener` annotated methods.
This will produce `"jms.message.publish"` and `"jms.message.process"` metrics respectively.
See the /integration/observability.html#observability.jms[Spring Framework reference documentation for more information on produced observations].

> **Note:** `JmsClient` and `JmsMessagingTemplate` that uses a `JmsTemplate` bean are also instrumented.

### Spring MVC Metrics

Auto-configuration enables the instrumentation of all requests handled by Spring MVC controllers and functional handlers.
By default, metrics are generated with the name, `http.server.requests`.
You can customize the name by setting the `management.observations.http.server.requests.name` property.

See the /integration/observability.html#observability.http-server.servlet[Spring Framework reference documentation for more information on produced observations].

To add to the default tags, provide a `@Bean` that extends `DefaultServerRequestObservationConvention` from the `org.springframework.http.server.observation` package.
To replace the default tags, provide a `@Bean` that implements `ServerRequestObservationConvention`.

> **Tip:** In some cases, exceptions handled in web controllers are not recorded as request metrics tags.
Applications can opt in and record exceptions by setting handled exceptions as request attributes.

By default, all requests are handled.
To customize the filter, provide a `@Bean` that implements `FilterRegistrationBean<ServerHttpObservationFilter>`.

### Spring WebFlux Metrics

Auto-configuration enables the instrumentation of all requests handled by Spring WebFlux controllers and functional handlers.
By default, metrics are generated with the name, `http.server.requests`.
You can customize the name by setting the `management.observations.http.server.requests.name` property.

See the /integration/observability.html#observability.http-server.reactive[Spring Framework reference documentation for more information on produced observations].

To add to the default tags, provide a `@Bean` that extends `DefaultServerRequestObservationConvention` from the `org.springframework.http.server.reactive.observation` package.
To replace the default tags, provide a `@Bean` that implements `ServerRequestObservationConvention`.

> **Tip:** In some cases, exceptions handled in controllers and handler functions are not recorded as request metrics tags.
Applications can opt in and record exceptions by setting handled exceptions as request attributes.

### Jersey Server Metrics

Auto-configuration enables the instrumentation of all requests handled by the Jersey JAX-RS implementation.
By default, metrics are generated with the name, `http.server.requests`.
You can customize the name by setting the `management.observations.http.server.requests.name` property.

By default, Jersey server metrics are tagged with the following information:

| Tag | Description
| --- |
| `exception`
| The simple class name of any exception that was thrown while handling the request.
| `method`
| The request's method (for example, `GET` or `POST`)
| `outcome`
| The request's outcome, based on the status code of the response.
|   1xx is `INFORMATIONAL`, 2xx is `SUCCESS`, 3xx is `REDIRECTION`, 4xx is `CLIENT*ERROR`, and 5xx is `SERVER*ERROR`
| `status`
| The response's HTTP status code (for example, `200` or `500`)
| `uri`
| The request's URI template prior to variable substitution, if possible (for example, `/api/person/\`)

To customize the tags, provide a `@Bean` that implements `JerseyObservationConvention`.

### SSL Bundle Metrics

Spring Boot Actuator publishes expiry metrics about SSL bundles.
The metric `ssl.chain.expiry` gauges the expiry date of each certificate chain in seconds.
This number will be negative if the chain has already expired.
This metric is tagged with the following information:

| Tag | Description
| --- |
| `bundle`
| The name of the bundle which contains the certificate chain
| `certificate`
| The serial number (in hex format) of the certificate which is the soonest to expire in the chain
| `chain`
| The name of the certificate chain.

### HTTP Client Metrics

Spring Boot Actuator manages the instrumentation of `RestTemplate`, `WebClient` and `RestClient`.
For that, you have to inject the auto-configured builder and use it to create instances:

* `RestTemplateBuilder` for `RestTemplate`
* javadoc:org.springframework.web.reactive.function.client.WebClient$Builder[] for `WebClient`
* javadoc:org.springframework.web.client.RestClient$Builder[] for `RestClient`

You can also manually apply the customizers responsible for this instrumentation, namely `ObservationRestTemplateCustomizer`, `ObservationWebClientCustomizer` and `ObservationRestClientCustomizer`.

By default, metrics are generated with the name, `http.client.requests`.
You can customize the name by setting the `management.observations.http.client.requests.name` property.

See the /integration/observability.html#observability.http-client[Spring Framework reference documentation for more information on produced observations].

To customize the tags when using `RestTemplate` or `RestClient`, provide a `@Bean` that implements `ClientRequestObservationConvention` from the `org.springframework.http.client.observation` package.
To customize the tags when using `WebClient`, provide a `@Bean` that implements `ClientRequestObservationConvention` from the `org.springframework.web.reactive.function.client` package.

### Tomcat Metrics

Auto-configuration enables the instrumentation of Tomcat only when an MBean `Registry` is enabled.
By default, the MBean registry is disabled, but you can enable it by setting `server.tomcat.mbeanregistry.enabled` to `true`.

Tomcat metrics are published under the `tomcat.` meter name.

### Cache Metrics

Auto-configuration enables the instrumentation of all available `Cache` instances on startup, with metrics prefixed with `cache`.
Cache instrumentation is standardized for a basic set of metrics.
Additional, cache-specific metrics are also available.

The following cache libraries are supported:

* Cache2k
* Caffeine
* Hazelcast
* Any compliant JCache (JSR-107) implementation
* Redis

> **Warning:** Metrics should be enabled for the auto-configuration to pick them up.
Refer to the documentation of the cache library you are using for more details.

Metrics are tagged by the name of the cache and by the name of the `CacheManager`, which is derived from the bean name.

> **Note:** Only caches that are configured on startup are bound to the registry.
For caches not defined in the cache’s configuration, such as caches created on the fly or programmatically after the startup phase, an explicit registration is required.
A `CacheMetricsRegistrar` bean is made available to make that process easier.

### Spring Batch Metrics

See the /monitoring-and-metrics.html[Spring Batch reference documentation].

### Spring GraphQL Metrics

See the /observability.html[Spring GraphQL reference documentation].

### DataSource Metrics

Auto-configuration enables the instrumentation of all available `DataSource` objects with metrics prefixed with `jdbc.connections`.
Data source instrumentation results in gauges that represent the currently active, idle, maximum allowed, and minimum allowed connections in the pool.

Metrics are also tagged by the name of the `DataSource` computed based on the bean name.

> **Tip:** By default, Spring Boot provides metadata for all supported data sources.
You can add additional `DataSourcePoolMetadataProvider` beans if your favorite data source is not supported.
See `DataSourcePoolMetadataProvidersConfiguration` for examples.

Also, Hikari-specific metrics are exposed with a `hikaricp` prefix.
Each metric is tagged by the name of the pool (you can control it with `spring.datasource.name`).

### Hibernate Metrics

If `org.hibernate.orm:hibernate-micrometer` is on the classpath, all available Hibernate `EntityManagerFactory` instances that have statistics enabled are instrumented with a metric named `hibernate`.

Metrics are also tagged by the name of the `EntityManagerFactory`, which is derived from the bean name.

To enable statistics, the standard JPA property `hibernate.generate_statistics` must be set to `true`.
You can enable that on the auto-configured `EntityManagerFactory`:

```yaml
spring:
  jpa:
    properties:
      "[hibernate.generate_statistics]": true
```

### Spring Data Repository Metrics

Auto-configuration enables the instrumentation of all Spring Data `Repository` method invocations.
By default, metrics are generated with the name, `spring.data.repository.invocations`.
You can customize the name by setting the `management.metrics.data.repository.metric-name` property.

The `@Timed` annotation from the `io.micrometer.core.annotation` package is supported on `Repository` interfaces and methods.
If you do not want to record metrics for all `Repository` invocations, you can set `management.metrics.data.repository.autotime.enabled` to `false` and exclusively use `@Timed` annotations instead.

> **Note:** A `@Timed` annotation with `longTask = true` enables a long task timer for the method.
Long task timers require a separate metric name and can be stacked with a short task timer.

By default, repository invocation related metrics are tagged with the following information:

| Tag | Description
| --- |
| `repository`
| The simple class name of the source `Repository`.
| `method`
| The name of the `Repository` method that was invoked.
| `state`
| The result state (`SUCCESS`, `ERROR`, `CANCELED`, or `RUNNING`).
| `exception`
| The simple class name of any exception that was thrown from the invocation.

To replace the default tags, provide a `@Bean` that implements `RepositoryTagsProvider`.

### RabbitMQ Metrics

Auto-configuration enables the instrumentation of all available RabbitMQ connection factories with a metric named `rabbitmq`.

### Spring Integration Metrics

Spring Integration automatically provides /metrics.html#micrometer-integration[Micrometer support] whenever a `MeterRegistry` bean is available.
Metrics are published under the `spring.integration.` meter name.

### Kafka Metrics

Auto-configuration registers a `MicrometerConsumerListener` and `MicrometerProducerListener` for the auto-configured consumer factory and producer factory, respectively.
It also registers a `KafkaStreamsMicrometerListener` for `StreamsBuilderFactoryBean`.
For more detail, see the /kafka/micrometer.html#micrometer-native[Micrometer Native Metrics] section of the Spring Kafka documentation.

### MongoDB Metrics

This section briefly describes the available metrics for MongoDB.

#### MongoDB Command Metrics

Auto-configuration registers a `MongoMetricsCommandListener` with the auto-configured javadoc:/com.mongodb.client.MongoClient[].

A timer metric named `mongodb.driver.commands` is created for each command issued to the underlying MongoDB driver.
Each metric is tagged with the following information by default:
| Tag | Description
| --- |
| `command`
| The name of the command issued.
| `cluster.id`
| The identifier of the cluster to which the command was sent.
| `server.address`
| The address of the server to which the command was sent.
| `status`
| The outcome of the command (`SUCCESS` or `FAILED`).

To replace the default metric tags, define a `MongoCommandTagsProvider` bean, as the following example shows:

```java
// Example: MyCommandTagsProviderConfiguration
```

To disable the auto-configured command metrics, set the following property:

```yaml
management:
  metrics:
    mongodb:
      command:
        enabled: false
```

#### MongoDB Connection Pool Metrics

Auto-configuration registers a `MongoMetricsConnectionPoolListener` with the auto-configured javadoc:/com.mongodb.client.MongoClient[].

The following gauge metrics are created for the connection pool:

* `mongodb.driver.pool.size` reports the current size of the connection pool, including idle and in-use members.
* `mongodb.driver.pool.checkedout` reports the count of connections that are currently in use.
* `mongodb.driver.pool.waitqueuesize` reports the current size of the wait queue for a connection from the pool.

Each metric is tagged with the following information by default:
| Tag | Description
| --- |
| `cluster.id`
| The identifier of the cluster to which the connection pool corresponds.
| `server.address`
| The address of the server to which the connection pool corresponds.

To replace the default metric tags, define a `MongoConnectionPoolTagsProvider` bean:

```java
// Example: MyConnectionPoolTagsProviderConfiguration
```

To disable the auto-configured connection pool metrics, set the following property:

```yaml
management:
  metrics:
    mongodb:
      connectionpool:
        enabled: false
```

### Neo4j Metrics

Auto-configuration registers a `MicrometerObservationProvider` for the auto-configured `Driver`.

To override this behavior, you can register a `ConfigBuilderCustomizer` bean with an order higher than zero.

### Jetty Metrics

Auto-configuration binds metrics for Jetty's `ThreadPool` by using Micrometer's `JettyServerThreadPoolMetrics`.
Metrics for Jetty's `Connector` instances are bound by using Micrometer's `JettyConnectionMetrics` and, when `server.ssl.enabled` is set to `true`, Micrometer's `JettySslHandshakeMetrics`.

### Redis Metrics

Auto-configuration registers a `MicrometerTracing` for the auto-configured `LettuceConnectionFactory`.
For more detail, see the /advanced-usage/#observability[Observability section] of the Lettuce documentation.

## Registering Custom Metrics

To register custom metrics, inject `MeterRegistry` into your component:

```java
// Example: MyBean
```

If your metrics depend on other beans, we recommend that you use a `MeterBinder` to register them:

```java
// Example: MyMeterBinderConfiguration
```

Using a `MeterBinder` ensures that the correct dependency relationships are set up and that the bean is available when the metric's value is retrieved.
A `MeterBinder` implementation can also be useful if you find that you repeatedly instrument a suite of metrics across components or applications.

> **Note:** By default, metrics from all `MeterBinder` beans are automatically bound to the Spring-managed `MeterRegistry`.

## Customizing Individual Metrics

If you need to apply customizations to specific `Meter` instances, you can use the `MeterFilter` interface.

For example, if you want to rename the `mytag.region` tag to `mytag.area` for all meter IDs beginning with `com.example`, you can do the following:

```java
// Example: MyMetricsFilterConfiguration
```

> **Note:** By default, all `MeterFilter` beans are automatically bound to the Spring-managed `MeterRegistry`.
Make sure to register your metrics by using the Spring-managed `MeterRegistry` and not any of the static methods on `Metrics`.
These use the global registry that is not Spring-managed.

### Common Tags

Common tags are generally used for dimensional drill-down on the operating environment, such as host, instance, region, stack, and others.
Commons tags are applied to all meters and can be configured, as the following example shows:

```yaml
management:
  metrics:
    tags:
      region: "us-east-1"
      stack: "prod"
```

The preceding example adds `region` and `stack` tags to all meters with a value of `us-east-1` and `prod`, respectively.

> **Note:** The order of common tags is important if you use Graphite.
As the order of common tags cannot be guaranteed by using this approach, Graphite users are advised to define a custom `MeterFilter` instead.

### Per-meter Properties

In addition to `MeterFilter` beans, you can apply a limited set of customization on a per-meter basis using properties.
Per-meter customizations are applied, using Spring Boot's `PropertiesMeterFilter`, to any meter IDs that start with the given name.
The following example filters out any meters that have an ID starting with `example.remote`.

```yaml
management:
  metrics:
    enable:
      example:
        remote: false
```

The following properties allow per-meter customization:

.Per-meter customizations
| Property | Description
| --- |
| `management.metrics.enable`
| Whether to accept meters with certain IDs.
|   Meters that are not accepted are filtered from the `MeterRegistry`.
| `management.metrics.distribution.percentiles-histogram`
| Whether to publish a histogram suitable for computing aggregable (across dimension) percentile approximations.
| `management.metrics.distribution.minimum-expected-value`, `management.metrics.distribution.maximum-expected-value`
| Publish fewer histogram buckets by clamping the range of expected values.
| `management.metrics.distribution.percentiles`
| Publish percentile values computed in your application
| `management.metrics.distribution.expiry`, `management.metrics.distribution.buffer-length`
| Give greater weight to recent samples by accumulating them in ring buffers which rotate after a configurable expiry, with a
| configurable buffer length.
| `management.metrics.distribution.slo`
| Publish a cumulative histogram with buckets defined by your service-level objectives.

For more details on the concepts behind `percentiles-histogram`, `percentiles`, and `slo`, see the /histogram-quantiles.html[Histograms and percentiles] section of the Micrometer documentation.

## Metrics Endpoint

Spring Boot provides a `metrics` endpoint that you can use diagnostically to examine the metrics collected by an application.
The endpoint is not available by default and must be exposed.
See exposing endpoints for more details.

Navigating to `/actuator/metrics` displays a list of available meter names.
You can drill down to view information about a particular meter by providing its name as a selector -- for example, `/actuator/metrics/jvm.memory.max`.

> **Tip:**
> The name you use here should match the name used in the code, not the name after it has been naming-convention normalized for a monitoring system to which it is shipped.
> In other words, if `jvm.memory.max` appears as `jvm*memory*max` in Prometheus because of its snake case naming convention, you should still use `jvm.memory.max` as the selector when inspecting the meter in the `metrics` endpoint.

You can also add any number of `tag=KEY:VALUE` query parameters to the end of the URL to dimensionally drill down on a meter -- for example, `/actuator/metrics/jvm.memory.max?tag=area:nonheap`.

> **Tip:**
> The reported measurements are the *sum* of the statistics of all meters that match the meter name and any tags that have been applied.
> In the preceding example, the returned `Value` statistic is the sum of the maximum memory footprints of the "`Code Cache`", "`Compressed Class Space`", and "`Metaspace`" areas of the heap.
> If you wanted to see only the maximum size for the "`Metaspace`", you could add an additional `tag=id:Metaspace` -- that is, `/actuator/metrics/jvm.memory.max?tag=area:nonheap&tag=id:Metaspace`.

## Integration with Micrometer Observation

A `DefaultMeterObservationHandler` is automatically registered on the `ObservationRegistry`, which creates metrics for every completed observation.
