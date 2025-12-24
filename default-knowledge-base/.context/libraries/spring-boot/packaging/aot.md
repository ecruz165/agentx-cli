---
title: "Ahead-of-Time Processing"
source: spring-boot-docs-v4
tokens: ~246
---

# Ahead-of-Time Processing With the JVM

It's beneficial for the startup time to run your application using the AOT generated initialization code.
First, you need to ensure that the jar you are building includes AOT generated code.

> **Note:** AOT cache and Spring's AOT can be combined to further improve startup time.

For Maven, this means that you should build with `-Pnative` to activate the `native` profile:

```shell
$ mvn -Pnative package
```

For Gradle, you need to ensure that your build includes the `org.springframework.boot.aot` plugin.

When the JAR has been built, run it with `spring.aot.enabled` system property set to `true`. For example:

```shell
$ java -Dspring.aot.enabled=true -jar myapplication.jar

........ Starting AOT-processed MyApplication ...
```

Beware that using the ahead-of-time processing has drawbacks.
It implies the following restrictions:

* The classpath is fixed and fully defined at build time
* The beans defined in your application cannot change at runtime, meaning:
- The Spring `@Profile` annotation and profile-specific configuration have limitations.
- Properties that change if a bean is created are not supported (for example, `@ConditionalOnProperty` and `.enabled` properties).

To learn more about ahead-of-time processing, please see the  section.
