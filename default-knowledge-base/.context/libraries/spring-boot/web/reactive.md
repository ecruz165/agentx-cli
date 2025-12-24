---
title: "Reactive Web Applications"
source: spring-boot-docs-v4
tokens: ~2785
---

# Reactive Web Applications

Spring Boot simplifies development of reactive web applications by providing auto-configuration for Spring Webflux.

## The "`Spring WebFlux Framework`"

Spring WebFlux is the new reactive web framework introduced in Spring Framework 5.0.
Unlike Spring MVC, it does not require the servlet API, is fully asynchronous and non-blocking, and implements the [Reactive Streams](https://www.reactive-streams.org/) specification through [the Reactor project](https://projectreactor.io/).

Spring WebFlux comes in two flavors: functional and annotation-based.
The annotation-based one is quite close to the Spring MVC model, as shown in the following example:

```java
// Example: MyRestController
```

WebFlux is part of the Spring Framework and detailed information is available in its /web/webflux.html[reference documentation].

"`WebFlux.fn`", the functional variant, separates the routing configuration from the actual handling of the requests, as shown in the following example:

```java
// Example: MyRoutingConfiguration
```

```java
// Example: MyUserHandler
```

"`WebFlux.fn`" is part of the Spring Framework and detailed information is available in its /web/webflux-functional.html[reference documentation].

> **Tip:** You can define as many `RouterFunction` beans as you like to modularize the definition of the router.
Beans can be ordered if you need to apply a precedence.

To get started, add the `spring-boot-starter-webflux` module to your application.

> **Note:** Adding both `spring-boot-starter-web` and `spring-boot-starter-webflux` modules in your application results in Spring Boot auto-configuring Spring MVC, not WebFlux.
This behavior has been chosen because many Spring developers add `spring-boot-starter-webflux` to their Spring MVC application to use the reactive `WebClient`.
You can still enforce your choice by setting the chosen application type to `SpringApplication.setWebApplicationType(WebApplicationType.REACTIVE)`.

### Spring WebFlux Auto-configuration

Spring Boot provides auto-configuration for Spring WebFlux that works well with most applications.

The auto-configuration adds the following features on top of Spring's defaults:

* Configuring codecs for `HttpMessageReader` and `HttpMessageWriter` instances (described later in this document).
* Support for serving static resources, including support for WebJars (described later in this document).

If you want to keep Spring Boot WebFlux features and you want to add additional /web/webflux/config.html[WebFlux configuration], you can add your own `@Configuration` class of type `WebFluxConfigurer` but **without** `@EnableWebFlux`.

If you want to add additional customization to the auto-configured `HttpHandler`, you can define beans of type `WebHttpHandlerBuilderCustomizer` and use them to modify the `WebHttpHandlerBuilder`.

If you want to take complete control of Spring WebFlux, you can add your own `@Configuration` annotated with `@EnableWebFlux`.

### Spring WebFlux Conversion Service

If you want to customize the `ConversionService` used by Spring WebFlux, you can provide a `WebFluxConfigurer` bean with an `addFormatters` method.

Conversion can also be customized using the `spring.webflux.format.*` configuration properties.
When not configured, the following defaults are used:

|Property |`DateTimeFormatter` |Formats
| --- | --- |
|`spring.webflux.format.date`
|`ofLocalizedDate(FormatStyle.SHORT)`
|`java.util.Date` and `LocalDate`
|`spring.webflux.format.time`
|`ofLocalizedTime(FormatStyle.SHORT)`
|java.time's `LocalTime` and `OffsetTime`
|`spring.webflux.format.date-time`
|`ofLocalizedDateTime(FormatStyle.SHORT)`
|java.time's `LocalDateTime`, `OffsetDateTime`, and `ZonedDateTime`

### HTTP Codecs with HttpMessageReaders and HttpMessageWriters

Spring WebFlux uses the `HttpMessageReader` and `HttpMessageWriter` interfaces to convert HTTP requests and responses.
They are configured with `CodecConfigurer` to have sensible defaults by looking at the libraries available in your classpath.

Spring Boot provides dedicated configuration properties for codecs, ``spring.http.codecs.*``.
It also applies further customization by using `CodecCustomizer` instances.
For example, ``spring.jackson.*`` configuration keys are applied to the Jackson codec.

If you need to add or customize codecs, you can create a custom `CodecCustomizer` component, as shown in the following example:

```java
// Example: MyCodecsConfiguration
```

You can also leverage Boot's custom JSON serializers and deserializers.

### Static Content

By default, Spring Boot serves static content from a directory called `/static` (or `/public` or `/resources` or `/META-INF/resources`) in the classpath.
It uses the `ResourceWebHandler` from Spring WebFlux so that you can modify that behavior by adding your own `WebFluxConfigurer` and overriding the `addResourceHandlers` method.

By default, resources are mapped on ``/**``, but you can tune that by setting the `spring.webflux.static-path-pattern` property.
For instance, relocating all resources to `/resources/**` can be achieved as follows:

```yaml
spring:
  webflux:
    static-path-pattern: "/resources/**"
```

You can also customize the static resource locations by using `spring.web.resources.static-locations`.
Doing so replaces the default values with a list of directory locations.
If you do so, the default welcome page detection switches to your custom locations.
So, if there is an `index.html` in any of your locations on startup, it is the home page of the application.

In addition to the "`standard`" static resource locations listed earlier, a special case is made for [Webjars content](https://www.webjars.org/).
By default, any resources with a path in ``/webjars/**`` are served from jar files if they are packaged in the Webjars format.
The path can be customized with the `spring.webflux.webjars-path-pattern` property.

> **Tip:** Spring WebFlux applications do not strictly depend on the servlet API, so they cannot be deployed as war files and do not use the `src/main/webapp` directory.

### Welcome Page

Spring Boot supports both static and templated welcome pages.
It first looks for an `index.html` file in the configured static content locations.
If one is not found, it then looks for an `index` template.
If either is found, it is automatically used as the welcome page of the application.

This only acts as a fallback for actual index routes defined by the application.
The ordering is defined by the order of `HandlerMapping` beans which is by default the following:

[cols="1,1"]
|`org.springframework.web.reactive.function.server.support.RouterFunctionMapping`
| --- |
|Endpoints declared with `RouterFunction` beans
|`org.springframework.web.reactive.result.method.annotation.RequestMappingHandlerMapping`
|Endpoints declared in `@Controller` beans
|`RouterFunctionMapping` for the Welcome Page
|The welcome page support

### Template Engines

As well as REST web services, you can also use Spring WebFlux to serve dynamic HTML content.
Spring WebFlux supports a variety of templating technologies, including Thymeleaf, FreeMarker, and Mustache.

Spring Boot includes auto-configuration support for the following templating engines:

* [FreeMarker](https://freemarker.apache.org/docs/)
* [Thymeleaf](https://www.thymeleaf.org)
* [Mustache](https://mustache.github.io/)

> **Note:** Not all FreeMarker features are supported with WebFlux.
For more details, check the description of each property.

When you use one of these templating engines with the default configuration, your templates are picked up automatically from `src/main/resources/templates`.

### Error Handling

Spring Boot provides a `WebExceptionHandler` that handles all errors in a sensible way.
Its position in the processing order is immediately before the handlers provided by WebFlux, which are considered last.
For machine clients, it produces a JSON response with details of the error, the HTTP status, and the exception message.
For browser clients, there is a "`whitelabel`" error handler that renders the same data in HTML format.
You can also provide your own HTML templates to display errors (see the next section).

Before customizing error handling in Spring Boot directly, you can leverage the /web/webflux/ann-rest-exceptions.html[RFC 9457 Problem Details] support in Spring WebFlux.
Spring WebFlux can produce custom error messages with the `application/problem`json` media type, like:

```json
{
	"type": "<https://example.org/problems/unknown-project",>
	"title": "Unknown project",
	"status": 404,
	"detail": "No project found for id 'spring-unknown'",
	"instance": "/projects/spring-unknown"
}
```

This support can be enabled by setting `spring.webflux.problemdetails.enabled` to `true`.

The first step to customizing this feature often involves using the existing mechanism but replacing or augmenting the error contents.
For that, you can add a bean of type `ErrorAttributes`.

To change the error handling behavior, you can implement `ErrorWebExceptionHandler` and register a bean definition of that type.
Because an `ErrorWebExceptionHandler` is quite low-level, Spring Boot also provides a convenient `AbstractErrorWebExceptionHandler` to let you handle errors in a WebFlux functional way, as shown in the following example:

```java
// Example: MyErrorWebExceptionHandler
```

For a more complete picture, you can also subclass `DefaultErrorWebExceptionHandler` directly and override specific methods.

In some cases, errors handled at the controller level are not recorded by web observations or the metrics infrastructure.
Applications can ensure that such exceptions are recorded with the observations by /integration/observability.html#observability.http-server.reactive[setting the handled exception on the observation context].

#### Custom Error Pages

If you want to display a custom HTML error page for a given status code, you can add views that resolve from `error/*`, for example by adding files to a `/error` directory.
Error pages can either be static HTML (that is, added under any of the static resource directories) or built with templates.
The name of the file should be the exact status code, a status code series mask, or `error` for a default if nothing else matches.
Note that the path to the default error view is `error/error`, whereas with Spring MVC the default error view is `error`.

For example, to map `404` to a static HTML file, your directory structure would be as follows:

[source]
```
src/
 `- main/
     `- java/
     |   ` <source code>
     `- resources/
         `- public/
             `- error/
             |   `- 404.html
             `- <other public assets>
```

To map all `5xx` errors by using a Mustache template, your directory structure would be as follows:

[source]
```
src/
 `- main/
     `- java/
     |   ` <source code>
     `- resources/
         `- templates/
             `- error/
             |   `- 5xx.mustache
             +- <other templates>
```

### Web Filters

Spring WebFlux provides a `WebFilter` interface that can be implemented to filter HTTP request-response exchanges.
`WebFilter` beans found in the application context will be automatically used to filter each exchange.

Where the order of the filters is important they can implement `Ordered` or be annotated with `@Order`.
Spring Boot auto-configuration may configure web filters for you.
When it does so, the orders shown in the following table will be used:

| Web Filter | Order
| --- |
| `WebFilterChainProxy` (Spring Security)
| `-100`
| `HttpExchangesWebFilter`
| `Ordered.LOWEST_PRECEDENCE - 10`

### API Versioning

Spring WebFlux supports API versioning which can be used to evolve an HTTP API over time.
The same `@Controller` path can be mapped multiple times to support different versions of the API.

For more details see /web/webflux/controller/ann-requestmapping.html#webflux-ann-requestmapping-version[Spring Framework's reference documentation].

Once mappings have been added, you additionally need to configure Spring WebFlux so that it is able to use any version information sent with a request.
Typically, versions are sent as HTTP headers, query parameters or as part of the path.

To configure Spring WebFlux, you can either use a `WebFluxConfigurer` bean and override the `configureApiVersioning(...)` method, or you can use properties.

For example, the following will use an `X-Version` HTTP header to obtain version information and default to `1.0.0` when no header is sent.

```yaml
spring:
  webflux:
    apiversion:
      default: 1.0.0
      use:
        header: X-Version
```

For more complete control, you can also define `ApiVersionResolver`, `ApiVersionParser` and `ApiVersionDeprecationHandler` beans which will be injected into the auto-configured Spring MVC configuration.

> **Tip:** API versioning is also supported on the client-side with both `WebClient` and `RestClient`.
See  for details.

## Embedded Reactive Server Support

Spring Boot includes support for the following embedded reactive web servers: Reactor Netty, Tomcat, and Jetty.
Most developers use the appropriate starter to obtain a fully configured instance.
By default, the embedded server listens for HTTP requests on port 8080.

### Customizing Reactive Servers

Common reactive web server settings can be configured by using Spring `Environment` properties.
Usually, you would define the properties in your `application.properties` or `application.yaml` file.

Common server settings include:

* Network settings: Listen port for incoming HTTP requests (`server.port`), interface address to bind to (`server.address`), and so on.
* Error management: Location of the error page (`spring.web.error.path`) and so on.
* SSL
* HTTP compression

Spring Boot tries as much as possible to expose common settings, but this is not always possible.
For those cases, dedicated namespaces such as `server.netty.*` offer server-specific customizations.

> **Tip:** See the `ServerProperties` class for a complete list.

#### Programmatic Customization

If you need to programmatically configure your reactive web server, you can register a Spring bean that implements the `WebServerFactoryCustomizer` interface.
`WebServerFactoryCustomizer` provides access to the `ConfigurableReactiveWebServerFactory`, which includes numerous customization setter methods.
The following example shows programmatically setting the port:

```java
// Example: MyWebServerFactoryCustomizer
```

`JettyReactiveWebServerFactory`, `NettyReactiveWebServerFactory`, and `TomcatReactiveWebServerFactory` are dedicated variants of `ConfigurableReactiveWebServerFactory` that have additional customization setter methods for Jetty, Reactor Netty, and Tomcat respectively.
The following example shows how to customize `NettyReactiveWebServerFactory` that provides access to Reactor Netty-specific configuration options:

```java
// Example: MyNettyWebServerFactoryCustomizer
```

#### Customizing ConfigurableReactiveWebServerFactory Directly

For more advanced use cases that require you to extend from `ReactiveWebServerFactory`, you can expose a bean of such type yourself.

Setters are provided for many configuration options.
Several protected method "`hooks`" are also provided should you need to do something more exotic.
See the `ConfigurableReactiveWebServerFactory` API documentation for details.

> **Note:** Auto-configured customizers are still applied on your custom factory, so use that option carefully.

## Reactive Server Resources Configuration

When auto-configuring a Reactor Netty or Jetty server, Spring Boot will create specific beans that will provide HTTP resources to the server instance: `ReactorResourceFactory` or `JettyResourceFactory`.

By default, those resources will be also shared with the Reactor Netty and Jetty clients for optimal performances, given:

* the same technology is used for server and client
* the client instance is built using the javadoc:org.springframework.web.reactive.function.client.WebClient$Builder[] bean auto-configured by Spring Boot

Developers can override the resource configuration for Jetty and Reactor Netty by providing a custom `ReactorResourceFactory` or `JettyResourceFactory` bean - this will be applied to both clients and servers.

You can learn more about the resource configuration on the client side in the  section.
