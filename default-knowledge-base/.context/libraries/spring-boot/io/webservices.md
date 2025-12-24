---
title: "Web Services"
source: spring-boot-docs-v4
tokens: ~251
---

# Web Services

Spring Boot provides Web Services auto-configuration so that all you must do is define your `@Endpoint` beans.

The [Spring Web Services features] can be easily accessed with the `spring-boot-starter-webservices` module.

`SimpleWsdl11Definition` and `SimpleXsdSchema` beans can be automatically created for your WSDLs and XSDs respectively.
To do so, configure their location, as shown in the following example:

```yaml
spring:
  webservices:
    wsdl-locations: "classpath:/wsdl"
```

## Calling Web Services with WebServiceTemplate

If you need to call remote Web services from your application, you can use the #client-web-service-template[`WebServiceTemplate`] class.
Since `WebServiceTemplate` instances often need to be customized before being used, Spring Boot does not provide any single auto-configured `WebServiceTemplate` bean.
It does, however, auto-configure a `WebServiceTemplateBuilder`, which can be used to create `WebServiceTemplate` instances when needed.

The following code shows a typical example:

```java
// Example: MyService
```

By default, `WebServiceTemplateBuilder` detects a suitable HTTP-based `WebServiceMessageSender` using the available HTTP client libraries on the classpath.
You can also customize read and connection timeouts for an individual builder as follows:

```java
// Example: MyWebServiceTemplateConfiguration
```

> **Tip:** You can also change the global HTTP client configuration used if not specific template customization code is applied.
