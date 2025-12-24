# Spring Boot 4.0.0 Managed Dependency Versions

> **Source**: https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html
> 
> This document lists all dependency versions managed by Spring Boot 4.0.0. When you declare a dependency on one of these artifacts without specifying a version, Spring Boot will use the version listed here.

## Quick Reference

Use these coordinates in your `pom.xml` or `build.gradle` without specifying versions - Spring Boot's dependency management will provide them automatically.

---

## Key Version Summary

- **Spring Framework**: `7.0.0`
- **Spring Security**: `7.0.0`
- **Spring Data JPA**: `4.0.0`
- **Hibernate ORM**: `7.0.0`
- **Jackson**: `2.20.1`
- **Reactor**: `3.8.0`
- **Micrometer**: `1.16.0`
- **OpenTelemetry**: `1.55.0`
- **Tomcat**: `11.0.14`
- **Jetty**: `12.1.4`
- **Netty**: `4.2.7.Final`
- **HikariCP**: `7.0.2`
- **PostgreSQL Driver**: `42.7.7`
- **MySQL Connector**: `9.5.0`
- **MongoDB Driver**: `5.5.0`
- **Kafka**: `4.1.1`
- **Flyway**: `11.8.2`
- **Liquibase**: `4.32.0`
- **Logback**: `1.5.21`
- **Log4j2**: `2.25.2`
- **SLF4J**: `2.0.17`
- **JUnit Jupiter**: `5.12.2`
- **Mockito**: `5.18.0`
- **AssertJ**: `3.27.6`
- **Testcontainers**: `1.21.0`

---

## Complete Dependency Table

| Group ID | Artifact ID | Version |
|----------|-------------|----------|
| `ch.qos.logback` | `logback-classic` | `1.5.21` |
| `ch.qos.logback` | `logback-core` | `1.5.21` |
| `co.elastic.clients` | `elasticsearch-java` | `9.2.1` |
| `co.elastic.clients` | `elasticsearch-rest5-client` | `9.2.1` |
| `com.couchbase.client` | `java-client` | `3.9.2` |
| `com.datastax.oss` | `native-protocol` | `1.5.2` |
| `com.fasterxml` | `classmate` | `1.7.1` |
| `com.fasterxml.jackson.core` | `jackson-annotations` | `2.20` |
| `com.fasterxml.jackson.core` | `jackson-core` | `2.20.1` |
| `com.fasterxml.jackson.core` | `jackson-databind` | `2.20.1` |
| `com.fasterxml.jackson.dataformat` | `jackson-dataformat-avro` | `2.20.1` |
| `com.fasterxml.jackson.dataformat` | `jackson-dataformat-cbor` | `2.20.1` |
| `com.fasterxml.jackson.dataformat` | `jackson-dataformat-csv` | `2.20.1` |
| `com.fasterxml.jackson.dataformat` | `jackson-dataformat-ion` | `2.20.1` |
| `com.fasterxml.jackson.dataformat` | `jackson-dataformat-properties` | `2.20.1` |
| `com.fasterxml.jackson.dataformat` | `jackson-dataformat-protobuf` | `2.20.1` |
| `com.fasterxml.jackson.dataformat` | `jackson-dataformat-smile` | `2.20.1` |
| `com.fasterxml.jackson.dataformat` | `jackson-dataformat-toml` | `2.20.1` |
| `com.fasterxml.jackson.dataformat` | `jackson-dataformat-xml` | `2.20.1` |
| `com.fasterxml.jackson.dataformat` | `jackson-dataformat-yaml` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-eclipse-collections` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-guava` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-hibernate4` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-hibernate5` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-hibernate5-jakarta` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-hibernate6` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-hibernate7` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-hppc` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-jakarta-jsonp` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-javax-money` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-jaxrs` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-jdk8` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-joda` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-joda-money` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-json-org` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-jsr310` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-jsr353` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-moneta` | `2.20.1` |
| `com.fasterxml.jackson.datatype` | `jackson-datatype-pcollections` | `2.20.1` |
| `com.fasterxml.jackson.jakarta.rs` | `jackson-jakarta-rs-base` | `2.20.1` |
| `com.fasterxml.jackson.jakarta.rs` | `jackson-jakarta-rs-cbor-provider` | `2.20.1` |
| `com.fasterxml.jackson.jakarta.rs` | `jackson-jakarta-rs-json-provider` | `2.20.1` |
| `com.fasterxml.jackson.jakarta.rs` | `jackson-jakarta-rs-smile-provider` | `2.20.1` |
| `com.fasterxml.jackson.jakarta.rs` | `jackson-jakarta-rs-xml-provider` | `2.20.1` |
| `com.fasterxml.jackson.jakarta.rs` | `jackson-jakarta-rs-yaml-provider` | `2.20.1` |
| `com.fasterxml.jackson.jaxrs` | `jackson-jaxrs-base` | `2.20.1` |
| `com.fasterxml.jackson.jaxrs` | `jackson-jaxrs-cbor-provider` | `2.20.1` |
| `com.fasterxml.jackson.jaxrs` | `jackson-jaxrs-json-provider` | `2.20.1` |
| `com.fasterxml.jackson.jaxrs` | `jackson-jaxrs-smile-provider` | `2.20.1` |
| `com.fasterxml.jackson.jaxrs` | `jackson-jaxrs-xml-provider` | `2.20.1` |
| `com.fasterxml.jackson.jaxrs` | `jackson-jaxrs-yaml-provider` | `2.20.1` |
| `com.fasterxml.jackson.jr` | `jackson-jr-all` | `2.20.1` |
| `com.fasterxml.jackson.jr` | `jackson-jr-annotation-support` | `2.20.1` |
| `com.fasterxml.jackson.jr` | `jackson-jr-extension-javatime` | `2.20.1` |
| `com.fasterxml.jackson.jr` | `jackson-jr-objects` | `2.20.1` |
| `com.fasterxml.jackson.jr` | `jackson-jr-retrofit2` | `2.20.1` |
| `com.fasterxml.jackson.jr` | `jackson-jr-stree` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-afterburner` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-android-record` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-blackbird` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-guice` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-guice7` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-jakarta-xmlbind-annotations` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-jaxb-annotations` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-jsonSchema` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-jsonSchema-jakarta` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-kotlin` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-mrbean` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-no-ctor-deser` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-osgi` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-parameter-names` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-paranamer` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-scala_2.11` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-scala_2.12` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-scala_2.13` | `2.20.1` |
| `com.fasterxml.jackson.module` | `jackson-module-scala_3` | `2.20.1` |
| `com.github.ben-manes.caffeine` | `caffeine` | `3.2.3` |
| `com.github.ben-manes.caffeine` | `guava` | `3.2.3` |
| `com.github.ben-manes.caffeine` | `jcache` | `3.2.3` |
| `com.github.ben-manes.caffeine` | `simulator` | `3.2.3` |
| `com.github.mxab.thymeleaf.extras` | `thymeleaf-extras-data-attribute` | `2.0.1` |
| `com.google.code.gson` | `gson` | `2.13.2` |
| `com.graphql-java` | `graphql-java` | `25.0` |
| `com.h2database` | `h2` | `2.4.240` |
| `com.hazelcast` | `hazelcast` | `5.5.0` |
| `com.hazelcast` | `hazelcast-spring` | `5.5.0` |
| `com.ibm.db2` | `jcc` | `12.1.3.0` |
| `com.jayway.jsonpath` | `json-path` | `2.9.0` |
| `com.jayway.jsonpath` | `json-path-assert` | `2.9.0` |
| `com.microsoft.sqlserver` | `mssql-jdbc` | `13.2.1.jre11` |
| `com.mysql` | `mysql-connector-j` | `9.5.0` |
| `com.oracle.database.ha` | `ons` | `23.9.0.25.07` |
| `com.oracle.database.ha` | `simplefan` | `23.9.0.25.07` |
| `com.oracle.database.jdbc` | `ojdbc11` | `23.9.0.25.07` |
| `com.oracle.database.jdbc` | `ojdbc11-production` | `23.9.0.25.07` |
| `com.oracle.database.jdbc` | `ojdbc17` | `23.9.0.25.07` |
| `com.oracle.database.jdbc` | `ojdbc17-production` | `23.9.0.25.07` |
| `com.oracle.database.jdbc` | `ojdbc8` | `23.9.0.25.07` |
| `com.oracle.database.jdbc` | `ojdbc8-production` | `23.9.0.25.07` |
| `com.oracle.database.jdbc` | `rsi` | `23.9.0.25.07` |
| `com.oracle.database.jdbc` | `ucp` | `23.9.0.25.07` |
| `com.oracle.database.jdbc` | `ucp11` | `23.9.0.25.07` |
| `com.oracle.database.jdbc` | `ucp17` | `23.9.0.25.07` |
| `com.oracle.database.nls` | `orai18n` | `23.9.0.25.07` |
| `com.oracle.database.r2dbc` | `oracle-r2dbc` | `1.3.0` |
| `com.oracle.database.security` | `oraclepki` | `23.9.0.25.07` |
| `com.oracle.database.xml` | `xdb` | `23.9.0.25.07` |
| `com.oracle.database.xml` | `xmlparserv2` | `23.9.0.25.07` |
| `com.querydsl` | `codegen-utils` | `5.1.0` |
| `com.querydsl` | `querydsl-apt` | `5.1.0` |
| `com.querydsl` | `querydsl-codegen` | `5.1.0` |
| `com.querydsl` | `querydsl-collections` | `5.1.0` |
| `com.querydsl` | `querydsl-core` | `5.1.0` |
| `com.querydsl` | `querydsl-guava` | `5.1.0` |
| `com.querydsl` | `querydsl-hibernate-search` | `5.1.0` |
| `com.querydsl` | `querydsl-jdo` | `5.1.0` |
| `com.querydsl` | `querydsl-jpa` | `5.1.0` |
| `com.querydsl` | `querydsl-jpa-codegen` | `5.1.0` |
| `com.querydsl` | `querydsl-kotlin` | `5.1.0` |
| `com.querydsl` | `querydsl-kotlin-codegen` | `5.1.0` |
| `com.querydsl` | `querydsl-lucene3` | `5.1.0` |
| `com.querydsl` | `querydsl-lucene4` | `5.1.0` |
| `com.querydsl` | `querydsl-lucene5` | `5.1.0` |
| `com.querydsl` | `querydsl-mongodb` | `5.1.0` |
| `com.querydsl` | `querydsl-scala` | `5.1.0` |
| `com.querydsl` | `querydsl-spatial` | `5.1.0` |
| `com.querydsl` | `querydsl-sql` | `5.1.0` |
| `com.querydsl` | `querydsl-sql-codegen` | `5.1.0` |
| `com.querydsl` | `querydsl-sql-spatial` | `5.1.0` |
| `com.querydsl` | `querydsl-sql-spring` | `5.1.0` |
| `com.rabbitmq` | `amqp-client` | `5.27.1` |
| `com.rabbitmq` | `stream-client` | `0.23.0` |
| `com.redis` | `testcontainers-redis` | `2.2.4` |
| `com.samskivert` | `jmustache` | `1.16` |
| `com.sendgrid` | `sendgrid-java` | `4.10.3` |
| `com.sun.xml.bind` | `jaxb-core` | `4.0.6` |
| `com.sun.xml.bind` | `jaxb-impl` | `4.0.6` |
| `com.sun.xml.bind` | `jaxb-jxc` | `4.0.6` |
| `com.sun.xml.bind` | `jaxb-osgi` | `4.0.6` |
| `com.sun.xml.bind` | `jaxb-xjc` | `4.0.6` |
| `com.sun.xml.messaging.saaj` | `saaj-impl` | `3.0.4` |
| `com.unboundid` | `unboundid-ldapsdk` | `7.0.3` |
| `com.zaxxer` | `HikariCP` | `7.0.2` |
| `commons-codec` | `commons-codec` | `1.19.0` |
| `commons-logging` | `commons-logging` | `1.3.5` |
| `commons-pool` | `commons-pool` | `1.6` |
| `io.asyncer` | `r2dbc-mysql` | `1.4.1` |
| `io.lettuce` | `lettuce-core` | `6.8.1.RELEASE` |
| `io.micrometer` | `context-propagation` | `1.2.0` |
| `io.micrometer` | `docs` | `1.6.0` |
| `io.micrometer` | `micrometer-commons` | `1.16.0` |
| `io.micrometer` | `micrometer-core` | `1.16.0` |
| `io.micrometer` | `micrometer-jakarta9` | `1.16.0` |
| `io.micrometer` | `micrometer-java11` | `1.16.0` |
| `io.micrometer` | `micrometer-java21` | `1.16.0` |
| `io.micrometer` | `micrometer-jetty11` | `1.16.0` |
| `io.micrometer` | `micrometer-jetty12` | `1.16.0` |
| `io.micrometer` | `micrometer-observation` | `1.16.0` |
| `io.micrometer` | `micrometer-observation-test` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-appoptics` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-atlas` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-azure-monitor` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-cloudwatch2` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-datadog` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-dynatrace` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-elastic` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-ganglia` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-graphite` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-health` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-humio` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-influx` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-jmx` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-kairos` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-new-relic` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-opentsdb` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-otlp` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-prometheus` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-prometheus-simpleclient` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-signalfx` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-stackdriver` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-statsd` | `1.16.0` |
| `io.micrometer` | `micrometer-registry-wavefront` | `1.16.0` |
| `io.micrometer` | `micrometer-test` | `1.16.0` |
| `io.micrometer` | `micrometer-tracing` | `1.6.0` |
| `io.micrometer` | `micrometer-tracing-bridge-brave` | `1.6.0` |
| `io.micrometer` | `micrometer-tracing-bridge-otel` | `1.6.0` |
| `io.micrometer` | `micrometer-tracing-integration-test` | `1.6.0` |
| `io.micrometer` | `micrometer-tracing-reporter-wavefront` | `1.6.0` |
| `io.micrometer` | `micrometer-tracing-test` | `1.6.0` |
| `io.netty` | `netty-all` | `4.2.7.Final` |
| `io.netty` | `netty-buffer` | `4.2.7.Final` |
| `io.netty` | `netty-codec` | `4.2.7.Final` |
| `io.netty` | `netty-codec-base` | `4.2.7.Final` |
| `io.netty` | `netty-codec-classes-quic` | `4.2.7.Final` |
| `io.netty` | `netty-codec-compression` | `4.2.7.Final` |
| `io.netty` | `netty-codec-dns` | `4.2.7.Final` |
| `io.netty` | `netty-codec-haproxy` | `4.2.7.Final` |
| `io.netty` | `netty-codec-http` | `4.2.7.Final` |
| `io.netty` | `netty-codec-http2` | `4.2.7.Final` |
| `io.netty` | `netty-codec-http3` | `4.2.7.Final` |
| `io.netty` | `netty-codec-marshalling` | `4.2.7.Final` |
| `io.netty` | `netty-codec-memcache` | `4.2.7.Final` |
| `io.netty` | `netty-codec-mqtt` | `4.2.7.Final` |
| `io.netty` | `netty-codec-native-quic` | `4.2.7.Final` |
| `io.netty` | `netty-codec-protobuf` | `4.2.7.Final` |
| `io.netty` | `netty-codec-redis` | `4.2.7.Final` |
| `io.netty` | `netty-codec-smtp` | `4.2.7.Final` |
| `io.netty` | `netty-codec-socks` | `4.2.7.Final` |
| `io.netty` | `netty-codec-stomp` | `4.2.7.Final` |
| `io.netty` | `netty-codec-xml` | `4.2.7.Final` |
| `io.netty` | `netty-common` | `4.2.7.Final` |
| `io.netty` | `netty-dev-tools` | `4.2.7.Final` |
| `io.netty` | `netty-handler` | `4.2.7.Final` |
| `io.netty` | `netty-handler-proxy` | `4.2.7.Final` |
| `io.netty` | `netty-handler-ssl-ocsp` | `4.2.7.Final` |
| `io.netty` | `netty-pkitesting` | `4.2.7.Final` |
| `io.netty` | `netty-resolver` | `4.2.7.Final` |
| `io.netty` | `netty-resolver-dns` | `4.2.7.Final` |
| `io.netty` | `netty-resolver-dns-classes-macos` | `4.2.7.Final` |
| `io.netty` | `netty-resolver-dns-native-macos` | `4.2.7.Final` |
| `io.netty` | `netty-tcnative` | `2.0.74.Final` |
| `io.netty` | `netty-tcnative-boringssl-static` | `2.0.74.Final` |
| `io.netty` | `netty-tcnative-classes` | `2.0.74.Final` |
| `io.netty` | `netty-transport` | `4.2.7.Final` |
| `io.netty` | `netty-transport-classes-epoll` | `4.2.7.Final` |
| `io.netty` | `netty-transport-classes-io_uring` | `4.2.7.Final` |
| `io.netty` | `netty-transport-classes-kqueue` | `4.2.7.Final` |
| `io.netty` | `netty-transport-native-epoll` | `4.2.7.Final` |
| `io.netty` | `netty-transport-native-io_uring` | `4.2.7.Final` |
| `io.netty` | `netty-transport-native-kqueue` | `4.2.7.Final` |
| `io.netty` | `netty-transport-native-unix-common` | `4.2.7.Final` |
| `io.netty` | `netty-transport-rxtx` | `4.2.7.Final` |
| `io.netty` | `netty-transport-sctp` | `4.2.7.Final` |
| `io.netty` | `netty-transport-udt` | `4.2.7.Final` |
| `io.opentelemetry` | `opentelemetry-api` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-common` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-context` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-exporter-common` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-exporter-logging` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-exporter-logging-otlp` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-exporter-otlp` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-exporter-otlp-common` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-exporter-sender-grpc-managed-channel` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-exporter-sender-jdk` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-exporter-sender-okhttp` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-exporter-zipkin` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-extension-kotlin` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-extension-trace-propagators` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-opentracing-shim` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-sdk` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-sdk-common` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-sdk-extension-autoconfigure` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-sdk-extension-autoconfigure-spi` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-sdk-extension-jaeger-remote-sampler` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-sdk-logs` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-sdk-metrics` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-sdk-testing` | `1.55.0` |
| `io.opentelemetry` | `opentelemetry-sdk-trace` | `1.55.0` |
| `io.projectreactor` | `reactor-core` | `3.8.0` |
| `io.projectreactor` | `reactor-core-micrometer` | `3.8.0` |
| `io.projectreactor` | `reactor-test` | `3.8.0` |
| `io.projectreactor` | `reactor-tools` | `3.8.0` |
| `io.projectreactor.addons` | `reactor-adapter` | `3.6.0` |
| `io.projectreactor.addons` | `reactor-extra` | `3.6.0` |
| `io.projectreactor.addons` | `reactor-pool` | `1.2.0` |
| `io.projectreactor.addons` | `reactor-pool-micrometer` | `1.2.0` |
| `io.projectreactor.kotlin` | `reactor-kotlin-extensions` | `1.3.0` |
| `io.projectreactor.netty` | `reactor-netty` | `1.3.0` |
| `io.projectreactor.netty` | `reactor-netty-core` | `1.3.0` |
| `io.projectreactor.netty` | `reactor-netty-http` | `1.3.0` |
| `io.projectreactor.netty` | `reactor-netty-http-brave` | `1.3.0` |
| `io.projectreactor.netty` | `reactor-netty-quic` | `1.3.0` |
| `io.prometheus` | `prometheus-metrics-config` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-core` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-exporter-common` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-exporter-httpserver` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-exporter-opentelemetry` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-exporter-opentelemetry-no-otel` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-exporter-opentelemetry-otel-agent-resources` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-exporter-pushgateway` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-exporter-servlet-jakarta` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-exporter-servlet-javax` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-exposition-formats` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-exposition-formats-no-protobuf` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-exposition-textformats` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-instrumentation-caffeine` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-instrumentation-dropwizard` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-instrumentation-dropwizard5` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-instrumentation-guava` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-instrumentation-jvm` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-model` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-simpleclient-bridge` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-tracer` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-tracer-common` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-tracer-initializer` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-tracer-otel` | `1.4.3` |
| `io.prometheus` | `prometheus-metrics-tracer-otel-agent` | `1.4.3` |
| `io.prometheus` | `simpleclient` | `0.16.0` |
| `io.prometheus` | `simpleclient_caffeine` | `0.16.0` |
| `io.prometheus` | `simpleclient_common` | `0.16.0` |
| `io.prometheus` | `simpleclient_dropwizard` | `0.16.0` |
| `io.prometheus` | `simpleclient_graphite_bridge` | `0.16.0` |
| `io.prometheus` | `simpleclient_guava` | `0.16.0` |
| `io.prometheus` | `simpleclient_hibernate` | `0.16.0` |
| `io.prometheus` | `simpleclient_hotspot` | `0.16.0` |
| `io.prometheus` | `simpleclient_httpserver` | `0.16.0` |
| `io.prometheus` | `simpleclient_jetty` | `0.16.0` |
| `io.prometheus` | `simpleclient_jetty_jdk8` | `0.16.0` |
| `io.prometheus` | `simpleclient_log4j` | `0.16.0` |
| `io.prometheus` | `simpleclient_log4j2` | `0.16.0` |
| `io.prometheus` | `simpleclient_logback` | `0.16.0` |
| `io.prometheus` | `simpleclient_pushgateway` | `0.16.0` |
| `io.prometheus` | `simpleclient_servlet` | `0.16.0` |
| `io.prometheus` | `simpleclient_servlet_jakarta` | `0.16.0` |
| `io.prometheus` | `simpleclient_spring_boot` | `0.16.0` |
| `io.prometheus` | `simpleclient_spring_web` | `0.16.0` |
| `io.prometheus` | `simpleclient_tracer_common` | `0.16.0` |
| `io.prometheus` | `simpleclient_tracer_otel` | `0.16.0` |
| `io.prometheus` | `simpleclient_tracer_otel_agent` | `0.16.0` |
| `io.prometheus` | `simpleclient_vertx` | `0.16.0` |
| `io.r2dbc` | `r2dbc-h2` | `1.1.0.RELEASE` |
| `io.r2dbc` | `r2dbc-mssql` | `1.0.3.RELEASE` |
| `io.r2dbc` | `r2dbc-pool` | `1.0.2.RELEASE` |
| `io.r2dbc` | `r2dbc-proxy` | `1.1.6.RELEASE` |
| `io.r2dbc` | `r2dbc-spi` | `1.0.0.RELEASE` |
| `io.reactivex.rxjava3` | `rxjava` | `3.1.12` |
| `io.rsocket` | `rsocket-core` | `1.1.5` |
| `io.rsocket` | `rsocket-load-balancer` | `1.1.5` |
| `io.rsocket` | `rsocket-micrometer` | `1.1.5` |
| `io.rsocket` | `rsocket-test` | `1.1.5` |
| `io.rsocket` | `rsocket-transport-local` | `1.1.5` |
| `io.rsocket` | `rsocket-transport-netty` | `1.1.5` |
| `io.spring.gradle` | `dependency-management-plugin` | `1.1.7` |
| `io.zipkin.brave` | `brave` | `6.3.0` |
| `io.zipkin.brave` | `brave-context-jfr` | `6.3.0` |
| `io.zipkin.brave` | `brave-context-log4j12` | `6.3.0` |
| `io.zipkin.brave` | `brave-context-log4j2` | `6.3.0` |
| `io.zipkin.brave` | `brave-context-slf4j` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-dubbo` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-grpc` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-http` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-http-tests` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-http-tests-jakarta` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-httpasyncclient` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-httpclient` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-httpclient5` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-jakarta-jms` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-jaxrs2` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-jdbi3` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-jersey-server` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-jersey-server-jakarta` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-jms` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-jms-jakarta` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-kafka-clients` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-kafka-streams` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-messaging` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-mongodb` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-mysql` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-mysql6` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-mysql8` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-netty-codec-http` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-okhttp3` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-rocketmq-client` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-rpc` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-servlet` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-servlet-jakarta` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-spring-rabbit` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-spring-web` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-spring-webmvc` | `6.3.0` |
| `io.zipkin.brave` | `brave-instrumentation-vertx-web` | `6.3.0` |
| `io.zipkin.brave` | `brave-spring-beans` | `6.3.0` |
| `io.zipkin.brave` | `brave-tests` | `6.3.0` |
| `io.zipkin.reporter2` | `zipkin-reporter` | `3.5.1` |
| `io.zipkin.reporter2` | `zipkin-reporter-brave` | `3.5.1` |
| `io.zipkin.reporter2` | `zipkin-reporter-metrics-micrometer` | `3.5.1` |
| `io.zipkin.reporter2` | `zipkin-reporter-spring-beans` | `3.5.1` |
| `io.zipkin.reporter2` | `zipkin-sender-activemq-client` | `3.5.1` |
| `io.zipkin.reporter2` | `zipkin-sender-amqp-client` | `3.5.1` |
| `io.zipkin.reporter2` | `zipkin-sender-kafka` | `3.5.1` |
| `io.zipkin.reporter2` | `zipkin-sender-libthrift` | `3.5.1` |
| `io.zipkin.reporter2` | `zipkin-sender-okhttp3` | `3.5.1` |
| `io.zipkin.reporter2` | `zipkin-sender-pulsar-client` | `3.5.1` |
| `io.zipkin.reporter2` | `zipkin-sender-urlconnection` | `3.5.1` |
| `jakarta.activation` | `jakarta.activation-api` | `2.1.4` |
| `jakarta.annotation` | `jakarta.annotation-api` | `3.0.0` |
| `jakarta.inject` | `jakarta.inject-api` | `2.0.1` |
| `jakarta.jms` | `jakarta.jms-api` | `3.1.0` |
| `jakarta.json` | `jakarta.json-api` | `2.1.3` |
| `jakarta.json.bind` | `jakarta.json.bind-api` | `3.0.1` |
| `jakarta.mail` | `jakarta.mail-api` | `2.1.5` |
| `jakarta.management.j2ee` | `jakarta.management.j2ee-api` | `1.1.4` |
| `jakarta.persistence` | `jakarta.persistence-api` | `3.2.0` |
| `jakarta.servlet` | `jakarta.servlet-api` | `6.1.0` |
| `jakarta.servlet.jsp.jstl` | `jakarta.servlet.jsp.jstl-api` | `3.0.2` |
| `jakarta.transaction` | `jakarta.transaction-api` | `2.0.1` |
| `jakarta.validation` | `jakarta.validation-api` | `3.1.1` |
| `jakarta.websocket` | `jakarta.websocket-api` | `2.2.0` |
| `jakarta.websocket` | `jakarta.websocket-client-api` | `2.2.0` |
| `jakarta.ws.rs` | `jakarta.ws.rs-api` | `4.0.0` |
| `jakarta.xml.bind` | `jakarta.xml.bind-api` | `4.0.4` |
| `jakarta.xml.soap` | `jakarta.xml.soap-api` | `3.0.2` |
| `jakarta.xml.ws` | `jakarta.xml.ws-api` | `4.0.2` |
| `javax.cache` | `cache-api` | `1.1.1` |
| `javax.money` | `money-api` | `1.1` |
| `jaxen` | `jaxen` | `2.0.0` |
| `junit` | `junit` | `4.13.2` |
| `net.bytebuddy` | `byte-buddy` | `1.17.8` |
| `net.bytebuddy` | `byte-buddy-agent` | `1.17.8` |
| `net.minidev` | `json-smart` | `2.6.0` |
| `net.sourceforge.jtds` | `jtds` | `1.3.1` |
| `net.sourceforge.nekohtml` | `nekohtml` | `1.9.22` |
| `nz.net.ultraq.thymeleaf` | `thymeleaf-layout-dialect` | `3.4.0` |
| `org.apache.activemq` | `activemq-all` | `6.1.8` |
| `org.apache.activemq` | `activemq-amqp` | `6.1.8` |
| `org.apache.activemq` | `activemq-blueprint` | `6.1.8` |
| `org.apache.activemq` | `activemq-broker` | `6.1.8` |
| `org.apache.activemq` | `activemq-client` | `6.1.8` |
| `org.apache.activemq` | `activemq-console` | `6.1.8` |
| `org.apache.activemq` | `activemq-http` | `6.1.8` |
| `org.apache.activemq` | `activemq-jaas` | `6.1.8` |
| `org.apache.activemq` | `activemq-jdbc-store` | `6.1.8` |
| `org.apache.activemq` | `activemq-jms-pool` | `6.1.8` |
| `org.apache.activemq` | `activemq-kahadb-store` | `6.1.8` |
| `org.apache.activemq` | `activemq-karaf` | `6.1.8` |
| `org.apache.activemq` | `activemq-log4j-appender` | `6.1.8` |
| `org.apache.activemq` | `activemq-mqtt` | `6.1.8` |
| `org.apache.activemq` | `activemq-openwire-generator` | `6.1.8` |
| `org.apache.activemq` | `activemq-openwire-legacy` | `6.1.8` |
| `org.apache.activemq` | `activemq-osgi` | `6.1.8` |
| `org.apache.activemq` | `activemq-pool` | `6.1.8` |
| `org.apache.activemq` | `activemq-ra` | `6.1.8` |
| `org.apache.activemq` | `activemq-rar` | `6.1.8` |
| `org.apache.activemq` | `activemq-run` | `6.1.8` |
| `org.apache.activemq` | `activemq-runtime-config` | `6.1.8` |
| `org.apache.activemq` | `activemq-shiro` | `6.1.8` |
| `org.apache.activemq` | `activemq-spring` | `6.1.8` |
| `org.apache.activemq` | `activemq-stomp` | `6.1.8` |
| `org.apache.activemq` | `activemq-web` | `6.1.8` |
| `org.apache.activemq` | `activemq-web-console` | `6.1.8` |
| `org.apache.activemq` | `activemq-web-demo` | `6.1.8` |
| `org.apache.activemq` | `artemis-amqp-protocol` | `2.43.0` |
| `org.apache.activemq` | `artemis-boot` | `2.43.0` |
| `org.apache.activemq` | `artemis-cdi-client` | `2.43.0` |
| `org.apache.activemq` | `artemis-cli` | `2.43.0` |
| `org.apache.activemq` | `artemis-commons` | `2.43.0` |
| `org.apache.activemq` | `artemis-console` | `2.43.0` |
| `org.apache.activemq` | `artemis-core-client` | `2.43.0` |
| `org.apache.activemq` | `artemis-core-client-all` | `2.43.0` |
| `org.apache.activemq` | `artemis-core-client-osgi` | `2.43.0` |
| `org.apache.activemq` | `artemis-dto` | `2.43.0` |
| `org.apache.activemq` | `artemis-features` | `2.43.0` |
| `org.apache.activemq` | `artemis-hornetq-protocol` | `2.43.0` |
| `org.apache.activemq` | `artemis-hqclient-protocol` | `2.43.0` |
| `org.apache.activemq` | `artemis-jakarta-cdi-client` | `2.43.0` |
| `org.apache.activemq` | `artemis-jakarta-client` | `2.43.0` |
| `org.apache.activemq` | `artemis-jakarta-client-all` | `2.43.0` |
| `org.apache.activemq` | `artemis-jakarta-openwire-protocol` | `2.43.0` |
| `org.apache.activemq` | `artemis-jakarta-ra` | `2.43.0` |
| `org.apache.activemq` | `artemis-jakarta-server` | `2.43.0` |
| `org.apache.activemq` | `artemis-jakarta-service-extensions` | `2.43.0` |
| `org.apache.activemq` | `artemis-jdbc-store` | `2.43.0` |
| `org.apache.activemq` | `artemis-jms-client` | `2.43.0` |
| `org.apache.activemq` | `artemis-jms-client-all` | `2.43.0` |
| `org.apache.activemq` | `artemis-jms-client-osgi` | `2.43.0` |
| `org.apache.activemq` | `artemis-jms-server` | `2.43.0` |
| `org.apache.activemq` | `artemis-journal` | `2.43.0` |
| `org.apache.activemq` | `artemis-lockmanager-api` | `2.43.0` |
| `org.apache.activemq` | `artemis-lockmanager-ri` | `2.43.0` |
| `org.apache.activemq` | `artemis-mqtt-protocol` | `2.43.0` |
| `org.apache.activemq` | `artemis-openwire-protocol` | `2.43.0` |
| `org.apache.activemq` | `artemis-ra` | `2.43.0` |
| `org.apache.activemq` | `artemis-selector` | `2.43.0` |
| `org.apache.activemq` | `artemis-server` | `2.43.0` |
| `org.apache.activemq` | `artemis-server-osgi` | `2.43.0` |
| `org.apache.activemq` | `artemis-service-extensions` | `2.43.0` |
| `org.apache.activemq` | `artemis-stomp-protocol` | `2.43.0` |
| `org.apache.activemq` | `artemis-web` | `2.43.0` |
| `org.apache.activemq` | `artemis-website` | `2.43.0` |
| `org.apache.cassandra` | `java-driver-core` | `4.19.2` |
| `org.apache.cassandra` | `java-driver-core-shaded` | `4.19.2` |
| `org.apache.cassandra` | `java-driver-guava-shaded` | `4.19.2` |
| `org.apache.cassandra` | `java-driver-mapper-processor` | `4.19.2` |
| `org.apache.cassandra` | `java-driver-mapper-runtime` | `4.19.2` |
| `org.apache.cassandra` | `java-driver-metrics-micrometer` | `4.19.2` |
| `org.apache.cassandra` | `java-driver-metrics-microprofile` | `4.19.2` |
| `org.apache.cassandra` | `java-driver-query-builder` | `4.19.2` |
| `org.apache.cassandra` | `java-driver-test-infra` | `4.19.2` |
| `org.apache.commons` | `commons-dbcp2` | `2.13.0` |
| `org.apache.commons` | `commons-lang3` | `3.19.0` |
| `org.apache.commons` | `commons-pool2` | `2.12.1` |
| `org.apache.derby` | `derby` | `10.16.1.1` |
| `org.apache.derby` | `derbyclient` | `10.16.1.1` |
| `org.apache.derby` | `derbynet` | `10.16.1.1` |
| `org.apache.derby` | `derbyoptionaltools` | `10.16.1.1` |
| `org.apache.derby` | `derbyshared` | `10.16.1.1` |
| `org.apache.derby` | `derbytools` | `10.16.1.1` |
| `org.apache.groovy` | `groovy` | `5.0.2` |
| `org.apache.groovy` | `groovy-ant` | `5.0.2` |
| `org.apache.groovy` | `groovy-astbuilder` | `5.0.2` |
| `org.apache.groovy` | `groovy-cli-commons` | `5.0.2` |
| `org.apache.groovy` | `groovy-cli-picocli` | `5.0.2` |
| `org.apache.groovy` | `groovy-console` | `5.0.2` |
| `org.apache.groovy` | `groovy-contracts` | `5.0.2` |
| `org.apache.groovy` | `groovy-datetime` | `5.0.2` |
| `org.apache.groovy` | `groovy-dateutil` | `5.0.2` |
| `org.apache.groovy` | `groovy-docgenerator` | `5.0.2` |
| `org.apache.groovy` | `groovy-ginq` | `5.0.2` |
| `org.apache.groovy` | `groovy-groovydoc` | `5.0.2` |
| `org.apache.groovy` | `groovy-groovysh` | `5.0.2` |
| `org.apache.groovy` | `groovy-jmx` | `5.0.2` |
| `org.apache.groovy` | `groovy-json` | `5.0.2` |
| `org.apache.groovy` | `groovy-jsr223` | `5.0.2` |
| `org.apache.groovy` | `groovy-macro` | `5.0.2` |
| `org.apache.groovy` | `groovy-macro-library` | `5.0.2` |
| `org.apache.groovy` | `groovy-nio` | `5.0.2` |
| `org.apache.groovy` | `groovy-servlet` | `5.0.2` |
| `org.apache.groovy` | `groovy-sql` | `5.0.2` |
| `org.apache.groovy` | `groovy-swing` | `5.0.2` |
| `org.apache.groovy` | `groovy-templates` | `5.0.2` |
| `org.apache.groovy` | `groovy-test` | `5.0.2` |
| `org.apache.groovy` | `groovy-test-junit5` | `5.0.2` |
| `org.apache.groovy` | `groovy-testng` | `5.0.2` |
| `org.apache.groovy` | `groovy-toml` | `5.0.2` |
| `org.apache.groovy` | `groovy-typecheckers` | `5.0.2` |
| `org.apache.groovy` | `groovy-xml` | `5.0.2` |
| `org.apache.groovy` | `groovy-yaml` | `5.0.2` |
| `org.apache.httpcomponents` | `httpasyncclient` | `4.1.5` |
| `org.apache.httpcomponents` | `httpcore` | `4.4.16` |
| `org.apache.httpcomponents` | `httpcore-nio` | `4.4.16` |
| `org.apache.httpcomponents.client5` | `httpclient5` | `5.5.1` |
| `org.apache.httpcomponents.client5` | `httpclient5-cache` | `5.5.1` |
| `org.apache.httpcomponents.client5` | `httpclient5-fluent` | `5.5.1` |
| `org.apache.httpcomponents.core5` | `httpcore5` | `5.3.6` |
| `org.apache.httpcomponents.core5` | `httpcore5-h2` | `5.3.6` |
| `org.apache.httpcomponents.core5` | `httpcore5-reactive` | `5.3.6` |
| `org.apache.kafka` | `connect` | `4.1.1` |
| `org.apache.kafka` | `connect-api` | `4.1.1` |
| `org.apache.kafka` | `connect-basic-auth-extension` | `4.1.1` |
| `org.apache.kafka` | `connect-file` | `4.1.1` |
| `org.apache.kafka` | `connect-json` | `4.1.1` |
| `org.apache.kafka` | `connect-mirror` | `4.1.1` |
| `org.apache.kafka` | `connect-mirror-client` | `4.1.1` |
| `org.apache.kafka` | `connect-runtime` | `4.1.1` |
| `org.apache.kafka` | `connect-transforms` | `4.1.1` |
| `org.apache.kafka` | `generator` | `4.1.1` |
| `org.apache.kafka` | `kafka-clients` | `4.1.1` |
| `org.apache.kafka` | `kafka-metadata` | `4.1.1` |
| `org.apache.kafka` | `kafka-raft` | `4.1.1` |
| `org.apache.kafka` | `kafka-server` | `4.1.1` |
| `org.apache.kafka` | `kafka-server-common` | `4.1.1` |
| `org.apache.kafka` | `kafka-shell` | `4.1.1` |
| `org.apache.kafka` | `kafka-storage` | `4.1.1` |
| `org.apache.kafka` | `kafka-storage-api` | `4.1.1` |
| `org.apache.kafka` | `kafka-streams` | `4.1.1` |
| `org.apache.kafka` | `kafka-streams-scala_2.13` | `4.1.1` |
| `org.apache.kafka` | `kafka-streams-test-utils` | `4.1.1` |
| `org.apache.kafka` | `kafka-tools` | `4.1.1` |
| `org.apache.kafka` | `kafka_2.13` | `4.1.1` |
| `org.apache.kafka` | `trogdor` | `4.1.1` |
| `org.apache.logging.log4j` | `log4j-1.2-api` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-api` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-api-test` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-appserver` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-cassandra` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-core` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-core-test` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-couchdb` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-docker` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-flume-ng` | `2.23.1` |
| `org.apache.logging.log4j` | `log4j-iostreams` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-jakarta-jms` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-jakarta-smtp` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-jakarta-web` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-jcl` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-jpa` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-jpl` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-jul` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-layout-template-json` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-mongodb` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-mongodb4` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-slf4j-impl` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-slf4j2-impl` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-spring-boot` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-spring-cloud-config-client` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-taglib` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-to-jul` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-to-slf4j` | `2.25.2` |
| `org.apache.logging.log4j` | `log4j-web` | `2.25.2` |
| `org.apache.pulsar` | `pulsar-client` | `4.1.1` |
| `org.apache.pulsar` | `pulsar-client-api` | `4.1.1` |
| `org.apache.tomcat` | `tomcat-annotations-api` | `11.0.14` |
| `org.apache.tomcat` | `tomcat-jdbc` | `11.0.14` |
| `org.apache.tomcat` | `tomcat-jsp-api` | `11.0.14` |
| `org.apache.tomcat.embed` | `tomcat-embed-core` | `11.0.14` |
| `org.apache.tomcat.embed` | `tomcat-embed-el` | `11.0.14` |
| `org.apache.tomcat.embed` | `tomcat-embed-jasper` | `11.0.14` |
| `org.apache.tomcat.embed` | `tomcat-embed-websocket` | `11.0.14` |
| `org.aspectj` | `aspectjrt` | `1.9.25` |
| `org.aspectj` | `aspectjtools` | `1.9.25` |
| `org.aspectj` | `aspectjweaver` | `1.9.25` |
| `org.assertj` | `assertj-core` | `3.27.6` |
| `org.assertj` | `assertj-guava` | `3.27.6` |
| `org.awaitility` | `awaitility` | `4.3.0` |
| `org.awaitility` | `awaitility-groovy` | `4.3.0` |
| `org.awaitility` | `awaitility-kotlin` | `4.3.0` |
| `org.awaitility` | `awaitility-scala` | `4.3.0` |
| `org.cache2k` | `cache2k-api` | `2.6.1.Final` |
| `org.cache2k` | `cache2k-config` | `2.6.1.Final` |
| `org.cache2k` | `cache2k-core` | `2.6.1.Final` |
| `org.cache2k` | `cache2k-jcache` | `2.6.1.Final` |
| `org.cache2k` | `cache2k-micrometer` | `2.6.1.Final` |
| `org.cache2k` | `cache2k-spring` | `2.6.1.Final` |
| `org.codehaus.janino` | `commons-compiler` | `3.1.12` |
| `org.codehaus.janino` | `commons-compiler-jdk` | `3.1.12` |
| `org.codehaus.janino` | `janino` | `3.1.12` |
| `org.crac` | `crac` | `1.5.0` |
| `org.eclipse` | `yasson` | `3.0.4` |
| `org.eclipse.angus` | `angus-core` | `2.0.5` |
| `org.eclipse.angus` | `angus-mail` | `2.0.5` |
| `org.eclipse.angus` | `dsn` | `2.0.5` |
| `org.eclipse.angus` | `gimap` | `2.0.5` |
| `org.eclipse.angus` | `imap` | `2.0.5` |
| `org.eclipse.angus` | `jakarta.mail` | `2.0.5` |
| `org.eclipse.angus` | `logging-mailhandler` | `2.0.5` |
| `org.eclipse.angus` | `pop3` | `2.0.5` |
| `org.eclipse.angus` | `smtp` | `2.0.5` |
| `org.eclipse.jetty` | `jetty-alpn-client` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-alpn-conscrypt-client` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-alpn-conscrypt-server` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-alpn-java-client` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-alpn-java-server` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-alpn-server` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-client` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-coreapp` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-deploy` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-ethereum` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-http` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-http-spi` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-http-tools` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-io` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-jmx` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-jndi` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-keystore` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-openid` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-osgi` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-plus` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-proxy` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-reactive-httpclient` | `4.1.4` |
| `org.eclipse.jetty` | `jetty-rewrite` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-security` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-server` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-session` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-slf4j-impl` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-start` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-staticapp` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-unixdomain-server` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-util` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-util-ajax` | `12.1.4` |
| `org.eclipse.jetty` | `jetty-xml` | `12.1.4` |
| `org.flywaydb` | `flyway-core` | `11.8.2` |
| `org.flywaydb` | `flyway-database-mongodb` | `11.8.2` |
| `org.flywaydb` | `flyway-database-postgresql` | `11.8.2` |
| `org.flywaydb` | `flyway-mysql` | `11.8.2` |
| `org.flywaydb` | `flyway-sqlserver` | `11.8.2` |
| `org.glassfish.jersey.containers` | `jersey-container-servlet` | `3.1.11` |
| `org.glassfish.jersey.containers` | `jersey-container-servlet-core` | `3.1.11` |
| `org.glassfish.jersey.core` | `jersey-client` | `3.1.11` |
| `org.glassfish.jersey.core` | `jersey-common` | `3.1.11` |
| `org.glassfish.jersey.core` | `jersey-server` | `3.1.11` |
| `org.glassfish.jersey.ext` | `jersey-bean-validation` | `3.1.11` |
| `org.glassfish.jersey.ext` | `jersey-spring6` | `3.1.11` |
| `org.glassfish.jersey.inject` | `jersey-hk2` | `3.1.11` |
| `org.glassfish.jersey.media` | `jersey-media-json-jackson` | `3.1.11` |
| `org.hamcrest` | `hamcrest` | `3.0` |
| `org.hamcrest` | `hamcrest-core` | `3.0` |
| `org.hamcrest` | `hamcrest-library` | `3.0` |
| `org.hibernate.orm` | `hibernate-agroal` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-ant` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-c3p0` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-community-dialects` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-core` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-envers` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-graalvm` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-hikaricp` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-jcache` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-jpamodelgen` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-micrometer` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-processor` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-proxool` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-spatial` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-testing` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-vector` | `7.0.0` |
| `org.hibernate.orm` | `hibernate-vibur` | `7.0.0` |
| `org.hibernate.validator` | `hibernate-validator` | `9.0.0` |
| `org.hibernate.validator` | `hibernate-validator-annotation-processor` | `9.0.0` |
| `org.hibernate.validator` | `hibernate-validator-cdi` | `9.0.0` |
| `org.hsqldb` | `hsqldb` | `2.7.4` |
| `org.jooq` | `jooq` | `3.20.4` |
| `org.jooq` | `jooq-codegen` | `3.20.4` |
| `org.jooq` | `jooq-kotlin` | `3.20.4` |
| `org.jooq` | `jooq-meta` | `3.20.4` |
| `org.junit.jupiter` | `junit-jupiter` | `5.12.2` |
| `org.junit.jupiter` | `junit-jupiter-api` | `5.12.2` |
| `org.junit.jupiter` | `junit-jupiter-engine` | `5.12.2` |
| `org.junit.jupiter` | `junit-jupiter-migrationsupport` | `5.12.2` |
| `org.junit.jupiter` | `junit-jupiter-params` | `5.12.2` |
| `org.junit.platform` | `junit-platform-commons` | `1.12.2` |
| `org.junit.platform` | `junit-platform-console` | `1.12.2` |
| `org.junit.platform` | `junit-platform-engine` | `1.12.2` |
| `org.junit.platform` | `junit-platform-jfr` | `1.12.2` |
| `org.junit.platform` | `junit-platform-launcher` | `1.12.2` |
| `org.junit.platform` | `junit-platform-reporting` | `1.12.2` |
| `org.junit.platform` | `junit-platform-runner` | `1.12.2` |
| `org.junit.platform` | `junit-platform-suite` | `1.12.2` |
| `org.junit.platform` | `junit-platform-suite-api` | `1.12.2` |
| `org.junit.platform` | `junit-platform-suite-commons` | `1.12.2` |
| `org.junit.platform` | `junit-platform-suite-engine` | `1.12.2` |
| `org.junit.platform` | `junit-platform-testkit` | `1.12.2` |
| `org.junit.vintage` | `junit-vintage-engine` | `5.12.2` |
| `org.liquibase` | `liquibase-cdi` | `4.32.0` |
| `org.liquibase` | `liquibase-cdi-jakarta` | `4.32.0` |
| `org.liquibase` | `liquibase-core` | `4.32.0` |
| `org.mariadb.jdbc` | `mariadb-java-client` | `3.5.3` |
| `org.mockito` | `mockito-android` | `5.18.0` |
| `org.mockito` | `mockito-bom` | `5.18.0` |
| `org.mockito` | `mockito-core` | `5.18.0` |
| `org.mockito` | `mockito-errorprone` | `5.18.0` |
| `org.mockito` | `mockito-junit-jupiter` | `5.18.0` |
| `org.mockito` | `mockito-proxy` | `5.18.0` |
| `org.mockito` | `mockito-subclass` | `5.18.0` |
| `org.mongodb` | `bson` | `5.5.0` |
| `org.mongodb` | `bson-record-codec` | `5.5.0` |
| `org.mongodb` | `mongodb-driver-core` | `5.5.0` |
| `org.mongodb` | `mongodb-driver-reactivestreams` | `5.5.0` |
| `org.mongodb` | `mongodb-driver-sync` | `5.5.0` |
| `org.neo4j.driver` | `neo4j-java-driver` | `5.30.0` |
| `org.postgresql` | `postgresql` | `42.7.7` |
| `org.quartz-scheduler` | `quartz` | `2.5.0` |
| `org.quartz-scheduler` | `quartz-jobs` | `2.5.0` |
| `org.reactivestreams` | `reactive-streams` | `1.0.4` |
| `org.seleniumhq.selenium` | `htmlunit-driver` | `4.28.1` |
| `org.seleniumhq.selenium` | `selenium-api` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-chrome-driver` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-chromium-driver` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-devtools-v131` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-devtools-v132` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-devtools-v133` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-devtools-v85` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-edge-driver` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-firefox-driver` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-grid` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-http` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-ie-driver` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-java` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-json` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-manager` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-remote-driver` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-safari-driver` | `4.32.0` |
| `org.seleniumhq.selenium` | `selenium-support` | `4.32.0` |
| `org.skyscreamer` | `jsonassert` | `1.5.3` |
| `org.slf4j` | `jcl-over-slf4j` | `2.0.17` |
| `org.slf4j` | `jul-to-slf4j` | `2.0.17` |
| `org.slf4j` | `log4j-over-slf4j` | `2.0.17` |
| `org.slf4j` | `slf4j-api` | `2.0.17` |
| `org.slf4j` | `slf4j-ext` | `2.0.17` |
| `org.slf4j` | `slf4j-jdk-platform-logging` | `2.0.17` |
| `org.slf4j` | `slf4j-jdk14` | `2.0.17` |
| `org.slf4j` | `slf4j-log4j12` | `2.0.17` |
| `org.slf4j` | `slf4j-nop` | `2.0.17` |
| `org.slf4j` | `slf4j-reload4j` | `2.0.17` |
| `org.slf4j` | `slf4j-simple` | `2.0.17` |
| `org.springframework` | `spring-aop` | `7.0.0` |
| `org.springframework` | `spring-aspects` | `7.0.0` |
| `org.springframework` | `spring-beans` | `7.0.0` |
| `org.springframework` | `spring-context` | `7.0.0` |
| `org.springframework` | `spring-context-indexer` | `7.0.0` |
| `org.springframework` | `spring-context-support` | `7.0.0` |
| `org.springframework` | `spring-core` | `7.0.0` |
| `org.springframework` | `spring-core-test` | `7.0.0` |
| `org.springframework` | `spring-expression` | `7.0.0` |
| `org.springframework` | `spring-instrument` | `7.0.0` |
| `org.springframework` | `spring-jcl` | `7.0.0` |
| `org.springframework` | `spring-jdbc` | `7.0.0` |
| `org.springframework` | `spring-jms` | `7.0.0` |
| `org.springframework` | `spring-messaging` | `7.0.0` |
| `org.springframework` | `spring-orm` | `7.0.0` |
| `org.springframework` | `spring-oxm` | `7.0.0` |
| `org.springframework` | `spring-r2dbc` | `7.0.0` |
| `org.springframework` | `spring-test` | `7.0.0` |
| `org.springframework` | `spring-tx` | `7.0.0` |
| `org.springframework` | `spring-web` | `7.0.0` |
| `org.springframework` | `spring-webflux` | `7.0.0` |
| `org.springframework` | `spring-webmvc` | `7.0.0` |
| `org.springframework` | `spring-websocket` | `7.0.0` |
| `org.springframework.amqp` | `spring-amqp` | `3.3.1` |
| `org.springframework.amqp` | `spring-rabbit` | `3.3.1` |
| `org.springframework.amqp` | `spring-rabbit-junit` | `3.3.1` |
| `org.springframework.amqp` | `spring-rabbit-stream` | `3.3.1` |
| `org.springframework.amqp` | `spring-rabbit-test` | `3.3.1` |
| `org.springframework.batch` | `spring-batch-core` | `6.0.0` |
| `org.springframework.batch` | `spring-batch-infrastructure` | `6.0.0` |
| `org.springframework.batch` | `spring-batch-integration` | `6.0.0` |
| `org.springframework.batch` | `spring-batch-test` | `6.0.0` |
| `org.springframework.data` | `spring-data-cassandra` | `5.0.0` |
| `org.springframework.data` | `spring-data-commons` | `4.0.0` |
| `org.springframework.data` | `spring-data-couchbase` | `6.0.0` |
| `org.springframework.data` | `spring-data-elasticsearch` | `6.0.0` |
| `org.springframework.data` | `spring-data-jdbc` | `4.0.0` |
| `org.springframework.data` | `spring-data-jpa` | `4.0.0` |
| `org.springframework.data` | `spring-data-keyvalue` | `4.0.0` |
| `org.springframework.data` | `spring-data-ldap` | `4.0.0` |
| `org.springframework.data` | `spring-data-mongodb` | `5.0.0` |
| `org.springframework.data` | `spring-data-neo4j` | `8.0.0` |
| `org.springframework.data` | `spring-data-r2dbc` | `4.0.0` |
| `org.springframework.data` | `spring-data-redis` | `4.0.0` |
| `org.springframework.data` | `spring-data-relational` | `4.0.0` |
| `org.springframework.data` | `spring-data-rest-core` | `5.0.0` |
| `org.springframework.data` | `spring-data-rest-hal-browser` | `5.0.0` |
| `org.springframework.data` | `spring-data-rest-hal-explorer` | `5.0.0` |
| `org.springframework.data` | `spring-data-rest-webmvc` | `5.0.0` |
| `org.springframework.graphql` | `spring-graphql` | `2.0.0` |
| `org.springframework.graphql` | `spring-graphql-test` | `2.0.0` |
| `org.springframework.hateoas` | `spring-hateoas` | `3.0.0` |
| `org.springframework.integration` | `spring-integration-amqp` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-cassandra` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-core` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-debezium` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-event` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-feed` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-file` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-ftp` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-graphql` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-groovy` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-hazelcast` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-http` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-ip` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-jdbc` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-jms` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-jmx` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-jpa` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-kafka` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-mail` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-mongodb` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-mqtt` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-r2dbc` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-redis` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-rsocket` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-scripting` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-sftp` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-smb` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-stomp` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-stream` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-syslog` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-test` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-test-support` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-webflux` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-websocket` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-ws` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-xml` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-xmpp` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-zeromq` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-zip` | `7.0.0` |
| `org.springframework.integration` | `spring-integration-zookeeper` | `7.0.0` |
| `org.springframework.kafka` | `spring-kafka` | `4.0.0` |
| `org.springframework.kafka` | `spring-kafka-test` | `4.0.0` |
| `org.springframework.ldap` | `spring-ldap-core` | `3.3.0` |
| `org.springframework.ldap` | `spring-ldap-ldif-core` | `3.3.0` |
| `org.springframework.ldap` | `spring-ldap-odm` | `3.3.0` |
| `org.springframework.ldap` | `spring-ldap-test` | `3.3.0` |
| `org.springframework.pulsar` | `spring-pulsar` | `1.3.0` |
| `org.springframework.pulsar` | `spring-pulsar-cache-provider` | `1.3.0` |
| `org.springframework.pulsar` | `spring-pulsar-cache-provider-caffeine` | `1.3.0` |
| `org.springframework.pulsar` | `spring-pulsar-reactive` | `1.3.0` |
| `org.springframework.restdocs` | `spring-restdocs-asciidoctor` | `3.1.0` |
| `org.springframework.restdocs` | `spring-restdocs-core` | `3.1.0` |
| `org.springframework.restdocs` | `spring-restdocs-mockmvc` | `3.1.0` |
| `org.springframework.restdocs` | `spring-restdocs-restassured` | `3.1.0` |
| `org.springframework.restdocs` | `spring-restdocs-webtestclient` | `3.1.0` |
| `org.springframework.retry` | `spring-retry` | `2.1.0` |
| `org.springframework.security` | `spring-security-acl` | `7.0.0` |
| `org.springframework.security` | `spring-security-aspects` | `7.0.0` |
| `org.springframework.security` | `spring-security-cas` | `7.0.0` |
| `org.springframework.security` | `spring-security-config` | `7.0.0` |
| `org.springframework.security` | `spring-security-core` | `7.0.0` |
| `org.springframework.security` | `spring-security-crypto` | `7.0.0` |
| `org.springframework.security` | `spring-security-data` | `7.0.0` |
| `org.springframework.security` | `spring-security-ldap` | `7.0.0` |
| `org.springframework.security` | `spring-security-messaging` | `7.0.0` |
| `org.springframework.security` | `spring-security-oauth2-authorization-server` | `2.0.0` |
| `org.springframework.security` | `spring-security-oauth2-client` | `7.0.0` |
| `org.springframework.security` | `spring-security-oauth2-core` | `7.0.0` |
| `org.springframework.security` | `spring-security-oauth2-jose` | `7.0.0` |
| `org.springframework.security` | `spring-security-oauth2-resource-server` | `7.0.0` |
| `org.springframework.security` | `spring-security-one-time-token-core` | `7.0.0` |
| `org.springframework.security` | `spring-security-one-time-token-jdbc` | `7.0.0` |
| `org.springframework.security` | `spring-security-passkeys` | `7.0.0` |
| `org.springframework.security` | `spring-security-rsocket` | `7.0.0` |
| `org.springframework.security` | `spring-security-saml2-service-provider` | `7.0.0` |
| `org.springframework.security` | `spring-security-taglibs` | `7.0.0` |
| `org.springframework.security` | `spring-security-test` | `7.0.0` |
| `org.springframework.security` | `spring-security-web` | `7.0.0` |
| `org.springframework.session` | `spring-session-bom` | `3.5.0` |
| `org.springframework.session` | `spring-session-core` | `3.5.0` |
| `org.springframework.session` | `spring-session-data-redis` | `3.5.0` |
| `org.springframework.session` | `spring-session-hazelcast` | `3.5.0` |
| `org.springframework.session` | `spring-session-jdbc` | `3.5.0` |
| `org.springframework.ws` | `spring-ws-core` | `4.1.0` |
| `org.springframework.ws` | `spring-ws-security` | `4.1.0` |
| `org.springframework.ws` | `spring-ws-support` | `4.1.0` |
| `org.springframework.ws` | `spring-ws-test` | `4.1.0` |
| `org.springframework.ws` | `spring-xml` | `4.1.0` |
| `org.testcontainers` | `activemq` | `1.21.0` |
| `org.testcontainers` | `azure` | `1.21.0` |
| `org.testcontainers` | `cassandra` | `1.21.0` |
| `org.testcontainers` | `chromadb` | `1.21.0` |
| `org.testcontainers` | `clickhouse` | `1.21.0` |
| `org.testcontainers` | `cockroachdb` | `1.21.0` |
| `org.testcontainers` | `consul` | `1.21.0` |
| `org.testcontainers` | `couchbase` | `1.21.0` |
| `org.testcontainers` | `cratedb` | `1.21.0` |
| `org.testcontainers` | `database-commons` | `1.21.0` |
| `org.testcontainers` | `db2` | `1.21.0` |
| `org.testcontainers` | `dynalite` | `1.21.0` |
| `org.testcontainers` | `elasticsearch` | `1.21.0` |
| `org.testcontainers` | `gcloud` | `1.21.0` |
| `org.testcontainers` | `grafana` | `1.21.0` |
| `org.testcontainers` | `hivemq` | `1.21.0` |
| `org.testcontainers` | `httpd` | `1.21.0` |
| `org.testcontainers` | `influxdb` | `1.21.0` |
| `org.testcontainers` | `jdbc` | `1.21.0` |
| `org.testcontainers` | `jdbc-test` | `1.21.0` |
| `org.testcontainers` | `junit-jupiter` | `1.21.0` |
| `org.testcontainers` | `k3s` | `1.21.0` |
| `org.testcontainers` | `k6` | `1.21.0` |
| `org.testcontainers` | `kafka` | `1.21.0` |
| `org.testcontainers` | `localstack` | `1.21.0` |
| `org.testcontainers` | `mariadb` | `1.21.0` |
| `org.testcontainers` | `milvus` | `1.21.0` |
| `org.testcontainers` | `minio` | `1.21.0` |
| `org.testcontainers` | `mockserver` | `1.21.0` |
| `org.testcontainers` | `mongodb` | `1.21.0` |
| `org.testcontainers` | `mssqlserver` | `1.21.0` |
| `org.testcontainers` | `mysql` | `1.21.0` |
| `org.testcontainers` | `neo4j` | `1.21.0` |
| `org.testcontainers` | `nginx` | `1.21.0` |
| `org.testcontainers` | `oceanbase` | `1.21.0` |
| `org.testcontainers` | `ollama` | `1.21.0` |
| `org.testcontainers` | `openfga` | `1.21.0` |
| `org.testcontainers` | `oracle-free` | `1.21.0` |
| `org.testcontainers` | `oracle-xe` | `1.21.0` |
| `org.testcontainers` | `orientdb` | `1.21.0` |
| `org.testcontainers` | `pinecone` | `1.21.0` |
| `org.testcontainers` | `postgresql` | `1.21.0` |
| `org.testcontainers` | `presto` | `1.21.0` |
| `org.testcontainers` | `pulsar` | `1.21.0` |
| `org.testcontainers` | `qdrant` | `1.21.0` |
| `org.testcontainers` | `questdb` | `1.21.0` |
| `org.testcontainers` | `r2dbc` | `1.21.0` |
| `org.testcontainers` | `rabbitmq` | `1.21.0` |
| `org.testcontainers` | `redpanda` | `1.21.0` |
| `org.testcontainers` | `selenium` | `1.21.0` |
| `org.testcontainers` | `solace` | `1.21.0` |
| `org.testcontainers` | `solr` | `1.21.0` |
| `org.testcontainers` | `spock` | `1.21.0` |
| `org.testcontainers` | `testcontainers` | `1.21.0` |
| `org.testcontainers` | `tidb` | `1.21.0` |
| `org.testcontainers` | `toxiproxy` | `1.21.0` |
| `org.testcontainers` | `trino` | `1.21.0` |
| `org.testcontainers` | `vault` | `1.21.0` |
| `org.testcontainers` | `weaviate` | `1.21.0` |
| `org.testcontainers` | `yugabytedb` | `1.21.0` |
| `org.thymeleaf` | `thymeleaf` | `3.2.0.RELEASE` |
| `org.thymeleaf` | `thymeleaf-spring6` | `3.2.0.RELEASE` |
| `org.thymeleaf.extras` | `thymeleaf-extras-springsecurity6` | `3.2.0.RELEASE` |
| `org.xmlunit` | `xmlunit-assertj` | `2.10.0` |
| `org.xmlunit` | `xmlunit-assertj3` | `2.10.0` |
| `org.xmlunit` | `xmlunit-core` | `2.10.0` |
| `org.xmlunit` | `xmlunit-jakarta-jaxb-impl` | `2.10.0` |
| `org.xmlunit` | `xmlunit-legacy` | `2.10.0` |
| `org.xmlunit` | `xmlunit-matchers` | `2.10.0` |
| `org.xmlunit` | `xmlunit-placeholders` | `2.10.0` |
| `org.yaml` | `snakeyaml` | `2.4` |

---

## Dependencies by Group

### `ch.qos.logback`

*All artifacts version: **1.5.21***

- `logback-classic`
- `logback-core`

### `co.elastic.clients`

*All artifacts version: **9.2.1***

- `elasticsearch-java`
- `elasticsearch-rest5-client`

### `com.couchbase.client`

- `java-client`: **3.9.2**

### `com.datastax.oss`

- `native-protocol`: **1.5.2**

### `com.fasterxml`

- `classmate`: **1.7.1**

### `com.fasterxml.jackson.core`

- `jackson-annotations`: **2.20**
- `jackson-core`: **2.20.1**
- `jackson-databind`: **2.20.1**

### `com.fasterxml.jackson.dataformat`

*All artifacts version: **2.20.1***

- `jackson-dataformat-avro`
- `jackson-dataformat-cbor`
- `jackson-dataformat-csv`
- `jackson-dataformat-ion`
- `jackson-dataformat-properties`
- `jackson-dataformat-protobuf`
- `jackson-dataformat-smile`
- `jackson-dataformat-toml`
- `jackson-dataformat-xml`
- `jackson-dataformat-yaml`

### `com.fasterxml.jackson.datatype`

*All artifacts version: **2.20.1***

- `jackson-datatype-eclipse-collections`
- `jackson-datatype-guava`
- `jackson-datatype-hibernate4`
- `jackson-datatype-hibernate5`
- `jackson-datatype-hibernate5-jakarta`
- `jackson-datatype-hibernate6`
- `jackson-datatype-hibernate7`
- `jackson-datatype-hppc`
- `jackson-datatype-jakarta-jsonp`
- `jackson-datatype-javax-money`
- `jackson-datatype-jaxrs`
- `jackson-datatype-jdk8`
- `jackson-datatype-joda`
- `jackson-datatype-joda-money`
- `jackson-datatype-json-org`
- `jackson-datatype-jsr310`
- `jackson-datatype-jsr353`
- `jackson-datatype-moneta`
- `jackson-datatype-pcollections`

### `com.fasterxml.jackson.jakarta.rs`

*All artifacts version: **2.20.1***

- `jackson-jakarta-rs-base`
- `jackson-jakarta-rs-cbor-provider`
- `jackson-jakarta-rs-json-provider`
- `jackson-jakarta-rs-smile-provider`
- `jackson-jakarta-rs-xml-provider`
- `jackson-jakarta-rs-yaml-provider`

### `com.fasterxml.jackson.jaxrs`

*All artifacts version: **2.20.1***

- `jackson-jaxrs-base`
- `jackson-jaxrs-cbor-provider`
- `jackson-jaxrs-json-provider`
- `jackson-jaxrs-smile-provider`
- `jackson-jaxrs-xml-provider`
- `jackson-jaxrs-yaml-provider`

### `com.fasterxml.jackson.jr`

*All artifacts version: **2.20.1***

- `jackson-jr-all`
- `jackson-jr-annotation-support`
- `jackson-jr-extension-javatime`
- `jackson-jr-objects`
- `jackson-jr-retrofit2`
- `jackson-jr-stree`

### `com.fasterxml.jackson.module`

*All artifacts version: **2.20.1***

- `jackson-module-afterburner`
- `jackson-module-android-record`
- `jackson-module-blackbird`
- `jackson-module-guice`
- `jackson-module-guice7`
- `jackson-module-jakarta-xmlbind-annotations`
- `jackson-module-jaxb-annotations`
- `jackson-module-jsonSchema`
- `jackson-module-jsonSchema-jakarta`
- `jackson-module-kotlin`
- `jackson-module-mrbean`
- `jackson-module-no-ctor-deser`
- `jackson-module-osgi`
- `jackson-module-parameter-names`
- `jackson-module-paranamer`
- `jackson-module-scala_2.11`
- `jackson-module-scala_2.12`
- `jackson-module-scala_2.13`
- `jackson-module-scala_3`

### `com.github.ben-manes.caffeine`

*All artifacts version: **3.2.3***

- `caffeine`
- `guava`
- `jcache`
- `simulator`

### `com.github.mxab.thymeleaf.extras`

- `thymeleaf-extras-data-attribute`: **2.0.1**

### `com.google.code.gson`

- `gson`: **2.13.2**

### `com.graphql-java`

- `graphql-java`: **25.0**

### `com.h2database`

- `h2`: **2.4.240**

### `com.hazelcast`

*All artifacts version: **5.5.0***

- `hazelcast`
- `hazelcast-spring`

### `com.ibm.db2`

- `jcc`: **12.1.3.0**

### `com.jayway.jsonpath`

*All artifacts version: **2.9.0***

- `json-path`
- `json-path-assert`

### `com.microsoft.sqlserver`

- `mssql-jdbc`: **13.2.1.jre11**

### `com.mysql`

- `mysql-connector-j`: **9.5.0**

### `com.oracle.database.ha`

*All artifacts version: **23.9.0.25.07***

- `ons`
- `simplefan`

### `com.oracle.database.jdbc`

*All artifacts version: **23.9.0.25.07***

- `ojdbc11`
- `ojdbc11-production`
- `ojdbc17`
- `ojdbc17-production`
- `ojdbc8`
- `ojdbc8-production`
- `rsi`
- `ucp`
- `ucp11`
- `ucp17`

### `com.oracle.database.nls`

- `orai18n`: **23.9.0.25.07**

### `com.oracle.database.r2dbc`

- `oracle-r2dbc`: **1.3.0**

### `com.oracle.database.security`

- `oraclepki`: **23.9.0.25.07**

### `com.oracle.database.xml`

*All artifacts version: **23.9.0.25.07***

- `xdb`
- `xmlparserv2`

### `com.querydsl`

*All artifacts version: **5.1.0***

- `codegen-utils`
- `querydsl-apt`
- `querydsl-codegen`
- `querydsl-collections`
- `querydsl-core`
- `querydsl-guava`
- `querydsl-hibernate-search`
- `querydsl-jdo`
- `querydsl-jpa`
- `querydsl-jpa-codegen`
- `querydsl-kotlin`
- `querydsl-kotlin-codegen`
- `querydsl-lucene3`
- `querydsl-lucene4`
- `querydsl-lucene5`
- `querydsl-mongodb`
- `querydsl-scala`
- `querydsl-spatial`
- `querydsl-sql`
- `querydsl-sql-codegen`
- `querydsl-sql-spatial`
- `querydsl-sql-spring`

### `com.rabbitmq`

- `amqp-client`: **5.27.1**
- `stream-client`: **0.23.0**

### `com.redis`

- `testcontainers-redis`: **2.2.4**

### `com.samskivert`

- `jmustache`: **1.16**

### `com.sendgrid`

- `sendgrid-java`: **4.10.3**

### `com.sun.xml.bind`

*All artifacts version: **4.0.6***

- `jaxb-core`
- `jaxb-impl`
- `jaxb-jxc`
- `jaxb-osgi`
- `jaxb-xjc`

### `com.sun.xml.messaging.saaj`

- `saaj-impl`: **3.0.4**

### `com.unboundid`

- `unboundid-ldapsdk`: **7.0.3**

### `com.zaxxer`

- `HikariCP`: **7.0.2**

### `commons-codec`

- `commons-codec`: **1.19.0**

### `commons-logging`

- `commons-logging`: **1.3.5**

### `commons-pool`

- `commons-pool`: **1.6**

### `io.asyncer`

- `r2dbc-mysql`: **1.4.1**

### `io.lettuce`

- `lettuce-core`: **6.8.1.RELEASE**

### `io.micrometer`

- `context-propagation`: **1.2.0**
- `docs`: **1.6.0**
- `micrometer-commons`: **1.16.0**
- `micrometer-core`: **1.16.0**
- `micrometer-jakarta9`: **1.16.0**
- `micrometer-java11`: **1.16.0**
- `micrometer-java21`: **1.16.0**
- `micrometer-jetty11`: **1.16.0**
- `micrometer-jetty12`: **1.16.0**
- `micrometer-observation`: **1.16.0**
- `micrometer-observation-test`: **1.16.0**
- `micrometer-registry-appoptics`: **1.16.0**
- `micrometer-registry-atlas`: **1.16.0**
- `micrometer-registry-azure-monitor`: **1.16.0**
- `micrometer-registry-cloudwatch2`: **1.16.0**
- `micrometer-registry-datadog`: **1.16.0**
- `micrometer-registry-dynatrace`: **1.16.0**
- `micrometer-registry-elastic`: **1.16.0**
- `micrometer-registry-ganglia`: **1.16.0**
- `micrometer-registry-graphite`: **1.16.0**
- `micrometer-registry-health`: **1.16.0**
- `micrometer-registry-humio`: **1.16.0**
- `micrometer-registry-influx`: **1.16.0**
- `micrometer-registry-jmx`: **1.16.0**
- `micrometer-registry-kairos`: **1.16.0**
- `micrometer-registry-new-relic`: **1.16.0**
- `micrometer-registry-opentsdb`: **1.16.0**
- `micrometer-registry-otlp`: **1.16.0**
- `micrometer-registry-prometheus`: **1.16.0**
- `micrometer-registry-prometheus-simpleclient`: **1.16.0**
- `micrometer-registry-signalfx`: **1.16.0**
- `micrometer-registry-stackdriver`: **1.16.0**
- `micrometer-registry-statsd`: **1.16.0**
- `micrometer-registry-wavefront`: **1.16.0**
- `micrometer-test`: **1.16.0**
- `micrometer-tracing`: **1.6.0**
- `micrometer-tracing-bridge-brave`: **1.6.0**
- `micrometer-tracing-bridge-otel`: **1.6.0**
- `micrometer-tracing-integration-test`: **1.6.0**
- `micrometer-tracing-reporter-wavefront`: **1.6.0**
- `micrometer-tracing-test`: **1.6.0**

### `io.netty`

- `netty-all`: **4.2.7.Final**
- `netty-buffer`: **4.2.7.Final**
- `netty-codec`: **4.2.7.Final**
- `netty-codec-base`: **4.2.7.Final**
- `netty-codec-classes-quic`: **4.2.7.Final**
- `netty-codec-compression`: **4.2.7.Final**
- `netty-codec-dns`: **4.2.7.Final**
- `netty-codec-haproxy`: **4.2.7.Final**
- `netty-codec-http`: **4.2.7.Final**
- `netty-codec-http2`: **4.2.7.Final**
- `netty-codec-http3`: **4.2.7.Final**
- `netty-codec-marshalling`: **4.2.7.Final**
- `netty-codec-memcache`: **4.2.7.Final**
- `netty-codec-mqtt`: **4.2.7.Final**
- `netty-codec-native-quic`: **4.2.7.Final**
- `netty-codec-protobuf`: **4.2.7.Final**
- `netty-codec-redis`: **4.2.7.Final**
- `netty-codec-smtp`: **4.2.7.Final**
- `netty-codec-socks`: **4.2.7.Final**
- `netty-codec-stomp`: **4.2.7.Final**
- `netty-codec-xml`: **4.2.7.Final**
- `netty-common`: **4.2.7.Final**
- `netty-dev-tools`: **4.2.7.Final**
- `netty-handler`: **4.2.7.Final**
- `netty-handler-proxy`: **4.2.7.Final**
- `netty-handler-ssl-ocsp`: **4.2.7.Final**
- `netty-pkitesting`: **4.2.7.Final**
- `netty-resolver`: **4.2.7.Final**
- `netty-resolver-dns`: **4.2.7.Final**
- `netty-resolver-dns-classes-macos`: **4.2.7.Final**
- `netty-resolver-dns-native-macos`: **4.2.7.Final**
- `netty-tcnative`: **2.0.74.Final**
- `netty-tcnative-boringssl-static`: **2.0.74.Final**
- `netty-tcnative-classes`: **2.0.74.Final**
- `netty-transport`: **4.2.7.Final**
- `netty-transport-classes-epoll`: **4.2.7.Final**
- `netty-transport-classes-io_uring`: **4.2.7.Final**
- `netty-transport-classes-kqueue`: **4.2.7.Final**
- `netty-transport-native-epoll`: **4.2.7.Final**
- `netty-transport-native-io_uring`: **4.2.7.Final**
- `netty-transport-native-kqueue`: **4.2.7.Final**
- `netty-transport-native-unix-common`: **4.2.7.Final**
- `netty-transport-rxtx`: **4.2.7.Final**
- `netty-transport-sctp`: **4.2.7.Final**
- `netty-transport-udt`: **4.2.7.Final**

### `io.opentelemetry`

*All artifacts version: **1.55.0***

- `opentelemetry-api`
- `opentelemetry-common`
- `opentelemetry-context`
- `opentelemetry-exporter-common`
- `opentelemetry-exporter-logging`
- `opentelemetry-exporter-logging-otlp`
- `opentelemetry-exporter-otlp`
- `opentelemetry-exporter-otlp-common`
- `opentelemetry-exporter-sender-grpc-managed-channel`
- `opentelemetry-exporter-sender-jdk`
- `opentelemetry-exporter-sender-okhttp`
- `opentelemetry-exporter-zipkin`
- `opentelemetry-extension-kotlin`
- `opentelemetry-extension-trace-propagators`
- `opentelemetry-opentracing-shim`
- `opentelemetry-sdk`
- `opentelemetry-sdk-common`
- `opentelemetry-sdk-extension-autoconfigure`
- `opentelemetry-sdk-extension-autoconfigure-spi`
- `opentelemetry-sdk-extension-jaeger-remote-sampler`
- `opentelemetry-sdk-logs`
- `opentelemetry-sdk-metrics`
- `opentelemetry-sdk-testing`
- `opentelemetry-sdk-trace`

### `io.projectreactor`

*All artifacts version: **3.8.0***

- `reactor-core`
- `reactor-core-micrometer`
- `reactor-test`
- `reactor-tools`

### `io.projectreactor.addons`

- `reactor-adapter`: **3.6.0**
- `reactor-extra`: **3.6.0**
- `reactor-pool`: **1.2.0**
- `reactor-pool-micrometer`: **1.2.0**

### `io.projectreactor.kotlin`

- `reactor-kotlin-extensions`: **1.3.0**

### `io.projectreactor.netty`

*All artifacts version: **1.3.0***

- `reactor-netty`
- `reactor-netty-core`
- `reactor-netty-http`
- `reactor-netty-http-brave`
- `reactor-netty-quic`

### `io.prometheus`

- `prometheus-metrics-config`: **1.4.3**
- `prometheus-metrics-core`: **1.4.3**
- `prometheus-metrics-exporter-common`: **1.4.3**
- `prometheus-metrics-exporter-httpserver`: **1.4.3**
- `prometheus-metrics-exporter-opentelemetry`: **1.4.3**
- `prometheus-metrics-exporter-opentelemetry-no-otel`: **1.4.3**
- `prometheus-metrics-exporter-opentelemetry-otel-agent-resources`: **1.4.3**
- `prometheus-metrics-exporter-pushgateway`: **1.4.3**
- `prometheus-metrics-exporter-servlet-jakarta`: **1.4.3**
- `prometheus-metrics-exporter-servlet-javax`: **1.4.3**
- `prometheus-metrics-exposition-formats`: **1.4.3**
- `prometheus-metrics-exposition-formats-no-protobuf`: **1.4.3**
- `prometheus-metrics-exposition-textformats`: **1.4.3**
- `prometheus-metrics-instrumentation-caffeine`: **1.4.3**
- `prometheus-metrics-instrumentation-dropwizard`: **1.4.3**
- `prometheus-metrics-instrumentation-dropwizard5`: **1.4.3**
- `prometheus-metrics-instrumentation-guava`: **1.4.3**
- `prometheus-metrics-instrumentation-jvm`: **1.4.3**
- `prometheus-metrics-model`: **1.4.3**
- `prometheus-metrics-simpleclient-bridge`: **1.4.3**
- `prometheus-metrics-tracer`: **1.4.3**
- `prometheus-metrics-tracer-common`: **1.4.3**
- `prometheus-metrics-tracer-initializer`: **1.4.3**
- `prometheus-metrics-tracer-otel`: **1.4.3**
- `prometheus-metrics-tracer-otel-agent`: **1.4.3**
- `simpleclient`: **0.16.0**
- `simpleclient_caffeine`: **0.16.0**
- `simpleclient_common`: **0.16.0**
- `simpleclient_dropwizard`: **0.16.0**
- `simpleclient_graphite_bridge`: **0.16.0**
- `simpleclient_guava`: **0.16.0**
- `simpleclient_hibernate`: **0.16.0**
- `simpleclient_hotspot`: **0.16.0**
- `simpleclient_httpserver`: **0.16.0**
- `simpleclient_jetty`: **0.16.0**
- `simpleclient_jetty_jdk8`: **0.16.0**
- `simpleclient_log4j`: **0.16.0**
- `simpleclient_log4j2`: **0.16.0**
- `simpleclient_logback`: **0.16.0**
- `simpleclient_pushgateway`: **0.16.0**
- `simpleclient_servlet`: **0.16.0**
- `simpleclient_servlet_jakarta`: **0.16.0**
- `simpleclient_spring_boot`: **0.16.0**
- `simpleclient_spring_web`: **0.16.0**
- `simpleclient_tracer_common`: **0.16.0**
- `simpleclient_tracer_otel`: **0.16.0**
- `simpleclient_tracer_otel_agent`: **0.16.0**
- `simpleclient_vertx`: **0.16.0**

### `io.r2dbc`

- `r2dbc-h2`: **1.1.0.RELEASE**
- `r2dbc-mssql`: **1.0.3.RELEASE**
- `r2dbc-pool`: **1.0.2.RELEASE**
- `r2dbc-proxy`: **1.1.6.RELEASE**
- `r2dbc-spi`: **1.0.0.RELEASE**

### `io.reactivex.rxjava3`

- `rxjava`: **3.1.12**

### `io.rsocket`

*All artifacts version: **1.1.5***

- `rsocket-core`
- `rsocket-load-balancer`
- `rsocket-micrometer`
- `rsocket-test`
- `rsocket-transport-local`
- `rsocket-transport-netty`

### `io.spring.gradle`

- `dependency-management-plugin`: **1.1.7**

### `io.zipkin.brave`

*All artifacts version: **6.3.0***

- `brave`
- `brave-context-jfr`
- `brave-context-log4j12`
- `brave-context-log4j2`
- `brave-context-slf4j`
- `brave-instrumentation-dubbo`
- `brave-instrumentation-grpc`
- `brave-instrumentation-http`
- `brave-instrumentation-http-tests`
- `brave-instrumentation-http-tests-jakarta`
- `brave-instrumentation-httpasyncclient`
- `brave-instrumentation-httpclient`
- `brave-instrumentation-httpclient5`
- `brave-instrumentation-jakarta-jms`
- `brave-instrumentation-jaxrs2`
- `brave-instrumentation-jdbi3`
- `brave-instrumentation-jersey-server`
- `brave-instrumentation-jersey-server-jakarta`
- `brave-instrumentation-jms`
- `brave-instrumentation-jms-jakarta`
- `brave-instrumentation-kafka-clients`
- `brave-instrumentation-kafka-streams`
- `brave-instrumentation-messaging`
- `brave-instrumentation-mongodb`
- `brave-instrumentation-mysql`
- `brave-instrumentation-mysql6`
- `brave-instrumentation-mysql8`
- `brave-instrumentation-netty-codec-http`
- `brave-instrumentation-okhttp3`
- `brave-instrumentation-rocketmq-client`
- `brave-instrumentation-rpc`
- `brave-instrumentation-servlet`
- `brave-instrumentation-servlet-jakarta`
- `brave-instrumentation-spring-rabbit`
- `brave-instrumentation-spring-web`
- `brave-instrumentation-spring-webmvc`
- `brave-instrumentation-vertx-web`
- `brave-spring-beans`
- `brave-tests`

### `io.zipkin.reporter2`

*All artifacts version: **3.5.1***

- `zipkin-reporter`
- `zipkin-reporter-brave`
- `zipkin-reporter-metrics-micrometer`
- `zipkin-reporter-spring-beans`
- `zipkin-sender-activemq-client`
- `zipkin-sender-amqp-client`
- `zipkin-sender-kafka`
- `zipkin-sender-libthrift`
- `zipkin-sender-okhttp3`
- `zipkin-sender-pulsar-client`
- `zipkin-sender-urlconnection`

### `jakarta.activation`

- `jakarta.activation-api`: **2.1.4**

### `jakarta.annotation`

- `jakarta.annotation-api`: **3.0.0**

### `jakarta.inject`

- `jakarta.inject-api`: **2.0.1**

### `jakarta.jms`

- `jakarta.jms-api`: **3.1.0**

### `jakarta.json`

- `jakarta.json-api`: **2.1.3**

### `jakarta.json.bind`

- `jakarta.json.bind-api`: **3.0.1**

### `jakarta.mail`

- `jakarta.mail-api`: **2.1.5**

### `jakarta.management.j2ee`

- `jakarta.management.j2ee-api`: **1.1.4**

### `jakarta.persistence`

- `jakarta.persistence-api`: **3.2.0**

### `jakarta.servlet`

- `jakarta.servlet-api`: **6.1.0**

### `jakarta.servlet.jsp.jstl`

- `jakarta.servlet.jsp.jstl-api`: **3.0.2**

### `jakarta.transaction`

- `jakarta.transaction-api`: **2.0.1**

### `jakarta.validation`

- `jakarta.validation-api`: **3.1.1**

### `jakarta.websocket`

*All artifacts version: **2.2.0***

- `jakarta.websocket-api`
- `jakarta.websocket-client-api`

### `jakarta.ws.rs`

- `jakarta.ws.rs-api`: **4.0.0**

### `jakarta.xml.bind`

- `jakarta.xml.bind-api`: **4.0.4**

### `jakarta.xml.soap`

- `jakarta.xml.soap-api`: **3.0.2**

### `jakarta.xml.ws`

- `jakarta.xml.ws-api`: **4.0.2**

### `javax.cache`

- `cache-api`: **1.1.1**

### `javax.money`

- `money-api`: **1.1**

### `jaxen`

- `jaxen`: **2.0.0**

### `junit`

- `junit`: **4.13.2**

### `net.bytebuddy`

*All artifacts version: **1.17.8***

- `byte-buddy`
- `byte-buddy-agent`

### `net.minidev`

- `json-smart`: **2.6.0**

### `net.sourceforge.jtds`

- `jtds`: **1.3.1**

### `net.sourceforge.nekohtml`

- `nekohtml`: **1.9.22**

### `nz.net.ultraq.thymeleaf`

- `thymeleaf-layout-dialect`: **3.4.0**

### `org.apache.activemq`

- `activemq-all`: **6.1.8**
- `activemq-amqp`: **6.1.8**
- `activemq-blueprint`: **6.1.8**
- `activemq-broker`: **6.1.8**
- `activemq-client`: **6.1.8**
- `activemq-console`: **6.1.8**
- `activemq-http`: **6.1.8**
- `activemq-jaas`: **6.1.8**
- `activemq-jdbc-store`: **6.1.8**
- `activemq-jms-pool`: **6.1.8**
- `activemq-kahadb-store`: **6.1.8**
- `activemq-karaf`: **6.1.8**
- `activemq-log4j-appender`: **6.1.8**
- `activemq-mqtt`: **6.1.8**
- `activemq-openwire-generator`: **6.1.8**
- `activemq-openwire-legacy`: **6.1.8**
- `activemq-osgi`: **6.1.8**
- `activemq-pool`: **6.1.8**
- `activemq-ra`: **6.1.8**
- `activemq-rar`: **6.1.8**
- `activemq-run`: **6.1.8**
- `activemq-runtime-config`: **6.1.8**
- `activemq-shiro`: **6.1.8**
- `activemq-spring`: **6.1.8**
- `activemq-stomp`: **6.1.8**
- `activemq-web`: **6.1.8**
- `activemq-web-console`: **6.1.8**
- `activemq-web-demo`: **6.1.8**
- `artemis-amqp-protocol`: **2.43.0**
- `artemis-boot`: **2.43.0**
- `artemis-cdi-client`: **2.43.0**
- `artemis-cli`: **2.43.0**
- `artemis-commons`: **2.43.0**
- `artemis-console`: **2.43.0**
- `artemis-core-client`: **2.43.0**
- `artemis-core-client-all`: **2.43.0**
- `artemis-core-client-osgi`: **2.43.0**
- `artemis-dto`: **2.43.0**
- `artemis-features`: **2.43.0**
- `artemis-hornetq-protocol`: **2.43.0**
- `artemis-hqclient-protocol`: **2.43.0**
- `artemis-jakarta-cdi-client`: **2.43.0**
- `artemis-jakarta-client`: **2.43.0**
- `artemis-jakarta-client-all`: **2.43.0**
- `artemis-jakarta-openwire-protocol`: **2.43.0**
- `artemis-jakarta-ra`: **2.43.0**
- `artemis-jakarta-server`: **2.43.0**
- `artemis-jakarta-service-extensions`: **2.43.0**
- `artemis-jdbc-store`: **2.43.0**
- `artemis-jms-client`: **2.43.0**
- `artemis-jms-client-all`: **2.43.0**
- `artemis-jms-client-osgi`: **2.43.0**
- `artemis-jms-server`: **2.43.0**
- `artemis-journal`: **2.43.0**
- `artemis-lockmanager-api`: **2.43.0**
- `artemis-lockmanager-ri`: **2.43.0**
- `artemis-mqtt-protocol`: **2.43.0**
- `artemis-openwire-protocol`: **2.43.0**
- `artemis-ra`: **2.43.0**
- `artemis-selector`: **2.43.0**
- `artemis-server`: **2.43.0**
- `artemis-server-osgi`: **2.43.0**
- `artemis-service-extensions`: **2.43.0**
- `artemis-stomp-protocol`: **2.43.0**
- `artemis-web`: **2.43.0**
- `artemis-website`: **2.43.0**

### `org.apache.cassandra`

*All artifacts version: **4.19.2***

- `java-driver-core`
- `java-driver-core-shaded`
- `java-driver-guava-shaded`
- `java-driver-mapper-processor`
- `java-driver-mapper-runtime`
- `java-driver-metrics-micrometer`
- `java-driver-metrics-microprofile`
- `java-driver-query-builder`
- `java-driver-test-infra`

### `org.apache.commons`

- `commons-dbcp2`: **2.13.0**
- `commons-lang3`: **3.19.0**
- `commons-pool2`: **2.12.1**

### `org.apache.derby`

*All artifacts version: **10.16.1.1***

- `derby`
- `derbyclient`
- `derbynet`
- `derbyoptionaltools`
- `derbyshared`
- `derbytools`

### `org.apache.groovy`

*All artifacts version: **5.0.2***

- `groovy`
- `groovy-ant`
- `groovy-astbuilder`
- `groovy-cli-commons`
- `groovy-cli-picocli`
- `groovy-console`
- `groovy-contracts`
- `groovy-datetime`
- `groovy-dateutil`
- `groovy-docgenerator`
- `groovy-ginq`
- `groovy-groovydoc`
- `groovy-groovysh`
- `groovy-jmx`
- `groovy-json`
- `groovy-jsr223`
- `groovy-macro`
- `groovy-macro-library`
- `groovy-nio`
- `groovy-servlet`
- `groovy-sql`
- `groovy-swing`
- `groovy-templates`
- `groovy-test`
- `groovy-test-junit5`
- `groovy-testng`
- `groovy-toml`
- `groovy-typecheckers`
- `groovy-xml`
- `groovy-yaml`

### `org.apache.httpcomponents`

- `httpasyncclient`: **4.1.5**
- `httpcore`: **4.4.16**
- `httpcore-nio`: **4.4.16**

### `org.apache.httpcomponents.client5`

*All artifacts version: **5.5.1***

- `httpclient5`
- `httpclient5-cache`
- `httpclient5-fluent`

### `org.apache.httpcomponents.core5`

*All artifacts version: **5.3.6***

- `httpcore5`
- `httpcore5-h2`
- `httpcore5-reactive`

### `org.apache.kafka`

*All artifacts version: **4.1.1***

- `connect`
- `connect-api`
- `connect-basic-auth-extension`
- `connect-file`
- `connect-json`
- `connect-mirror`
- `connect-mirror-client`
- `connect-runtime`
- `connect-transforms`
- `generator`
- `kafka-clients`
- `kafka-metadata`
- `kafka-raft`
- `kafka-server`
- `kafka-server-common`
- `kafka-shell`
- `kafka-storage`
- `kafka-storage-api`
- `kafka-streams`
- `kafka-streams-scala_2.13`
- `kafka-streams-test-utils`
- `kafka-tools`
- `kafka_2.13`
- `trogdor`

### `org.apache.logging.log4j`

- `log4j-1.2-api`: **2.25.2**
- `log4j-api`: **2.25.2**
- `log4j-api-test`: **2.25.2**
- `log4j-appserver`: **2.25.2**
- `log4j-cassandra`: **2.25.2**
- `log4j-core`: **2.25.2**
- `log4j-core-test`: **2.25.2**
- `log4j-couchdb`: **2.25.2**
- `log4j-docker`: **2.25.2**
- `log4j-flume-ng`: **2.23.1**
- `log4j-iostreams`: **2.25.2**
- `log4j-jakarta-jms`: **2.25.2**
- `log4j-jakarta-smtp`: **2.25.2**
- `log4j-jakarta-web`: **2.25.2**
- `log4j-jcl`: **2.25.2**
- `log4j-jpa`: **2.25.2**
- `log4j-jpl`: **2.25.2**
- `log4j-jul`: **2.25.2**
- `log4j-layout-template-json`: **2.25.2**
- `log4j-mongodb`: **2.25.2**
- `log4j-mongodb4`: **2.25.2**
- `log4j-slf4j-impl`: **2.25.2**
- `log4j-slf4j2-impl`: **2.25.2**
- `log4j-spring-boot`: **2.25.2**
- `log4j-spring-cloud-config-client`: **2.25.2**
- `log4j-taglib`: **2.25.2**
- `log4j-to-jul`: **2.25.2**
- `log4j-to-slf4j`: **2.25.2**
- `log4j-web`: **2.25.2**

### `org.apache.pulsar`

*All artifacts version: **4.1.1***

- `pulsar-client`
- `pulsar-client-api`

### `org.apache.tomcat`

*All artifacts version: **11.0.14***

- `tomcat-annotations-api`
- `tomcat-jdbc`
- `tomcat-jsp-api`

### `org.apache.tomcat.embed`

*All artifacts version: **11.0.14***

- `tomcat-embed-core`
- `tomcat-embed-el`
- `tomcat-embed-jasper`
- `tomcat-embed-websocket`

### `org.aspectj`

*All artifacts version: **1.9.25***

- `aspectjrt`
- `aspectjtools`
- `aspectjweaver`

### `org.assertj`

*All artifacts version: **3.27.6***

- `assertj-core`
- `assertj-guava`

### `org.awaitility`

*All artifacts version: **4.3.0***

- `awaitility`
- `awaitility-groovy`
- `awaitility-kotlin`
- `awaitility-scala`

### `org.cache2k`

*All artifacts version: **2.6.1.Final***

- `cache2k-api`
- `cache2k-config`
- `cache2k-core`
- `cache2k-jcache`
- `cache2k-micrometer`
- `cache2k-spring`

### `org.codehaus.janino`

*All artifacts version: **3.1.12***

- `commons-compiler`
- `commons-compiler-jdk`
- `janino`

### `org.crac`

- `crac`: **1.5.0**

### `org.eclipse`

- `yasson`: **3.0.4**

### `org.eclipse.angus`

*All artifacts version: **2.0.5***

- `angus-core`
- `angus-mail`
- `dsn`
- `gimap`
- `imap`
- `jakarta.mail`
- `logging-mailhandler`
- `pop3`
- `smtp`

### `org.eclipse.jetty`

- `jetty-alpn-client`: **12.1.4**
- `jetty-alpn-conscrypt-client`: **12.1.4**
- `jetty-alpn-conscrypt-server`: **12.1.4**
- `jetty-alpn-java-client`: **12.1.4**
- `jetty-alpn-java-server`: **12.1.4**
- `jetty-alpn-server`: **12.1.4**
- `jetty-client`: **12.1.4**
- `jetty-coreapp`: **12.1.4**
- `jetty-deploy`: **12.1.4**
- `jetty-ethereum`: **12.1.4**
- `jetty-http`: **12.1.4**
- `jetty-http-spi`: **12.1.4**
- `jetty-http-tools`: **12.1.4**
- `jetty-io`: **12.1.4**
- `jetty-jmx`: **12.1.4**
- `jetty-jndi`: **12.1.4**
- `jetty-keystore`: **12.1.4**
- `jetty-openid`: **12.1.4**
- `jetty-osgi`: **12.1.4**
- `jetty-plus`: **12.1.4**
- `jetty-proxy`: **12.1.4**
- `jetty-reactive-httpclient`: **4.1.4**
- `jetty-rewrite`: **12.1.4**
- `jetty-security`: **12.1.4**
- `jetty-server`: **12.1.4**
- `jetty-session`: **12.1.4**
- `jetty-slf4j-impl`: **12.1.4**
- `jetty-start`: **12.1.4**
- `jetty-staticapp`: **12.1.4**
- `jetty-unixdomain-server`: **12.1.4**
- `jetty-util`: **12.1.4**
- `jetty-util-ajax`: **12.1.4**
- `jetty-xml`: **12.1.4**

### `org.flywaydb`

*All artifacts version: **11.8.2***

- `flyway-core`
- `flyway-database-mongodb`
- `flyway-database-postgresql`
- `flyway-mysql`
- `flyway-sqlserver`

### `org.glassfish.jersey.containers`

*All artifacts version: **3.1.11***

- `jersey-container-servlet`
- `jersey-container-servlet-core`

### `org.glassfish.jersey.core`

*All artifacts version: **3.1.11***

- `jersey-client`
- `jersey-common`
- `jersey-server`

### `org.glassfish.jersey.ext`

*All artifacts version: **3.1.11***

- `jersey-bean-validation`
- `jersey-spring6`

### `org.glassfish.jersey.inject`

- `jersey-hk2`: **3.1.11**

### `org.glassfish.jersey.media`

- `jersey-media-json-jackson`: **3.1.11**

### `org.hamcrest`

*All artifacts version: **3.0***

- `hamcrest`
- `hamcrest-core`
- `hamcrest-library`

### `org.hibernate.orm`

*All artifacts version: **7.0.0***

- `hibernate-agroal`
- `hibernate-ant`
- `hibernate-c3p0`
- `hibernate-community-dialects`
- `hibernate-core`
- `hibernate-envers`
- `hibernate-graalvm`
- `hibernate-hikaricp`
- `hibernate-jcache`
- `hibernate-jpamodelgen`
- `hibernate-micrometer`
- `hibernate-processor`
- `hibernate-proxool`
- `hibernate-spatial`
- `hibernate-testing`
- `hibernate-vector`
- `hibernate-vibur`

### `org.hibernate.validator`

*All artifacts version: **9.0.0***

- `hibernate-validator`
- `hibernate-validator-annotation-processor`
- `hibernate-validator-cdi`

### `org.hsqldb`

- `hsqldb`: **2.7.4**

### `org.jooq`

*All artifacts version: **3.20.4***

- `jooq`
- `jooq-codegen`
- `jooq-kotlin`
- `jooq-meta`

### `org.junit.jupiter`

*All artifacts version: **5.12.2***

- `junit-jupiter`
- `junit-jupiter-api`
- `junit-jupiter-engine`
- `junit-jupiter-migrationsupport`
- `junit-jupiter-params`

### `org.junit.platform`

*All artifacts version: **1.12.2***

- `junit-platform-commons`
- `junit-platform-console`
- `junit-platform-engine`
- `junit-platform-jfr`
- `junit-platform-launcher`
- `junit-platform-reporting`
- `junit-platform-runner`
- `junit-platform-suite`
- `junit-platform-suite-api`
- `junit-platform-suite-commons`
- `junit-platform-suite-engine`
- `junit-platform-testkit`

### `org.junit.vintage`

- `junit-vintage-engine`: **5.12.2**

### `org.liquibase`

*All artifacts version: **4.32.0***

- `liquibase-cdi`
- `liquibase-cdi-jakarta`
- `liquibase-core`

### `org.mariadb.jdbc`

- `mariadb-java-client`: **3.5.3**

### `org.mockito`

*All artifacts version: **5.18.0***

- `mockito-android`
- `mockito-bom`
- `mockito-core`
- `mockito-errorprone`
- `mockito-junit-jupiter`
- `mockito-proxy`
- `mockito-subclass`

### `org.mongodb`

*All artifacts version: **5.5.0***

- `bson`
- `bson-record-codec`
- `mongodb-driver-core`
- `mongodb-driver-reactivestreams`
- `mongodb-driver-sync`

### `org.neo4j.driver`

- `neo4j-java-driver`: **5.30.0**

### `org.postgresql`

- `postgresql`: **42.7.7**

### `org.quartz-scheduler`

*All artifacts version: **2.5.0***

- `quartz`
- `quartz-jobs`

### `org.reactivestreams`

- `reactive-streams`: **1.0.4**

### `org.seleniumhq.selenium`

- `htmlunit-driver`: **4.28.1**
- `selenium-api`: **4.32.0**
- `selenium-chrome-driver`: **4.32.0**
- `selenium-chromium-driver`: **4.32.0**
- `selenium-devtools-v131`: **4.32.0**
- `selenium-devtools-v132`: **4.32.0**
- `selenium-devtools-v133`: **4.32.0**
- `selenium-devtools-v85`: **4.32.0**
- `selenium-edge-driver`: **4.32.0**
- `selenium-firefox-driver`: **4.32.0**
- `selenium-grid`: **4.32.0**
- `selenium-http`: **4.32.0**
- `selenium-ie-driver`: **4.32.0**
- `selenium-java`: **4.32.0**
- `selenium-json`: **4.32.0**
- `selenium-manager`: **4.32.0**
- `selenium-remote-driver`: **4.32.0**
- `selenium-safari-driver`: **4.32.0**
- `selenium-support`: **4.32.0**

### `org.skyscreamer`

- `jsonassert`: **1.5.3**

### `org.slf4j`

*All artifacts version: **2.0.17***

- `jcl-over-slf4j`
- `jul-to-slf4j`
- `log4j-over-slf4j`
- `slf4j-api`
- `slf4j-ext`
- `slf4j-jdk-platform-logging`
- `slf4j-jdk14`
- `slf4j-log4j12`
- `slf4j-nop`
- `slf4j-reload4j`
- `slf4j-simple`

### `org.springframework`

*All artifacts version: **7.0.0***

- `spring-aop`
- `spring-aspects`
- `spring-beans`
- `spring-context`
- `spring-context-indexer`
- `spring-context-support`
- `spring-core`
- `spring-core-test`
- `spring-expression`
- `spring-instrument`
- `spring-jcl`
- `spring-jdbc`
- `spring-jms`
- `spring-messaging`
- `spring-orm`
- `spring-oxm`
- `spring-r2dbc`
- `spring-test`
- `spring-tx`
- `spring-web`
- `spring-webflux`
- `spring-webmvc`
- `spring-websocket`

### `org.springframework.amqp`

*All artifacts version: **3.3.1***

- `spring-amqp`
- `spring-rabbit`
- `spring-rabbit-junit`
- `spring-rabbit-stream`
- `spring-rabbit-test`

### `org.springframework.batch`

*All artifacts version: **6.0.0***

- `spring-batch-core`
- `spring-batch-infrastructure`
- `spring-batch-integration`
- `spring-batch-test`

### `org.springframework.data`

- `spring-data-cassandra`: **5.0.0**
- `spring-data-commons`: **4.0.0**
- `spring-data-couchbase`: **6.0.0**
- `spring-data-elasticsearch`: **6.0.0**
- `spring-data-jdbc`: **4.0.0**
- `spring-data-jpa`: **4.0.0**
- `spring-data-keyvalue`: **4.0.0**
- `spring-data-ldap`: **4.0.0**
- `spring-data-mongodb`: **5.0.0**
- `spring-data-neo4j`: **8.0.0**
- `spring-data-r2dbc`: **4.0.0**
- `spring-data-redis`: **4.0.0**
- `spring-data-relational`: **4.0.0**
- `spring-data-rest-core`: **5.0.0**
- `spring-data-rest-hal-browser`: **5.0.0**
- `spring-data-rest-hal-explorer`: **5.0.0**
- `spring-data-rest-webmvc`: **5.0.0**

### `org.springframework.graphql`

*All artifacts version: **2.0.0***

- `spring-graphql`
- `spring-graphql-test`

### `org.springframework.hateoas`

- `spring-hateoas`: **3.0.0**

### `org.springframework.integration`

*All artifacts version: **7.0.0***

- `spring-integration-amqp`
- `spring-integration-cassandra`
- `spring-integration-core`
- `spring-integration-debezium`
- `spring-integration-event`
- `spring-integration-feed`
- `spring-integration-file`
- `spring-integration-ftp`
- `spring-integration-graphql`
- `spring-integration-groovy`
- `spring-integration-hazelcast`
- `spring-integration-http`
- `spring-integration-ip`
- `spring-integration-jdbc`
- `spring-integration-jms`
- `spring-integration-jmx`
- `spring-integration-jpa`
- `spring-integration-kafka`
- `spring-integration-mail`
- `spring-integration-mongodb`
- `spring-integration-mqtt`
- `spring-integration-r2dbc`
- `spring-integration-redis`
- `spring-integration-rsocket`
- `spring-integration-scripting`
- `spring-integration-sftp`
- `spring-integration-smb`
- `spring-integration-stomp`
- `spring-integration-stream`
- `spring-integration-syslog`
- `spring-integration-test`
- `spring-integration-test-support`
- `spring-integration-webflux`
- `spring-integration-websocket`
- `spring-integration-ws`
- `spring-integration-xml`
- `spring-integration-xmpp`
- `spring-integration-zeromq`
- `spring-integration-zip`
- `spring-integration-zookeeper`

### `org.springframework.kafka`

*All artifacts version: **4.0.0***

- `spring-kafka`
- `spring-kafka-test`

### `org.springframework.ldap`

*All artifacts version: **3.3.0***

- `spring-ldap-core`
- `spring-ldap-ldif-core`
- `spring-ldap-odm`
- `spring-ldap-test`

### `org.springframework.pulsar`

*All artifacts version: **1.3.0***

- `spring-pulsar`
- `spring-pulsar-cache-provider`
- `spring-pulsar-cache-provider-caffeine`
- `spring-pulsar-reactive`

### `org.springframework.restdocs`

*All artifacts version: **3.1.0***

- `spring-restdocs-asciidoctor`
- `spring-restdocs-core`
- `spring-restdocs-mockmvc`
- `spring-restdocs-restassured`
- `spring-restdocs-webtestclient`

### `org.springframework.retry`

- `spring-retry`: **2.1.0**

### `org.springframework.security`

- `spring-security-acl`: **7.0.0**
- `spring-security-aspects`: **7.0.0**
- `spring-security-cas`: **7.0.0**
- `spring-security-config`: **7.0.0**
- `spring-security-core`: **7.0.0**
- `spring-security-crypto`: **7.0.0**
- `spring-security-data`: **7.0.0**
- `spring-security-ldap`: **7.0.0**
- `spring-security-messaging`: **7.0.0**
- `spring-security-oauth2-authorization-server`: **2.0.0**
- `spring-security-oauth2-client`: **7.0.0**
- `spring-security-oauth2-core`: **7.0.0**
- `spring-security-oauth2-jose`: **7.0.0**
- `spring-security-oauth2-resource-server`: **7.0.0**
- `spring-security-one-time-token-core`: **7.0.0**
- `spring-security-one-time-token-jdbc`: **7.0.0**
- `spring-security-passkeys`: **7.0.0**
- `spring-security-rsocket`: **7.0.0**
- `spring-security-saml2-service-provider`: **7.0.0**
- `spring-security-taglibs`: **7.0.0**
- `spring-security-test`: **7.0.0**
- `spring-security-web`: **7.0.0**

### `org.springframework.session`

*All artifacts version: **3.5.0***

- `spring-session-bom`
- `spring-session-core`
- `spring-session-data-redis`
- `spring-session-hazelcast`
- `spring-session-jdbc`

### `org.springframework.ws`

*All artifacts version: **4.1.0***

- `spring-ws-core`
- `spring-ws-security`
- `spring-ws-support`
- `spring-ws-test`
- `spring-xml`

### `org.testcontainers`

*All artifacts version: **1.21.0***

- `activemq`
- `azure`
- `cassandra`
- `chromadb`
- `clickhouse`
- `cockroachdb`
- `consul`
- `couchbase`
- `cratedb`
- `database-commons`
- `db2`
- `dynalite`
- `elasticsearch`
- `gcloud`
- `grafana`
- `hivemq`
- `httpd`
- `influxdb`
- `jdbc`
- `jdbc-test`
- `junit-jupiter`
- `k3s`
- `k6`
- `kafka`
- `localstack`
- `mariadb`
- `milvus`
- `minio`
- `mockserver`
- `mongodb`
- `mssqlserver`
- `mysql`
- `neo4j`
- `nginx`
- `oceanbase`
- `ollama`
- `openfga`
- `oracle-free`
- `oracle-xe`
- `orientdb`
- `pinecone`
- `postgresql`
- `presto`
- `pulsar`
- `qdrant`
- `questdb`
- `r2dbc`
- `rabbitmq`
- `redpanda`
- `selenium`
- `solace`
- `solr`
- `spock`
- `testcontainers`
- `tidb`
- `toxiproxy`
- `trino`
- `vault`
- `weaviate`
- `yugabytedb`

### `org.thymeleaf`

*All artifacts version: **3.2.0.RELEASE***

- `thymeleaf`
- `thymeleaf-spring6`

### `org.thymeleaf.extras`

- `thymeleaf-extras-springsecurity6`: **3.2.0.RELEASE**

### `org.xmlunit`

*All artifacts version: **2.10.0***

- `xmlunit-assertj`
- `xmlunit-assertj3`
- `xmlunit-core`
- `xmlunit-jakarta-jaxb-impl`
- `xmlunit-legacy`
- `xmlunit-matchers`
- `xmlunit-placeholders`

### `org.yaml`

- `snakeyaml`: **2.4**

---

## Usage Examples

### Maven (pom.xml)

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.0.0</version>
</parent>

<dependencies>
    <!-- No version needed - managed by Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Third-party dependencies also managed -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
</dependencies>
```

### Gradle (build.gradle.kts)

```kotlin
plugins {
    id("org.springframework.boot") version "4.0.0"
    id("io.spring.dependency-management") version "1.1.7"
}

dependencies {
    // No version needed - managed by Spring Boot
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("com.fasterxml.jackson.core:jackson-databind")
}
```

### Overriding Versions

To override a managed version, set the appropriate property:

**Maven:**
```xml
<properties>
    <jackson.version>2.20.2</jackson.version>
</properties>
```

**Gradle:**
```kotlin
extra["jackson.version"] = "2.20.2"
```

---

## Notes for LLM Usage

This document is optimized for LLM consumption. Key points:

1. **Version lookups**: Search by artifact name (e.g., "jackson-databind") or group (e.g., "com.fasterxml.jackson")
2. **Compatibility**: All listed versions are tested to work together with Spring Boot 4.0.0
3. **Transitive dependencies**: Spring Boot manages versions transitively, so you typically only need to declare direct dependencies
4. **Property names**: Version properties follow the pattern `{artifact-prefix}.version` (e.g., `jackson.version`, `hibernate.version`)

