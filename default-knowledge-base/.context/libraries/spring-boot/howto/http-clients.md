---
title: "How-to: HTTP Clients"
source: spring-boot-docs-v4
tokens: ~212
---

# HTTP Clients

Spring Boot offers a number of starters that work with HTTP clients.
This section answers questions related to using them.

## Configure RestTemplate to Use a Proxy

As described in RestTemplate Customization, you can use a `RestTemplateCustomizer` with `RestTemplateBuilder` to build a customized `RestTemplate`.
This is the recommended approach for creating a `RestTemplate` configured to use a proxy.

The exact details of the proxy configuration depend on the underlying client request factory that is being used.

## Configure the TcpClient used by a Reactor Netty-based WebClient

When Reactor Netty is on the classpath a Reactor Netty-based `WebClient` is auto-configured.
To customize the client's handling of network connections, provide a `ClientHttpConnector` bean.
The following example configures a 60 second connect timeout and adds a `ReadTimeoutHandler`:

```java
// Example: MyReactorNettyClientConfiguration
```

> **Tip:** Note the use of `ReactorResourceFactory` for the connection provider and event loop resources.
This ensures efficient sharing of resources for the server receiving requests and the client making requests.
