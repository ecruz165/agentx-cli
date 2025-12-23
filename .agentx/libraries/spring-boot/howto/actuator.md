---
title: "How-to: Actuator"
source: spring-boot-docs-v4
tokens: ~381
---

# Actuator

Spring Boot includes the Spring Boot Actuator.
This section answers questions that often arise from its use.

## Change the HTTP Port or Address of the Actuator Endpoints

In a standalone application, the Actuator HTTP port defaults to the same as the main HTTP port.
To make the application listen on a different port, set the external property: `management.server.port`.
To listen on a completely different network address (such as when you have an internal network for management and an external one for user applications), you can also set `management.server.address` to a valid IP address to which the server is able to bind.

For more detail, see the `ManagementServerProperties` source code and Customizing the Management Server Port in the "`Production-Ready Features`" section.

## Customizing Sanitization

To take control over the sanitization, define a `SanitizingFunction` bean.
The `SanitizableData` with which the function is called provides access to the key and value as well as the `PropertySource` from which they came.
This allows you to, for example, sanitize every value that comes from a particular property source.
Each `SanitizingFunction` is called in order until a function changes the value of the sanitizable data.

## Map Health Indicators to Micrometer Metrics

Spring Boot health indicators return a `Status` type to indicate the overall system health.
If you want to monitor or alert on levels of health for a particular application, you can export these statuses as metrics with Micrometer.
By default, the status codes "`UP`", "`DOWN`", "`OUT*OF*SERVICE`" and "`UNKNOWN`" are used by Spring Boot.
To export these, you will need to convert these states to some set of numbers so that they can be used with a Micrometer `Gauge`.

The following example shows one way to write such an exporter:

```java
// Example: MyHealthMetricsExportConfiguration
```
