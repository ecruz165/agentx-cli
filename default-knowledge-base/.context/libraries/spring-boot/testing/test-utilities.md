---
title: "Test Utilities"
source: spring-boot-docs-v4
tokens: ~631
---

# Test Utilities

A few test utility classes that are generally useful when testing your application are packaged as part of `spring-boot`.

## ConfigDataApplicationContextInitializer

`ConfigDataApplicationContextInitializer` is an `ApplicationContextInitializer` that you can apply to your tests to load Spring Boot `application.properties` files.
You can use it when you do not need the full set of features provided by `@SpringBootTest`, as shown in the following example:

```java
// Example: MyConfigFileTests
```

> **Note:** Using `ConfigDataApplicationContextInitializer` alone does not provide support for `@Value("${...}")` injection.
Its only job is to ensure that `application.properties` files are loaded into Spring's `Environment`.
For `@Value` support, you need to either additionally configure a `PropertySourcesPlaceholderConfigurer` or use `@SpringBootTest`, which auto-configures one for you.

## TestPropertyValues

`TestPropertyValues` lets you quickly add properties to a `ConfigurableEnvironment` or `ConfigurableApplicationContext`.
You can call it with `key=value` strings, as follows:

```java
// Example: MyEnvironmentTests
```

## OutputCaptureExtension

`OutputCaptureExtension` is a JUnit `Extension` that you can use to capture javadoc:java.lang.System#out[] and javadoc:java.lang.System#err[] output.
To use it, add `@ExtendWith(OutputCaptureExtension.class)` and inject `CapturedOutput` as an argument to your test class constructor or test method as follows:

```java
// Example: MyOutputCaptureTests
```

## TestRestTemplate

`TestRestTemplate` is a convenience alternative to Spring's `RestTemplate` that is useful in integration tests.
It's provided by the `spring-boot-resttestclient` module.
A dependency on `spring-boot-restclient` is also required.
Take care when adding this dependency as it will enable auto-configuration for `RestClient.Builder`.
If your main code uses `RestClient.Builder`, declare the `spring-boot-restclient` dependency so that it is on your application's main classpath and not only on its test classpath.

You can get a vanilla template or one that sends Basic HTTP authentication (with a username and password).
In either case, the template is fault tolerant.
This means that it behaves in a test-friendly way by not throwing exceptions on 4xx and 5xx errors.
Instead, such errors can be detected through the returned `ResponseEntity` and its status code.

If you need fluent API for assertions, consider using `RestTestClient` that works with mock environments and end-to-end tests.

If you are using Spring WebFlux, consider the `WebTestClient` that provides a similar API and works with mock environments, WebFlux integration tests, and end-to-end tests.

It is recommended, but not mandatory, to use the Apache HTTP Client (version 5.1 or better).
If you have that on your classpath, the `TestRestTemplate` responds by configuring the client appropriately.
If you do use Apache's HTTP client it is configured to ignore cookies (so the template is stateless).

`TestRestTemplate` can be instantiated directly in your integration tests, as shown in the following example:

```java
// Example: MyTests
```

Alternatively, if you use the `@SpringBootTest` annotation with `WebEnvironment.RANDOM*PORT` or `WebEnvironment.DEFINED*PORT`, you can inject a fully configured `TestRestTemplate` by annotating the test class with `@AutoConfigureTestRestTemplate`.
If necessary, additional customizations can be applied through the `RestTemplateBuilder` bean.

Any URLs that do not specify a host and port automatically connect to the embedded server, as shown in the following example:

```java
// Example: MySpringBootTests
```
