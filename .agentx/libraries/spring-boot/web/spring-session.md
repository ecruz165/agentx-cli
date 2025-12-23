---
title: "Spring Session"
source: spring-boot-docs-v4
tokens: ~307
---

# Spring Session

Spring Boot provides [Spring Session] auto-configuration for a range of data stores.
When building a servlet web application, the following stores can be auto-configured:

* Redis
* JDBC

Additionally, [Spring Boot for Apache Geode] provides #geode-session[auto-configuration for using Apache Geode as a session store].

The servlet auto-configuration replaces the need to use `@Enable*HttpSession`.

If a single Spring Session module is present on the classpath, Spring Boot uses that store implementation automatically.
If you have more than one implementation, Spring Boot uses the following order for choosing a specific implementation:

. Redis
. JDBC
. If neither Redis nor JDBC are available, we do not configure a `SessionRepository`.

When building a reactive web application, the Redis store can be auto-configured.
This replaces the need to use `@EnableRedisWebSession`.

Each store has specific additional settings.
For instance, it is possible to customize the name of the table for the JDBC store, as shown in the following example:

```yaml
spring:
  session:
    jdbc:
      table-name: "SESSIONS"
```

For setting the timeout of the session you can use the `spring.session.timeout` property.
If that property is not set with a servlet web application, the auto-configuration falls back to the value of `server.servlet.session.timeout`.

You can take control over Spring Session's configuration using `@Enable*HttpSession` (servlet) or `@EnableRedisWebSession` (reactive).
This will cause the auto-configuration to back off.
Spring Session can then be configured using the annotation's attributes rather than the previously described configuration properties.
