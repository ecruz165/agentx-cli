---
title: "Loggers"
source: spring-boot-docs-v4
tokens: ~343
---

# Loggers

Spring Boot Actuator includes the ability to view and configure the log levels of your application at runtime.
You can view either the entire list or an individual logger's configuration, which is made up of both the explicitly configured logging level as well as the effective logging level given to it by the logging framework.
These levels can be one of:

* `TRACE`
* `DEBUG`
* `INFO`
* `WARN`
* `ERROR`
* `FATAL`
* `OFF`
* `null`

`null` indicates that there is no explicit configuration.

## Configure a Logger

To configure a given logger, `POST` a partial entity to the resource's URI, as the following example shows:

```json
{
	"configuredLevel": "DEBUG"
}
```

> **Tip:** To "`reset`" the specific level of the logger (and use the default configuration instead), you can pass a value of `null` as the `configuredLevel`.

## OpenTelemetry
By default, logging via OpenTelemetry is not configured.
You have to provide the location of the OpenTelemetry logs endpoint to configure it:

```yaml
management:
  opentelemetry:
    logging:
      export:
        otlp:
          endpoint: "<https://otlp.example.com:4318/v1/logs">
```

> **Note:** The OpenTelemetry Logback appender and Log4j appender are not part of Spring Boot.
For more details, see the [OpenTelemetry Logback appender](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/logback/logback-appender-1.0/library) or the [OpenTelemetry Log4j2 appender](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/log4j/log4j-appender-2.17/library) in the [OpenTelemetry Java instrumentation GitHub repository](https://github.com/open-telemetry/opentelemetry-java-instrumentation).

> **Tip:** You have to configure the appender in your `logback-spring.xml` or `log4j2-spring.xml` configuration to get OpenTelemetry logging working.

The `OpenTelemetryAppender` for both Logback and Log4j requires access to an `OpenTelemetry` instance to function properly.
This instance must be set programmatically during application startup, which can be done like this:

```java
// Example: OpenTelemetryAppenderInitializer
```
