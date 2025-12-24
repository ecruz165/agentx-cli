---
title: "How-to: Testing"
source: spring-boot-docs-v4
tokens: ~437
---

# Testing

Spring Boot includes a number of testing utilities and support classes as well as a dedicated starter that provides common test dependencies.
This section answers common questions about testing.

## Testing With Spring Security

Spring Security provides support for running tests as a specific user.
For example, the test in the snippet below will run with an authenticated user that has the `ADMIN` role.

```java
// Example: MySecurityTests
```

Spring Security provides comprehensive integration with Spring MVC Test, and this can also be used when testing controllers using the `@WebMvcTest` slice and `MockMvc`.

For additional details on Spring Security's testing support, see Spring Security's /servlet/test/index.html[reference documentation].

## Structure `@Configuration` Classes for Inclusion in Slice Tests

Slice tests work by restricting Spring Framework's component scanning to a limited set of components based on their type.
For any beans that are not created through component scanning, for example, beans that are created using the `@Bean` annotation, slice tests will not be able to include/exclude them from the application context.
Consider this example:

```java
// Example: MyConfiguration
```

For a `@WebMvcTest` for an application with the above `@Configuration` class, you might expect to have the `SecurityFilterChain` bean in the application context so that you can test if your controller endpoints are secured properly.
However, `MyConfiguration` is not picked up by @WebMvcTest's component scanning filter because it doesn't match any of the types specified by the filter.
You can include the configuration explicitly by annotating the test class with `@Import(MyConfiguration.class)`.
This will load all the beans in `MyConfiguration` including the `HikariDataSource` bean which isn't required when testing the web tier.
Splitting the configuration class into two will enable importing just the security configuration.

```java
// Example: MySecurityConfiguration
```

```java
// Example: MyDatasourceConfiguration
```

Having a single configuration class can be inefficient when beans from a certain domain need to be included in slice tests.
Instead, structuring the application's configuration as multiple granular classes with beans for a specific domain can enable importing them only for specific slice tests.
