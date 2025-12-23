---
title: "REST Clients"
source: spring-boot-docs-v4
tokens: ~3394
---

# Calling REST Services

Spring Boot provides various convenient ways to call remote REST services.
If you are developing a non-blocking reactive application and you're using Spring WebFlux, then you can use `WebClient`.
If you prefer imperative APIs then you can use `RestClient` or `RestTemplate`.

## WebClient

If you have Spring WebFlux on your classpath we recommend that you use `WebClient` to call remote REST services.
The `WebClient` interface provides a functional style API and is fully reactive.
You can learn more about the `WebClient` in the dedicated /web/webflux-webclient.html[section in the Spring Framework docs].

> **Tip:** If you are not writing a reactive Spring WebFlux application you can use the `RestClient` instead of a `WebClient`.
This provides a similar functional API, but is imperative rather than reactive.

Spring Boot creates and pre-configures a prototype javadoc:org.springframework.web.reactive.function.client.WebClient$Builder[] bean for you.
It is strongly advised to inject it in your components and use it to create `WebClient` instances.
Spring Boot is configuring that builder to share HTTP resources and reflect codecs setup in the same fashion as the server ones (see WebFlux HTTP codecs auto-configuration), and more.

The following code shows a typical example:

```java
// Example: MyService
```

### WebClient Runtime

Spring Boot will auto-detect which `ClientHttpConnector` to use to drive `WebClient` depending on the libraries available on the application classpath.
In order of preference, the following clients are supported:

. Reactor Netty
. Jetty RS client
. Apache HttpClient
. JDK HttpClient

If multiple clients are available on the classpath, the most preferred client will be used.

The `spring-boot-starter-webflux` starter depends on `io.projectreactor.netty:reactor-netty` by default, which brings both server and client implementations.
If you choose to use Jetty as a reactive server instead, you should add a dependency on the Jetty Reactive HTTP client library, `org.eclipse.jetty:jetty-reactive-httpclient`.
Using the same technology for server and client has its advantages, as it will automatically share HTTP resources between client and server.

Developers can override the resource configuration for Jetty and Reactor Netty by providing a custom `ReactorResourceFactory` or `JettyResourceFactory` bean - this will be applied to both clients and servers.

If you wish to override that choice for the client, you can define your own `ClientHttpConnector` bean and have full control over the client configuration.

You can learn more about the /web/webflux-webclient/client-builder.html[`WebClient` configuration options in the Spring Framework reference documentation].

### Global HTTP Connector Configuration

If the auto-detected `ClientHttpConnector` does not meet your needs, you can use the `spring.http.clients.reactive.connector` property to pick a specific connector.
For example, if you have Reactor Netty on your classpath, but you prefer Jetty's `HttpClient` you can add the following:

```yaml
spring:
  http:
    clients:
      reactive:
        connector: jetty
```

> **Tip:** You can also use global configuration properties which apply to all HTTP clients.

For more complex customizations, you can use `ClientHttpConnectorBuilderCustomizer` or declare your own `ClientHttpConnectorBuilder` bean which will cause auto-configuration to back off.
This can be useful when you need to customize some of the internals of the underlying HTTP library.

For example, the following will use a JDK client configured with a specific `ProxySelector`:

```java
// Example: MyConnectorHttpConfiguration
```

### WebClient Customization

There are three main approaches to `WebClient` customization, depending on how broadly you want the customizations to apply.

To make the scope of any customizations as narrow as possible, inject the auto-configured javadoc:org.springframework.web.reactive.function.client.WebClient$Builder[] and then call its methods as required.
javadoc:org.springframework.web.reactive.function.client.WebClient$Builder[] instances are stateful: Any change on the builder is reflected in all clients subsequently created with it.
If you want to create several clients with the same builder, you can also consider cloning the builder with `WebClient.Builder other = builder.clone();`.

To make an application-wide, additive customization to all javadoc:org.springframework.web.reactive.function.client.WebClient$Builder[] instances, you can declare `WebClientCustomizer` beans and change the javadoc:org.springframework.web.reactive.function.client.WebClient$Builder[] locally at the point of injection.

Finally, you can fall back to the original API and use `WebClient.create()`.
In that case, no auto-configuration or `WebClientCustomizer` is applied.

### WebClient SSL Support

If you need custom SSL configuration on the `ClientHttpConnector` used by the `WebClient`, you can inject a `WebClientSsl` instance that can be used with the builder's `apply` method.

The `WebClientSsl` interface provides access to any SSL bundles that you have defined in your `application.properties` or `application.yaml` file.

The following code shows a typical example:

```java
// Example: MyService
```

## RestClient

If you are not using Spring WebFlux or Project Reactor in your application we recommend that you use `RestClient` to call remote REST services.

The `RestClient` interface provides a functional style imperative API.

Spring Boot creates and pre-configures a prototype javadoc:org.springframework.web.client.RestClient$Builder[] bean for you.
It is strongly advised to inject it in your components and use it to create `RestClient` instances.
Spring Boot is configuring that builder with `HttpMessageConverters` and an appropriate `ClientHttpRequestFactory`.

The following code shows a typical example:

```java
// Example: MyService
```

### RestClient Customization

There are three main approaches to `RestClient` customization, depending on how broadly you want the customizations to apply.

To make the scope of any customizations as narrow as possible, inject the auto-configured javadoc:org.springframework.web.client.RestClient$Builder[] and then call its methods as required.
javadoc:org.springframework.web.client.RestClient$Builder[] instances are stateful: Any change on the builder is reflected in all clients subsequently created with it.
If you want to create several clients with the same builder, you can also consider cloning the builder with `RestClient.Builder other = builder.clone();`.

To make an application-wide, additive customization to all javadoc:org.springframework.web.client.RestClient$Builder[] instances, you can declare `RestClientCustomizer` beans and change the javadoc:org.springframework.web.client.RestClient$Builder[] locally at the point of injection.

Finally, you can fall back to the original API and use `RestClient.create()`.
In that case, no auto-configuration or `RestClientCustomizer` is applied.

> **Tip:** You can also change the global HTTP client configuration.

### RestClient SSL Support

If you need custom SSL configuration on the `ClientHttpRequestFactory` used by the `RestClient`, you can inject a `RestClientSsl` instance that can be used with the builder's `apply` method.

The `RestClientSsl` interface provides access to any SSL bundles that you have defined in your `application.properties` or `application.yaml` file.

The following code shows a typical example:

```java
// Example: MyService
```

If you need to apply other customization in addition to an SSL bundle, you can use the `HttpClientSettings` class with `ClientHttpRequestFactoryBuilder`:

```java
// Example: settings/MyService
```

## RestTemplate

Spring Framework's `RestTemplate` class predates `RestClient` and is the classic way that many applications use to call remote REST services.
You might choose to use `RestTemplate` when you have existing code that you don't want to migrate to `RestClient`, or because you're already familiar with the `RestTemplate` API.

Since `RestTemplate` instances often need to be customized before being used, Spring Boot does not provide any single auto-configured `RestTemplate` bean.
It does, however, auto-configure a `RestTemplateBuilder`, which can be used to create `RestTemplate` instances when needed.
The auto-configured `RestTemplateBuilder` ensures that sensible `HttpMessageConverters` and an appropriate `ClientHttpRequestFactory` are applied to `RestTemplate` instances.

The following code shows a typical example:

```java
// Example: MyService
```

`RestTemplateBuilder` includes a number of useful methods that can be used to quickly configure a `RestTemplate`.
For example, to add BASIC authentication support, you can use `builder.basicAuthentication("user", "password").build()`.

### RestTemplate Customization

There are three main approaches to `RestTemplate` customization, depending on how broadly you want the customizations to apply.

To make the scope of any customizations as narrow as possible, inject the auto-configured `RestTemplateBuilder` and then call its methods as required.
Each method call returns a new `RestTemplateBuilder` instance, so the customizations only affect this use of the builder.

To make an application-wide, additive customization, use a `RestTemplateCustomizer` bean.
All such beans are automatically registered with the auto-configured `RestTemplateBuilder` and are applied to any templates that are built with it.

The following example shows a customizer that configures the use of a proxy for all hosts except `192.168.0.5`:

```java
// Example: MyRestTemplateCustomizer
```

Finally, you can define your own `RestTemplateBuilder` bean.
Doing so will replace the auto-configured builder.
If you want any `RestTemplateCustomizer` beans to be applied to your custom builder, as the auto-configuration would have done, configure it using a `RestTemplateBuilderConfigurer`.
The following example exposes a `RestTemplateBuilder` that matches what Spring Boot's auto-configuration would have done, except that custom connect and read timeouts are also specified:

```java
// Example: MyRestTemplateBuilderConfiguration
```

The most extreme (and rarely used) option is to create your own `RestTemplateBuilder` bean without using a configurer.
In addition to replacing the auto-configured builder, this also prevents any `RestTemplateCustomizer` beans from being used.

> **Tip:** You can also change the global HTTP client configuration.

### RestTemplate SSL Support

If you need custom SSL configuration on the `RestTemplate`, you can apply an SSL bundle to the `RestTemplateBuilder` as shown in this example:

```java
// Example: MyService
```

## HTTP Client Detection for RestClient and RestTemplate

Spring Boot will auto-detect which HTTP client to use with `RestClient` and `RestTemplate` depending on the libraries available on the application classpath.
In order of preference, the following clients are supported:

. Apache HttpClient
. Jetty HttpClient
. Reactor Netty HttpClient
. JDK client (`java.net.http.HttpClient`)
. Simple JDK client (`java.net.HttpURLConnection`)

If multiple clients are available on the classpath, and not global configuration is provided, the most preferred client will be used.

### Global HTTP Client Configuration

If the auto-detected HTTP client does not meet your needs, you can use the `spring.http.clients.imperative.factory` property to pick a specific factory.
For example, if you have Apache HttpClient on your classpath, but you prefer Jetty's `HttpClient` you can add the following:

```yaml
spring:
  http:
    clients:
      imperative:
        factory: jetty
```

> **Tip:** You can also use global configuration properties which apply to all HTTP clients.

For more complex customizations, you can use `ClientHttpRequestFactoryBuilderCustomizer` or declare your own `ClientHttpRequestFactoryBuilder` bean which will cause auto-configuration to back off.
This can be useful when you need to customize some of the internals of the underlying HTTP library.

For example, the following will use a JDK client configured with a specific `ProxySelector`:

```java
// Example: MyClientHttpConfiguration
```

## API Versioning

Both `WebClient` and `RestClient` support making versioned remote HTTP calls so that APIs can be evolved over time.
Commonly this involves sending an HTTP header, a query parameter or URL path segment that indicates the version of the API that should be used.

You can configure API versioning using methods on `WebClient.Builder` or `RestClient.Builder`.

> **Tip:** API versioning is also supported on the server-side.
See the Spring MVC and Spring WebFlux sections for details.

> **Note:** The server-side API versioning configuration is not taken into account to auto-configure the client.
Clients that should use an API versioning strategy, typically for testing, need to configure it explicitly.

## HTTP Service Interface Clients

Instead of directly using a `RestClient` or `WebClient` to call an HTTP service, it's also possible to call them using annotated Java interfaces.

HTTP Service interfaces defines a service contract by using methods that are annotated with `@HttpExchange`, or more typically the method specific variants (`@GetExchange`, `@PostExchange`, `@DeleteExchange`, etc).

For example, the following code defines an HTTP Service for an an "`echo`" API that will return a JSON object containing an echo of the request.

```java
// Example: EchoService
```

More details about how to develop HTTP Service interface clients can be found in the /integration/rest-clients.html#rest-http-service-client[Spring Framework reference documentation].

### Importing HTTP Services

In order to use an HTTP Service interface as client you need to import it.
One way to achieve this is to use the `@ImportHttpServices` annotation, typically on your main application class.
You can use the annotation to import specific classes, or scan for classes to import from specific packages.

For example, the following configuration will scan for HTTP Service interfaces in the `com.example.myclients` package:

```java
// Example: MyApplication
```

### Service Client Groups

Hard-coding absolute URLs in `@HttpExchange` annotations is often not ideal in production applications.
Instead, you will typically want to give the HTTP Service client a logical name in your code, and then lookup a URL from a property based on that name.

HTTP Service clients allow you to do this by registering them into named groups.
An HTTP Service group is a collection of HTTP Service interfaces that all share common features.

For example, we may want to define an "`echo`" group to use for HTTP Service clients that call `\<https://echo.zuplo.io`.>

> **Note:** HTTP Service groups can be used to define more than just URLs.
For example, your group could define connection timeouts and SSL settings.
You can also associate client customization logic to a group, such as adding code to insert required authorization headers.

To associate an HTTP Service interface with a group when using `@ImportHttpServices` you can use the `group` attribute.

For example, if we assume our example above is organized in such a way that all HTTP Service interfaces in the `com.example.myclients` package belong to the `echo` group.
We first remove the hardcoded URL from the service interface:

```java
// Example: EchoService
```

We can then write:

```java
// Example: MyApplication
```

And finally we can then use a `base-url` property to link the `echo` group to an actual URL:

```yaml
spring:
  http:
    serviceclient:
      echo:
        base-url: "<https://echo.zuplo.io">
```

> **Tip:** HTTP Service clients will be associated with a group named "`default`" if you don't specify a group.

> **Note:**
> If you have multiple HTTP Service interfaces in the same package that need to be associated with different groups you can list them individually.
> The `@ImportHttpServices` is repeatable and the `types` attributes allows you to import individual classes.
> 
> For example:
> 
> ```java
// Example: repeat/MyApplication
```

### Configuration Properties

Configuration properties for HTTP Services can be specified under `spring.http.serviceclient.<group-name>`:

You can use properties to configure aspects such as:

* The base URL.
* Any default headers that should be sent.
* API versioning configuration.
* Redirect settings.
* Connection and read timeouts.
* SSL bundles to use.

> **Tip:** You can also use global configuration properties which apply to all HTTP clients.

For example, the properties below will:

* Configure all HTTP clients to use a one second connect timeout (unless otherwise overridden).
* Configure HTTP Service clients in the "`echo`" group to:
** Use a specific base URL.
** Have a two second read timeout.
** Insert API version information using an `X-Version` header.

```yaml
spring:
  http:
    clients:
      connect-timeout: 1s
    serviceclient:
      echo:
        base-url: "<https://echo.zuplo.io">
        read-timeout: 2s;
        apiversion:
          default: 1.0.0
          insert:
            header: X-Version
```

### Customization

If you need to customize HTTP Service clients beyond basic properties, you can use an HTTP Service group configurer.
For `RestClient` backed HTTP Service clients, you can declare a bean that implements `RestClientHttpServiceGroupConfigurer`.
For `WebClient` backed HTTP Service clients you can declare a bean that implements `WebClientHttpServiceGroupConfigurer`.

Both work in the same way and will be automatically applied by Spring Boot's auto-configuration.

For example, the following configuration would add a group customizer that adds an HTTP header to each outgoing request containing the group name:

```java
// Example: MyHttpServiceGroupConfiguration
```

### Advanced Configuration

As well as the `@ImportHttpServices` annotation, Spring Framework also offers an `AbstractHttpServiceRegistrar` class.
You can `@Import` your own extension of this class to perform programmatic configuration.
For more details, see /integration/rest-clients.html#rest-http-service-client-group-config[Spring Framework reference documentation].

Regardless of which method you use to register HTTP Service clients, Spring Boot's support remains the same.

## Applying Global Configuration to All HTTP Clients

Regardless of the underlying technology being used, all HTTP clients have common settings that can be configured.

These include:

* Connection Timeouts.
* Read Timeouts.
* How HTTP redirects should be handled.
* Which SSL bundle should be used when connecting.

These common settings are represented by the `HttpClientSettings` class which can be passed into the `build(...)` methods of `ClientHttpConnectorBuilder` and `ClientHttpRequestFactoryBuilder`.

If you want to apply the same configuration to all auto-configured clients, you can use `spring.http.clients` properties to do so:

```yaml
spring:
  http:
    clients:
      connect-timeout: 2s
      read-timeout: 1s
      redirects: dont-follow
```
