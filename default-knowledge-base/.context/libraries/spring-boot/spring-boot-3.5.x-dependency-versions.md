# Spring Boot 3.5.9 Managed Dependency Versions

> Source: https://docs.spring.io/spring-boot/3.5/appendix/dependency-versions/coordinates.html
> Spring Boot Version: 3.5.9

This document lists all dependency versions managed by Spring Boot 3.5.9. When you declare a dependency on one of these artifacts without declaring a version, the version listed below is used.

## Quick Reference

Use this format in Maven/Gradle:
- Maven: `<groupId>:<artifactId>:<version>`
- Gradle: `"groupId:artifactId:version"`

---

## Dependency Versions

### Logging

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| ch.qos.logback | logback-classic | 1.5.22 |
| ch.qos.logback | logback-core | 1.5.22 |
| org.apache.logging.log4j | log4j-api | 2.24.3 |
| org.apache.logging.log4j | log4j-core | 2.24.3 |
| org.apache.logging.log4j | log4j-to-slf4j | 2.24.3 |
| org.apache.logging.log4j | log4j-slf4j2-impl | 2.24.3 |
| org.apache.logging.log4j | log4j-1.2-api | 2.24.3 |
| org.apache.logging.log4j | log4j-jul | 2.24.3 |
| org.apache.logging.log4j | log4j-layout-template-json | 2.24.3 |

### Jackson (JSON)

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| com.fasterxml.jackson.core | jackson-annotations | 2.19.4 |
| com.fasterxml.jackson.core | jackson-core | 2.19.4 |
| com.fasterxml.jackson.core | jackson-databind | 2.19.4 |
| com.fasterxml.jackson.dataformat | jackson-dataformat-avro | 2.19.4 |
| com.fasterxml.jackson.dataformat | jackson-dataformat-cbor | 2.19.4 |
| com.fasterxml.jackson.dataformat | jackson-dataformat-csv | 2.19.4 |
| com.fasterxml.jackson.dataformat | jackson-dataformat-ion | 2.19.4 |
| com.fasterxml.jackson.dataformat | jackson-dataformat-properties | 2.19.4 |
| com.fasterxml.jackson.dataformat | jackson-dataformat-protobuf | 2.19.4 |
| com.fasterxml.jackson.dataformat | jackson-dataformat-smile | 2.19.4 |
| com.fasterxml.jackson.dataformat | jackson-dataformat-toml | 2.19.4 |
| com.fasterxml.jackson.dataformat | jackson-dataformat-xml | 2.19.4 |
| com.fasterxml.jackson.dataformat | jackson-dataformat-yaml | 2.19.4 |
| com.fasterxml.jackson.datatype | jackson-datatype-eclipse-collections | 2.19.4 |
| com.fasterxml.jackson.datatype | jackson-datatype-guava | 2.19.4 |
| com.fasterxml.jackson.datatype | jackson-datatype-hibernate5-jakarta | 2.19.4 |
| com.fasterxml.jackson.datatype | jackson-datatype-hibernate6 | 2.19.4 |
| com.fasterxml.jackson.datatype | jackson-datatype-jdk8 | 2.19.4 |
| com.fasterxml.jackson.datatype | jackson-datatype-jsr310 | 2.19.4 |
| com.fasterxml.jackson.datatype | jackson-datatype-jakarta-jsonp | 2.19.4 |
| com.fasterxml.jackson.module | jackson-module-kotlin | 2.19.4 |
| com.fasterxml.jackson.module | jackson-module-parameter-names | 2.19.4 |
| com.fasterxml.jackson.module | jackson-module-jakarta-xmlbind-annotations | 2.19.4 |
| com.fasterxml.jackson.module | jackson-module-blackbird | 2.19.4 |
| com.fasterxml.jackson.module | jackson-module-afterburner | 2.19.4 |
| com.fasterxml.jackson.jakarta.rs | jackson-jakarta-rs-json-provider | 2.19.4 |

### Database Drivers

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| com.h2database | h2 | 2.3.232 |
| com.mysql | mysql-connector-j | 9.5.0 |
| org.postgresql | postgresql | (managed by Spring Data) |
| com.microsoft.sqlserver | mssql-jdbc | 12.10.2.jre11 |
| com.oracle.database.jdbc | ojdbc11 | 23.7.0.25.01 |
| com.oracle.database.jdbc | ojdbc17 | 23.7.0.25.01 |
| com.oracle.database.jdbc | ojdbc8 | 23.7.0.25.01 |
| com.oracle.database.jdbc | ucp | 23.7.0.25.01 |
| com.oracle.database.r2dbc | oracle-r2dbc | 1.3.0 |
| com.ibm.db2 | jcc | 12.1.3.0 |
| org.apache.derby | derby | 10.16.1.1 |
| org.apache.derby | derbyclient | 10.16.1.1 |
| org.firebirdsql.jdbc | jaybird | 6.0.3 |
| net.sourceforge.jtds | jtds | 1.3.1 |

### Connection Pools

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| com.zaxxer | HikariCP | 6.3.3 |
| org.apache.commons | commons-dbcp2 | 2.13.0 |
| org.apache.commons | commons-pool2 | 2.12.1 |

### R2DBC (Reactive Database)

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| io.r2dbc | r2dbc-spi | 1.0.0.RELEASE |
| io.r2dbc | r2dbc-pool | 1.0.2.RELEASE |
| io.r2dbc | r2dbc-h2 | 1.0.1.RELEASE |
| io.r2dbc | r2dbc-mssql | 1.0.3.RELEASE |
| io.r2dbc | r2dbc-proxy | 1.1.6.RELEASE |
| io.asyncer | r2dbc-mysql | 1.4.1 |

### Web Servers

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| org.apache.tomcat.embed | tomcat-embed-core | 10.1.50 |
| org.apache.tomcat.embed | tomcat-embed-el | 10.1.50 |
| org.apache.tomcat.embed | tomcat-embed-websocket | 10.1.50 |
| org.apache.tomcat.embed | tomcat-embed-jasper | 10.1.50 |
| org.eclipse.jetty | jetty-server | 12.0.31 |
| org.eclipse.jetty | jetty-servlet | 12.0.31 |
| org.eclipse.jetty | jetty-webapp | 12.0.31 |
| org.eclipse.jetty | jetty-client | 12.0.31 |
| org.eclipse.jetty | jetty-http | 12.0.31 |
| org.eclipse.jetty | jetty-io | 12.0.31 |
| org.eclipse.jetty | jetty-util | 12.0.31 |
| org.eclipse.jetty | jetty-xml | 12.0.31 |
| org.eclipse.jetty | jetty-security | 12.0.31 |
| org.eclipse.jetty | jetty-alpn-server | 12.0.31 |
| org.eclipse.jetty | jetty-reactive-httpclient | 4.0.13 |
| org.eclipse.jetty.http2 | jetty-http2-server | 12.0.31 |
| org.eclipse.jetty.http2 | jetty-http2-client | 12.0.31 |
| org.eclipse.jetty.ee10 | jetty-ee10-servlet | 12.0.31 |
| org.eclipse.jetty.ee10 | jetty-ee10-webapp | 12.0.31 |
| org.eclipse.jetty.ee10.websocket | jetty-ee10-websocket-jakarta-server | 12.0.31 |
| io.undertow | undertow-core | 2.3.20.Final |
| io.undertow | undertow-servlet | 2.3.20.Final |
| io.undertow | undertow-websockets-jsr | 2.3.20.Final |

### Netty

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| io.netty | netty-all | 4.1.130.Final |
| io.netty | netty-buffer | 4.1.130.Final |
| io.netty | netty-codec | 4.1.130.Final |
| io.netty | netty-codec-http | 4.1.130.Final |
| io.netty | netty-codec-http2 | 4.1.130.Final |
| io.netty | netty-common | 4.1.130.Final |
| io.netty | netty-handler | 4.1.130.Final |
| io.netty | netty-handler-proxy | 4.1.130.Final |
| io.netty | netty-resolver | 4.1.130.Final |
| io.netty | netty-resolver-dns | 4.1.130.Final |
| io.netty | netty-transport | 4.1.130.Final |
| io.netty | netty-transport-native-epoll | 4.1.130.Final |
| io.netty | netty-transport-native-kqueue | 4.1.130.Final |
| io.netty | netty-tcnative-boringssl-static | 2.0.74.Final |

### Project Reactor

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| io.projectreactor | reactor-core | 3.7.14 |
| io.projectreactor | reactor-test | 3.7.14 |
| io.projectreactor | reactor-tools | 3.7.14 |
| io.projectreactor | reactor-core-micrometer | 1.2.14 |
| io.projectreactor.addons | reactor-adapter | 3.5.4 |
| io.projectreactor.addons | reactor-extra | 3.5.4 |
| io.projectreactor.addons | reactor-pool | 1.1.7 |
| io.projectreactor.kafka | reactor-kafka | 1.3.25 |
| io.projectreactor.kotlin | reactor-kotlin-extensions | 1.2.5 |
| io.projectreactor.netty | reactor-netty | 1.2.13 |
| io.projectreactor.netty | reactor-netty-core | 1.2.13 |
| io.projectreactor.netty | reactor-netty-http | 1.2.13 |
| io.projectreactor.netty | reactor-netty-http-brave | 1.2.13 |

### Micrometer (Metrics/Observability)

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| io.micrometer | micrometer-core | 1.15.7 |
| io.micrometer | micrometer-commons | 1.15.7 |
| io.micrometer | micrometer-observation | 1.15.7 |
| io.micrometer | micrometer-observation-test | 1.15.7 |
| io.micrometer | micrometer-jakarta9 | 1.15.7 |
| io.micrometer | micrometer-test | 1.15.7 |
| io.micrometer | micrometer-registry-prometheus | 1.15.7 |
| io.micrometer | micrometer-registry-otlp | 1.15.7 |
| io.micrometer | micrometer-registry-datadog | 1.15.7 |
| io.micrometer | micrometer-registry-elastic | 1.15.7 |
| io.micrometer | micrometer-registry-graphite | 1.15.7 |
| io.micrometer | micrometer-registry-influx | 1.15.7 |
| io.micrometer | micrometer-registry-jmx | 1.15.7 |
| io.micrometer | micrometer-registry-statsd | 1.15.7 |
| io.micrometer | micrometer-registry-wavefront | 1.15.7 |
| io.micrometer | micrometer-tracing | 1.5.7 |
| io.micrometer | micrometer-tracing-bridge-brave | 1.5.7 |
| io.micrometer | micrometer-tracing-bridge-otel | 1.5.7 |
| io.micrometer | micrometer-tracing-test | 1.5.7 |
| io.micrometer | context-propagation | 1.1.3 |

### OpenTelemetry

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| io.opentelemetry | opentelemetry-api | 1.49.0 |
| io.opentelemetry | opentelemetry-context | 1.49.0 |
| io.opentelemetry | opentelemetry-sdk | 1.49.0 |
| io.opentelemetry | opentelemetry-sdk-common | 1.49.0 |
| io.opentelemetry | opentelemetry-sdk-trace | 1.49.0 |
| io.opentelemetry | opentelemetry-sdk-metrics | 1.49.0 |
| io.opentelemetry | opentelemetry-sdk-logs | 1.49.0 |
| io.opentelemetry | opentelemetry-sdk-testing | 1.49.0 |
| io.opentelemetry | opentelemetry-sdk-extension-autoconfigure | 1.49.0 |
| io.opentelemetry | opentelemetry-sdk-extension-autoconfigure-spi | 1.49.0 |
| io.opentelemetry | opentelemetry-exporter-otlp | 1.49.0 |
| io.opentelemetry | opentelemetry-exporter-otlp-common | 1.49.0 |
| io.opentelemetry | opentelemetry-exporter-logging | 1.49.0 |
| io.opentelemetry | opentelemetry-exporter-zipkin | 1.49.0 |
| io.opentelemetry | opentelemetry-extension-trace-propagators | 1.49.0 |

### Zipkin/Brave (Tracing)

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| io.zipkin.brave | brave | 6.1.0 |
| io.zipkin.brave | brave-context-slf4j | 6.1.0 |
| io.zipkin.brave | brave-instrumentation-http | 6.1.0 |
| io.zipkin.brave | brave-instrumentation-messaging | 6.1.0 |
| io.zipkin.brave | brave-instrumentation-spring-web | 6.1.0 |
| io.zipkin.brave | brave-instrumentation-spring-webmvc | 6.1.0 |
| io.zipkin.brave | brave-instrumentation-kafka-clients | 6.1.0 |
| io.zipkin.reporter2 | zipkin-reporter | 3.5.1 |
| io.zipkin.reporter2 | zipkin-reporter-brave | 3.5.1 |
| io.zipkin.reporter2 | zipkin-sender-urlconnection | 3.5.1 |
| io.zipkin.reporter2 | zipkin-sender-kafka | 3.5.1 |

### Messaging - Kafka

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| org.apache.kafka | kafka-clients | 3.9.1 |
| org.apache.kafka | kafka-streams | 3.9.1 |
| org.apache.kafka | kafka-streams-test-utils | 3.9.1 |
| org.apache.kafka | connect-api | 3.9.1 |
| org.apache.kafka | connect-json | 3.9.1 |
| org.apache.kafka | connect-runtime | 3.9.1 |
| org.apache.kafka | connect-transforms | 3.9.1 |

### Messaging - RabbitMQ

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| com.rabbitmq | amqp-client | 5.25.0 |
| com.rabbitmq | stream-client | 0.23.0 |

### Messaging - ActiveMQ/Artemis

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| org.apache.activemq | activemq-broker | 6.1.8 |
| org.apache.activemq | activemq-client | 6.1.8 |
| org.apache.activemq | activemq-pool | 6.1.8 |
| org.apache.activemq | activemq-spring | 6.1.8 |
| org.apache.activemq | artemis-jakarta-client | 2.40.0 |
| org.apache.activemq | artemis-jakarta-server | 2.40.0 |
| org.apache.activemq | artemis-server | 2.40.0 |
| org.apache.activemq | artemis-core-client | 2.40.0 |
| org.apache.activemq | artemis-jms-server | 2.40.0 |

### Messaging - Pulsar

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| org.apache.pulsar | pulsar-client | 4.0.8 |
| org.apache.pulsar | pulsar-client-api | 4.0.8 |
| org.apache.pulsar | pulsar-client-admin | 4.0.8 |
| org.apache.pulsar | pulsar-client-reactive-api | 0.6.0 |
| org.apache.pulsar | pulsar-client-reactive-adapter | 0.6.0 |

### Caching

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| com.github.ben-manes.caffeine | caffeine | 3.2.3 |
| com.github.ben-manes.caffeine | guava | 3.2.3 |
| com.github.ben-manes.caffeine | jcache | 3.2.3 |
| org.ehcache | ehcache | 3.10.9 |
| org.cache2k | cache2k-api | 2.6.1.Final |
| org.cache2k | cache2k-core | 2.6.1.Final |
| org.cache2k | cache2k-spring | 2.6.1.Final |
| org.cache2k | cache2k-jcache | 2.6.1.Final |
| com.hazelcast | hazelcast | 5.5.0 |
| com.hazelcast | hazelcast-spring | 5.5.0 |
| io.lettuce | lettuce-core | 6.6.0.RELEASE |
| javax.cache | cache-api | 1.1.1 |

### NoSQL - Elasticsearch

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| co.elastic.clients | elasticsearch-java | 8.18.8 |
| org.elasticsearch.client | elasticsearch-rest-client | 8.18.8 |
| org.elasticsearch.client | elasticsearch-rest-client-sniffer | 8.18.8 |

### NoSQL - Cassandra

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| org.apache.cassandra | java-driver-core | 4.19.2 |
| org.apache.cassandra | java-driver-query-builder | 4.19.2 |
| org.apache.cassandra | java-driver-mapper-runtime | 4.19.2 |
| org.apache.cassandra | java-driver-mapper-processor | 4.19.2 |
| com.datastax.oss | native-protocol | 1.5.2 |

### NoSQL - Couchbase

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| com.couchbase.client | java-client | 3.8.3 |

### Database Migration

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| org.flywaydb | flyway-core | 11.7.2 |
| org.flywaydb | flyway-mysql | 11.7.2 |
| org.flywaydb | flyway-database-postgresql | 11.7.2 |
| org.flywaydb | flyway-sqlserver | 11.7.2 |
| org.flywaydb | flyway-database-oracle | 11.7.2 |
| org.flywaydb | flyway-database-db2 | 11.7.2 |
| org.flywaydb | flyway-database-hsqldb | 11.7.2 |
| org.flywaydb | flyway-database-derby | 11.7.2 |
| org.flywaydb | flyway-database-mongodb | 11.7.2 |

### QueryDSL

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| com.querydsl | querydsl-core | 5.1.0 |
| com.querydsl | querydsl-jpa | 5.1.0 |
| com.querydsl | querydsl-sql | 5.1.0 |
| com.querydsl | querydsl-mongodb | 5.1.0 |
| com.querydsl | querydsl-apt | 5.1.0 |
| com.querydsl | querydsl-collections | 5.1.0 |
| com.querydsl | querydsl-kotlin | 5.1.0 |

### HTTP Clients

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| org.apache.httpcomponents.client5 | httpclient5 | 5.5.1 |
| org.apache.httpcomponents.client5 | httpclient5-fluent | 5.5.1 |
| org.apache.httpcomponents.client5 | httpclient5-cache | 5.5.1 |
| org.apache.httpcomponents.core5 | httpcore5 | 5.3.6 |
| org.apache.httpcomponents.core5 | httpcore5-h2 | 5.3.6 |
| org.apache.httpcomponents.core5 | httpcore5-reactive | 5.3.6 |
| org.apache.httpcomponents | httpasyncclient | 4.1.5 |
| org.apache.httpcomponents | httpcore | 4.4.16 |
| org.apache.httpcomponents | httpcore-nio | 4.4.16 |

### Template Engines

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| org.freemarker | freemarker | 2.3.34 |
| nz.net.ultraq.thymeleaf | thymeleaf-layout-dialect | 3.4.0 |
| com.github.mxab.thymeleaf.extras | thymeleaf-extras-data-attribute | 2.0.1 |
| com.samskivert | jmustache | 1.16 |

### GraphQL

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| com.graphql-java | graphql-java | 24.3 |

### Jakarta EE APIs

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| jakarta.activation | jakarta.activation-api | 2.1.4 |
| jakarta.annotation | jakarta.annotation-api | 2.1.1 |
| jakarta.inject | jakarta.inject-api | 2.0.1 |
| jakarta.jms | jakarta.jms-api | 3.1.0 |
| jakarta.json | jakarta.json-api | 2.1.3 |
| jakarta.json.bind | jakarta.json.bind-api | 3.0.1 |
| jakarta.mail | jakarta.mail-api | 2.1.5 |
| jakarta.persistence | jakarta.persistence-api | 3.1.0 |
| jakarta.servlet | jakarta.servlet-api | 6.0.0 |
| jakarta.servlet.jsp.jstl | jakarta.servlet.jsp.jstl-api | 3.0.2 |
| jakarta.transaction | jakarta.transaction-api | 2.0.1 |
| jakarta.validation | jakarta.validation-api | 3.0.2 |
| jakarta.websocket | jakarta.websocket-api | 2.1.1 |
| jakarta.websocket | jakarta.websocket-client-api | 2.1.1 |
| jakarta.ws.rs | jakarta.ws.rs-api | 3.1.0 |
| jakarta.xml.bind | jakarta.xml.bind-api | 4.0.4 |
| jakarta.xml.soap | jakarta.xml.soap-api | 3.0.2 |
| jakarta.xml.ws | jakarta.xml.ws-api | 4.0.2 |

### JAXB

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| com.sun.xml.bind | jaxb-impl | 4.0.6 |
| com.sun.xml.bind | jaxb-core | 4.0.6 |
| com.sun.xml.bind | jaxb-xjc | 4.0.6 |
| org.glassfish.jaxb | jaxb-runtime | 4.0.6 |
| org.glassfish.jaxb | jaxb-core | 4.0.6 |
| org.glassfish.jaxb | jaxb-xjc | 4.0.6 |

### Mail

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| org.eclipse.angus | angus-mail | 2.0.5 |
| org.eclipse.angus | jakarta.mail | 2.0.5 |
| com.sendgrid | sendgrid-java | 4.10.3 |

### Testing

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| org.assertj | assertj-core | 3.27.6 |
| org.awaitility | awaitility | 4.2.2 |
| org.awaitility | awaitility-kotlin | 4.2.2 |
| net.bytebuddy | byte-buddy | 1.17.8 |
| net.bytebuddy | byte-buddy-agent | 1.17.8 |
| junit | junit | 4.13.2 |
| com.jayway.jsonpath | json-path | 2.9.0 |
| com.jayway.jsonpath | json-path-assert | 2.9.0 |
| io.rest-assured | rest-assured | 5.5.6 |
| io.rest-assured | spring-mock-mvc | 5.5.6 |
| io.rest-assured | spring-web-test-client | 5.5.6 |
| io.rest-assured | json-path | 5.5.6 |
| io.rest-assured | xml-path | 5.5.6 |
| com.redis | testcontainers-redis | 2.2.4 |

### Prometheus

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| io.prometheus | prometheus-metrics-core | 1.3.10 |
| io.prometheus | prometheus-metrics-model | 1.3.10 |
| io.prometheus | prometheus-metrics-config | 1.3.10 |
| io.prometheus | prometheus-metrics-exporter-common | 1.3.10 |
| io.prometheus | prometheus-metrics-exporter-servlet-jakarta | 1.3.10 |
| io.prometheus | prometheus-metrics-instrumentation-jvm | 1.3.10 |
| io.prometheus | simpleclient | 0.16.0 |
| io.prometheus | simpleclient_common | 0.16.0 |
| io.prometheus | simpleclient_hotspot | 0.16.0 |
| io.prometheus | simpleclient_servlet_jakarta | 0.16.0 |

### RSocket

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| io.rsocket | rsocket-core | 1.1.5 |
| io.rsocket | rsocket-transport-netty | 1.1.5 |
| io.rsocket | rsocket-micrometer | 1.1.5 |
| io.rsocket | rsocket-test | 1.1.5 |

### Groovy

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| org.apache.groovy | groovy | 4.0.29 |
| org.apache.groovy | groovy-json | 4.0.29 |
| org.apache.groovy | groovy-xml | 4.0.29 |
| org.apache.groovy | groovy-sql | 4.0.29 |
| org.apache.groovy | groovy-templates | 4.0.29 |
| org.apache.groovy | groovy-test | 4.0.29 |
| org.apache.groovy | groovy-test-junit5 | 4.0.29 |
| org.apache.groovy | groovy-datetime | 4.0.29 |
| org.apache.groovy | groovy-nio | 4.0.29 |

### AspectJ

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| org.aspectj | aspectjrt | 1.9.25.1 |
| org.aspectj | aspectjweaver | 1.9.25.1 |
| org.aspectj | aspectjtools | 1.9.25.1 |

### Utilities

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| org.apache.commons | commons-lang3 | 3.17.0 |
| commons-codec | commons-codec | 1.18.0 |
| com.fasterxml | classmate | 1.7.1 |
| com.google.code.gson | gson | 2.13.2 |
| net.minidev | json-smart | 2.5.2 |
| net.sourceforge.nekohtml | nekohtml | 1.9.22 |
| jaxen | jaxen | 2.0.0 |
| org.crac | crac | 1.5.0 |
| org.eclipse | yasson | 3.0.4 |
| com.unboundid | unboundid-ldapsdk | 7.0.4 |
| io.reactivex.rxjava3 | rxjava | 3.1.12 |
| javax.money | money-api | 1.1 |

### Build Tools/Plugins

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| io.spring.gradle | dependency-management-plugin | 1.1.7 |
| biz.aQute.bnd | biz.aQute.bnd.annotation | 7.0.0 |
| org.apache.maven.plugin-tools | maven-plugin-annotations | 3.13.1 |
| com.github.spotbugs | spotbugs-annotations | 4.8.6 |

### Code Generation

| GroupId | ArtifactId | Version |
|---------|------------|---------|
| org.codehaus.janino | janino | 3.1.12 |
| org.codehaus.janino | commons-compiler | 3.1.12 |

---

## Version Property Overrides

To override any of these versions in your project:

### Maven
```xml
<properties>
    <jackson.version>2.19.4</jackson.version>
    <netty.version>4.1.130.Final</netty.version>
    <!-- etc. -->
</properties>
```

### Gradle
```groovy
ext['jackson.version'] = '2.19.4'
ext['netty.version'] = '4.1.130.Final'
// etc.
```

---

## Key Version Summary

| Component | Version |
|-----------|---------|
| Spring Boot | 3.5.9 |
| Spring Framework | 6.2.x (managed) |
| Tomcat | 10.1.50 |
| Jetty | 12.0.31 |
| Undertow | 2.3.20.Final |
| Jackson | 2.19.4 |
| Netty | 4.1.130.Final |
| Reactor | 3.7.14 |
| Micrometer | 1.15.7 |
| Log4j2 | 2.24.3 |
| Logback | 1.5.22 |
| Hibernate (ORM) | (via Spring Data) |
| Flyway | 11.7.2 |
| Kafka | 3.9.1 |
| HikariCP | 6.3.3 |
| Caffeine | 3.2.3 |
| Lettuce | 6.6.0.RELEASE |
| Brave | 6.1.0 |
| OpenTelemetry | 1.49.0 |
