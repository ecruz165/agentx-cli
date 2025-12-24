---
title: "Spring GraphQL"
source: spring-boot-docs-v4
tokens: ~1123
---

# Spring for GraphQL

If you want to build GraphQL applications, you can take advantage of Spring Boot's auto-configuration for [Spring for GraphQL].
The Spring for GraphQL project is based on [GraphQL Java](https://github.com/graphql-java/graphql-java).
You'll need the `spring-boot-starter-graphql` starter at a minimum.
Because GraphQL is transport-agnostic, you'll also need to have one or more additional starters in your application to expose your GraphQL API over the web:

[cols="1,1,1"]
| Starter | Transport | Implementation
| --- | --- |
| `spring-boot-starter-web`
| HTTP
| Spring MVC
| `spring-boot-starter-websocket`
| WebSocket
| WebSocket for Servlet apps
| `spring-boot-starter-webflux`
| HTTP, WebSocket
| Spring WebFlux
| `spring-boot-starter-rsocket`
| TCP, WebSocket
| Spring WebFlux on Reactor Netty

## GraphQL Schema

A Spring GraphQL application requires a defined schema at startup.
By default, you can write ".graphqls" or ".gqls" schema files under `src/main/resources/graphql/**` and Spring Boot will pick them up automatically.
You can customize the locations with `spring.graphql.schema.locations` and the file extensions with `spring.graphql.schema.file-extensions`.

> **Note:** If you want Spring Boot to detect schema files in all your application modules and dependencies for that location,
you can set `spring.graphql.schema.locations` to ``"classpath*:graphql/***/"`` (note the `classpath**:` prefix).

In the following sections, we'll consider this sample GraphQL schema, defining two types and two queries:

[source,json,subs="verbatim,quotes"]
```
include::ROOT:example$resources/graphql/schema.graphqls[]
```

> **Note:** By default, [field introspection](https://spec.graphql.org/draft/#sec-Introspection) will be allowed on the schema as it is required for tools such as GraphiQL.
If you wish to not expose information about the schema, you can disable introspection by setting `spring.graphql.schema.introspection.enabled` to `false`.

## GraphQL RuntimeWiring

The GraphQL Java javadoc:graphql.schema.idl.RuntimeWiring$Builder[] can be used to register custom scalar types, directives, type resolvers, `DataFetcher`, and more.
You can declare `RuntimeWiringConfigurer` beans in your Spring config to get access to the javadoc:graphql.schema.idl.RuntimeWiring$Builder[].
Spring Boot detects such beans and adds them to the /request-execution.html#execution.graphqlsource[GraphQlSource builder].

Typically, however, applications will not implement `DataFetcher` directly and will instead create /controllers.html[annotated controllers].
Spring Boot will automatically detect `@Controller` classes with annotated handler methods and register those as ``DataFetcher``s.
Here's a sample implementation for our greeting query with a `@Controller` class:

```java
// Example: GreetingController
```

## Querydsl and QueryByExample Repositories Support

Spring Data offers support for both Querydsl and QueryByExample repositories.
Spring GraphQL can /data.html[configure Querydsl and QueryByExample repositories as `DataFetcher`].

Spring Data repositories annotated with `@GraphQlRepository` and extending one of:

* `QuerydslPredicateExecutor`
* `ReactiveQuerydslPredicateExecutor`
* `QueryByExampleExecutor`
* `ReactiveQueryByExampleExecutor`

are detected by Spring Boot and considered as candidates for `DataFetcher` for matching top-level queries.

## Transports

### HTTP and WebSocket

The GraphQL HTTP endpoint is at HTTP POST `/graphql` by default.
It also supports the `"text/event-stream"` media type over Server Sent Events for subscriptions only.
The path can be customized with `spring.graphql.http.path`.

> **Tip:** The HTTP endpoint for both Spring MVC and Spring WebFlux is provided by a `RouterFunction` bean with an `@Order` of `0`.
If you define your own `RouterFunction` beans, you may want to add appropriate `@Order` annotations to ensure that they are sorted correctly.

The GraphQL WebSocket endpoint is off by default. To enable it:

* For a Servlet application, add the WebSocket starter `spring-boot-starter-websocket`
* For a WebFlux application, no additional dependency is required
* For both, the `spring.graphql.websocket.path` application property must be set

Spring GraphQL provides a /transports.html#server.interception[Web Interception] model.
This is quite useful for retrieving information from an HTTP request header and set it in the GraphQL context or fetching information from the same context and writing it to a response header.
With Spring Boot, you can declare a `WebGraphQlInterceptor` bean to have it registered with the web transport.

/web/webmvc-cors.html[Spring MVC] and /web/webflux-cors.html[Spring WebFlux] support CORS (Cross-Origin Resource Sharing) requests.
CORS is a critical part of the web config for GraphQL applications that are accessed from browsers using different domains.

Spring Boot supports many configuration properties under the `spring.graphql.cors.*` namespace; here's a short configuration sample:

```yaml
spring:
  graphql:
    cors:
      allowed-origins: "<https://example.org">
      allowed-methods: GET,POST
      max-age: 1800s
```

### RSocket

RSocket is also supported as a transport, on top of WebSocket or TCP.
Once the RSocket server is configured, we can configure our GraphQL handler on a particular route using `spring.graphql.rsocket.mapping`.
For example, configuring that mapping as `"graphql"` means we can use that as a route when sending requests with the `RSocketGraphQlClient`.

Spring Boot auto-configures a `RSocketGraphQlClient.Builder<?>` bean that you can inject in your components:

include-code::RSocketGraphQlClientExample[tag=builder]

And then send a request:
include-code::RSocketGraphQlClientExample[tag=request]

## Exception Handling

Spring GraphQL enables applications to register one or more Spring `DataFetcherExceptionResolver` components that are invoked sequentially.
The Exception must be resolved to a list of javadoc:/graphql.GraphQLError[] objects, see /controllers.html#controllers.exception-handler[Spring GraphQL exception handling documentation].
Spring Boot will automatically detect `DataFetcherExceptionResolver` beans and register them with the javadoc:org.springframework.graphql.execution.GraphQlSource$Builder[].

## GraphiQL and Schema Printer

Spring GraphQL offers infrastructure for helping developers when consuming or developing a GraphQL API.

Spring GraphQL ships with a default [GraphiQL](https://github.com/graphql/graphiql) page that is exposed at `"/graphiql"` by default.
This page is disabled by default and can be turned on with the `spring.graphql.graphiql.enabled` property.
Many applications exposing such a page will prefer a custom build.
A default implementation is very useful during development, this is why it is exposed automatically with `spring-boot-devtools` during development.

You can also choose to expose the GraphQL schema in text format at `/graphql/schema` when the `spring.graphql.schema.printer.enabled` property is enabled.
