---
title: "Logging"
source: spring-boot-docs-v4
tokens: ~5520
---

# Logging

Spring Boot uses [Commons Logging](https://commons.apache.org/logging) for all internal logging but leaves the underlying log implementation open.
Default configurations are provided for /java.logging/java/util/logging/package-summary.html[Java Util Logging], [Log4j2](https://logging.apache.org/log4j/2.x/), and [Logback](https://logback.qos.ch/).
In each case, loggers are pre-configured to use console output with optional file output also available.

By default, if you use the starters, Logback is used for logging.
Appropriate Logback routing is also included to ensure that dependent libraries that use Java Util Logging, Commons Logging, Log4J, or SLF4J all work correctly.

> **Tip:** There are a lot of logging frameworks available for Java.
Do not worry if the above list seems confusing.
Generally, you do not need to change your logging dependencies and the Spring Boot defaults work just fine.

> **Tip:** When you deploy your application to a servlet container or application server, logging performed with the Java Util Logging API is not routed into your application's logs.
This prevents logging performed by the container or other applications that have been deployed to it from appearing in your application's logs.

## Log Format

The default log output from Spring Boot resembles the following example:

[source]
```
include::ROOT:partial$logging/logging-format.txt[]
```

The following items are output:

* Date and Time: Millisecond precision and easily sortable.
* Log Level: `ERROR`, `WARN`, `INFO`, `DEBUG`, or `TRACE`.
* Process ID.
* A `---` separator to distinguish the start of actual log messages.
* Application name: Enclosed in square brackets (logged by default only if `spring.application.name` is set)
* Application group: Enclosed in square brackets (logged by default only if `spring.application.group` is set)
* Thread name: Enclosed in square brackets (may be truncated for console output).
* Correlation ID: If tracing is enabled (not shown in the sample above)
* Logger name: This is usually the source class name (often abbreviated).
* The log message.

> **Note:** Logback does not have a `FATAL` level.
It is mapped to `ERROR`.

> **Tip:** If you have a `spring.application.name` property but don't want it logged you can set `logging.include-application-name` to `false`.

> **Tip:** If you have a `spring.application.group` property but don't want it logged you can set `logging.include-application-group` to `false`.

> **Tip:** For more details about correlation IDs, please see this documentation.

## Console Output

The default log configuration echoes messages to the console as they are written.
By default, `ERROR`-level, `WARN`-level, and `INFO`-level messages are logged.
You can also enable a "`debug`" mode by starting your application with a `--debug` flag.

```shell
$ java -jar myapp.jar --debug
```

> **Note:** You can also specify `debug=true` in your `application.properties`.

When the debug mode is enabled, a selection of core loggers (embedded container, Hibernate, and Spring Boot) are configured to output more information.
Enabling the debug mode does *not* configure your application to log all messages with `DEBUG` level.

Alternatively, you can enable a "`trace`" mode by starting your application with a `--trace` flag (or `trace=true` in your `application.properties`).
Doing so enables trace logging for a selection of core loggers (embedded container, Hibernate schema generation, and the whole Spring portfolio).

If you want to disable console-based logging, you can set the `logging.console.enabled` property to `false`.

### Color-coded Output

If your terminal supports ANSI, color output is used to aid readability.
You can set `spring.output.ansi.enabled` to a javadoc:org.springframework.boot.ansi.AnsiOutput$Enabled[supported value] to override the auto-detection.

Color coding is configured by using the `%clr` conversion word.
In its simplest form, the converter colors the output according to the log level, as shown in the following example:

[source]
```
%clr(%5p)
```

The following table describes the mapping of log levels to colors:

| Level | Color
| --- |
| `FATAL`
| Red
| `ERROR`
| Red
| `WARN`
| Yellow
| `INFO`
| Green
| `DEBUG`
| Green
| `TRACE`
| Green

Alternatively, you can specify the color or style that should be used by providing it as an option to the conversion.
For example, to make the text yellow, use the following setting:

[source]
```
%clr(%d{yyyy-MM-dd'T'HH:mm:ss.SSSXXX})
```

The following colors and styles are supported:

* `blue`
* `cyan`
* `faint`
* `green`
* `magenta`
* `red`
* `yellow`

## File Output

By default, Spring Boot logs only to the console and does not write log files.
If you want to write log files in addition to the console output, you need to set a `logging.file.name` or `logging.file.path` property (for example, in your `application.properties`).
If both properties are set, `logging.file.path` is ignored and only `logging.file.name` is used.

The following table shows how the `logging.*` properties can be used together:

.Logging properties
[cols="1,1,4"]
| `logging.file.name` | `logging.file.path` | Description
| --- | --- |
| *(none)*
| *(none)*
| Console only logging.
| Specific file (for example, `my.log`)
| *(none)*
| Writes to the location specified by `logging.file.name`.
|   The location can be absolute or relative to the current directory.
| *(none)*
| Specific directory (for example, `/var/log`)
| Writes `spring.log` to the directory specified by `logging.file.path`.
|   The directory can be absolute or relative to the current directory.
| Specific file
| Specific directory
| Writes to the location specified by `logging.file.name` and ignores `logging.file.path`.
|   The location can be absolute or relative to the current directory.

Log files rotate when they reach 10 MB and, as with console output, `ERROR`-level, `WARN`-level, and `INFO`-level messages are logged by default.
Note that Log4J2 requires `logging.file.path` to be set with such configuration.

> **Tip:** Logging properties are independent of the actual logging infrastructure.
As a result, specific configuration keys (such as `logback.configurationFile` for Logback) are not managed by spring Boot.

## File Rotation

If you are using the Logback, it is possible to fine-tune log rotation settings using your `application.properties` or `application.yaml` file.
For all other logging system, you will need to configure rotation settings directly yourself (for example, if you use Log4j2 then you could add a `log4j2.xml` or `log4j2-spring.xml` file).

The following rotation policy properties are supported:

| Name | Description
| --- |
| `logging.logback.rollingpolicy.file-name-pattern`
| The filename pattern used to create log archives.
| `logging.logback.rollingpolicy.clean-history-on-start`
| If log archive cleanup should occur when the application starts.
| `logging.logback.rollingpolicy.max-file-size`
| The maximum size of log file before it is archived.
| `logging.logback.rollingpolicy.total-size-cap`
| The maximum amount of size log archives can take before being deleted.
| `logging.logback.rollingpolicy.max-history`
| The maximum number of archive log files to keep (defaults to 7).

## Log Levels

All the supported logging systems can have the logger levels set in the Spring `Environment` (for example, in `application.properties`) by using ``logging.level.<logger-name>=<level>`` where `level` is one of TRACE, DEBUG, INFO, WARN, ERROR, FATAL, or OFF.
The `root` logger can be configured by using `logging.level.root`.

The following example shows potential logging settings in `application.properties`:

```yaml
logging:
  level:
    root: "warn"
    org.springframework.web: "debug"
    org.hibernate: "error"
```

It is also possible to set logging levels using environment variables.
For example, `LOGGING*LEVEL*ORG*SPRINGFRAMEWORK*WEB=DEBUG` will set `org.springframework.web` to `DEBUG`.

> **Note:** The above approach will only work for package level logging.
Since relaxed binding always converts environment variables to lowercase, it is not possible to configure logging for an individual class in this way.
If you need to configure logging for a class, you can use the `SPRING*APPLICATION*JSON` variable.

## Log Groups

It is often useful to be able to group related loggers together so that they can all be configured at the same time.
For example, you might commonly change the logging levels for *all* Tomcat related loggers, but you can not easily remember top level packages.

To help with this, Spring Boot allows you to define logging groups in your Spring `Environment`.
For example, here is how you could define a "`tomcat`" group by adding it to your `application.properties`:

```yaml
logging:
  group:
    tomcat: "org.apache.catalina,org.apache.coyote,org.apache.tomcat"
```

Once defined, you can change the level for all the loggers in the group with a single line:

```yaml
logging:
  level:
    tomcat: "trace"
```

Spring Boot includes the following pre-defined logging groups that can be used out-of-the-box:

[cols="1,4"]
| Name | Loggers
| --- |
| web
| `org.springframework.core.codec`, `org.springframework.http`, `org.springframework.web`, `org.springframework.boot.actuate.endpoint.web`, `org.springframework.boot.web.servlet.ServletContextInitializerBeans`
| sql
| `org.springframework.jdbc.core`, `org.hibernate.SQL`, `LoggerListener`

## Using a Log Shutdown Hook

In order to release logging resources when your application terminates, a shutdown hook that will trigger log system cleanup when the JVM exits is provided.
This shutdown hook is registered automatically unless your application is deployed as a war file.
If your application has complex context hierarchies the shutdown hook may not meet your needs.
If it does not, disable the shutdown hook and investigate the options provided directly by the underlying logging system.
For example, Logback offers [context selectors](https://logback.qos.ch/manual/loggingSeparation.html) which allow each Logger to be created in its own context.
You can use the `logging.register-shutdown-hook` property to disable the shutdown hook.
Setting it to `false` will disable the registration.
You can set the property in your `application.properties` or `application.yaml` file:

```yaml
logging:
  register-shutdown-hook: false
```

## Custom Log Configuration

The various logging systems can be activated by including the appropriate libraries on the classpath and can be further customized by providing a suitable configuration file in the root of the classpath or in a location specified by the following Spring `Environment` property: `logging.config`.

You can force Spring Boot to use a particular logging system by using the `org.springframework.boot.logging.LoggingSystem` system property.
The value should be the fully qualified class name of a `LoggingSystem` implementation.
You can also disable Spring Boot's logging configuration entirely by using a value of `none`.

> **Note:*** Since logging is initialized **before* the `ApplicationContext` is created, it is not possible to control logging from `@PropertySources` in Spring `@Configuration` files.
The only way to change the logging system or disable it entirely is through System properties.

Depending on your logging system, the following files are loaded:

| Logging System | Customization
| --- |
| Logback
| `logback-spring.xml`, `logback-spring.groovy`, `logback.xml`, or `logback.groovy`
| Log4j2
| `log4j2-spring.xml` or `log4j2.xml`
| JDK (Java Util Logging)
| `logging.properties`

> **Note:** When possible, we recommend that you use the `-spring` variants for your logging configuration (for example, `logback-spring.xml` rather than `logback.xml`).
If you use standard configuration locations, Spring cannot completely control log initialization.

> **Warning:** There are known classloading issues with Java Util Logging that cause problems when running from an 'executable jar'.
We recommend that you avoid it when running from an 'executable jar' if at all possible.

To help with the customization, some other properties are transferred from the Spring `Environment` to System properties.
This allows the properties to be consumed by logging system configuration. For example, setting `logging.file.name` in `application.properties` or `LOGGING*FILE*NAME` as an environment variable will result in the `LOG_FILE` System property being set.
The properties that are transferred are described in the following table:

| Spring Environment | System Property | Comments
| --- | --- |
| `logging.exception-conversion-word`
| `LOG*EXCEPTION*CONVERSION_WORD`
| The conversion word used when logging exceptions.
| `logging.file.name`
| `LOG_FILE`
| If defined, it is used in the default log configuration.
| `logging.file.path`
| `LOG_PATH`
| If defined, it is used in the default log configuration.
| `logging.pattern.console`
| `CONSOLE*LOG*PATTERN`
| The log pattern to use on the console (stdout).
| `logging.pattern.dateformat`
| `LOG*DATEFORMAT*PATTERN`
| Appender pattern for log date format.
| `logging.charset.console`
| `CONSOLE*LOG*CHARSET`
| The charset to use for console logging.
| `logging.threshold.console`
| `CONSOLE*LOG*THRESHOLD`
| The log level threshold to use for console logging.
| `logging.pattern.file`
| `FILE*LOG*PATTERN`
| The log pattern to use in a file (if `LOG_FILE` is enabled).
| `logging.charset.file`
| `FILE*LOG*CHARSET`
| The charset to use for file logging (if `LOG_FILE` is enabled).
| `logging.threshold.file`
| `FILE*LOG*THRESHOLD`
| The log level threshold to use for file logging.
| `logging.pattern.level`
| `LOG*LEVEL*PATTERN`
| The format to use when rendering the log level (default `%5p`).
| `logging.structured.format.console`
| `CONSOLE*LOG*STRUCTURED_FORMAT`
| The structured logging format to use for console logging.
| `logging.structured.format.file`
| `FILE*LOG*STRUCTURED_FORMAT`
| The structured logging format to use for file logging.
| `PID`
| `PID`
| The current process ID (discovered if possible and when not already defined as an OS environment variable).

If you use Logback, the following properties are also transferred:

| Spring Environment | System Property | Comments
| --- | --- |
| `logging.logback.rollingpolicy.file-name-pattern`
| `LOGBACK*ROLLINGPOLICY*FILE*NAME*PATTERN`
| Pattern for rolled-over log file names (default `$\{LOG_FILE}.%d\.%i.gz`).
| `logging.logback.rollingpolicy.clean-history-on-start`
| `LOGBACK*ROLLINGPOLICY*CLEAN*HISTORY*ON_START`
| Whether to clean the archive log files on startup.
| `logging.logback.rollingpolicy.max-file-size`
| `LOGBACK*ROLLINGPOLICY*MAX*FILE*SIZE`
| Maximum log file size.
| `logging.logback.rollingpolicy.total-size-cap`
| `LOGBACK*ROLLINGPOLICY*TOTAL*SIZE*CAP`
| Total size of log backups to be kept.
| `logging.logback.rollingpolicy.max-history`
| `LOGBACK*ROLLINGPOLICY*MAX_HISTORY`
| Maximum number of archive log files to keep.

All the supported logging systems can consult System properties when parsing their configuration files.
See the default configurations in `spring-boot.jar` for examples:

* /core/spring-boot/src/main/resources/org/springframework/boot/logging/logback/defaults.xml[Logback]
* /core/spring-boot/src/main/resources/org/springframework/boot/logging/log4j2/log4j2.xml[Log4j 2]
* /core/spring-boot/src/main/resources/org/springframework/boot/logging/java/logging-file.properties[Java Util logging]

> **Tip:**
> If you want to use a placeholder in a logging property, you should use Spring Boot's syntax and not the syntax of the underlying framework.
> Notably, if you use Logback, you should use `:` as the delimiter between a property name and its default value and not use `:-`.

> **Tip:**
> You can add MDC and other ad-hoc content to log lines by overriding only the `LOG*LEVEL*PATTERN` (or `logging.pattern.level` with Logback).
> For example, if you use `logging.pattern.level=user:%X\ %5p`, then the default log format contains an MDC entry for "user", if it exists, as shown in the following example.
> 
> [source]
> ```
> 2019-08-30 12:30:04.031 user:someone INFO 22174 --- [  nio-8080-exec-0] demo.Controller
> Handling authenticated request
> ----

## Structured Logging

Structured logging is a technique where the log output is written in a well-defined, often machine-readable format.
Spring Boot supports structured logging and has support for the following JSON formats out of the box:

* Elastic Common Schema (ECS)
* Graylog Extended Log Format (GELF)
* Logstash

To enable structured logging, set the property `logging.structured.format.console` (for console output) or `logging.structured.format.file` (for file output) to the id of the format you want to use.

If you are using Custom Log Configuration, update your configuration to respect `CONSOLE*LOG*STRUCTURED*FORMAT` and `FILE*LOG*STRUCTURED*FORMAT` system properties.
Take `CONSOLE*LOG*STRUCTURED_FORMAT` for example:
[tabs]
======
Logback::
`
```xml
<!-- replace your encoder with StructuredLogEncoder -->
<encoder class="org.springframework.boot.logging.logback.StructuredLogEncoder">
	<format>${CONSOLE*LOG*STRUCTURED_FORMAT}</format>
	<charset>${CONSOLE*LOG*CHARSET}</charset>
</encoder>
```
`
You can also refer to the default configurations included in Spring Boot:
`
* /core/spring-boot/src/main/resources/org/springframework/boot/logging/logback/structured-console-appender.xml[Logback Structured Console Appender]
* /core/spring-boot/src/main/resources/org/springframework/boot/logging/logback/structured-file-appender.xml[Logback Structured File Appender]
Log4j2::
`
```xml
<!-- replace your PatternLayout with StructuredLogLayout -->
<StructuredLogLayout format="${sys:CONSOLE*LOG*STRUCTURED*FORMAT}" charset="${sys:CONSOLE*LOG_CHARSET}"/>
```
`
You can also refer to the default configurations included in Spring Boot:
`
* /core/spring-boot/src/main/resources/org/springframework/boot/logging/log4j2/log4j2.xml[Log4j2 Console Appender]
* /core/spring-boot/src/main/resources/org/springframework/boot/logging/log4j2/log4j2-file.xml[Log4j2 Console and File Appender]
======

### Elastic Common Schema

[Elastic Common Schema](https://www.elastic.co/guide/en/ecs/8.11/ecs-reference.html) is a JSON based logging format.

To enable the Elastic Common Schema log format, set the appropriate `format` property to `ecs`:

```yaml
logging:
  structured:
    format:
      console: ecs
      file: ecs
```

A log line looks like this:

```json
{"@timestamp":"2024-01-01T10:15:00.067462556Z","log":{"level":"INFO","logger":"org.example.Application"},"process":{"pid":39599,"thread":{"name":"main"}},"service":{"name":"simple"},"message":"No active profile set, falling back to 1 default profile: \"default\"","ecs":{"version":"8.11"}}
```

This format also adds every key value pair contained in the MDC to the JSON object.
You can also use the [SLF4J fluent logging API](https://www.slf4j.org/manual.html#fluent) to add key value pairs to the logged JSON object with the [addKeyValue](https://www.slf4j.org/apidocs/org/slf4j/spi/LoggingEventBuilder.html#addKeyValue(java.lang.String,java.lang.Object)) method.

The `service` values can be customized using `logging.structured.ecs.service` properties:

```yaml
logging:
  structured:
    ecs:
      service:
        name: MyService
        version: 1.0
        environment: Production
        node-name: Primary
```

> **Note:** `logging.structured.ecs.service.name` will default to `spring.application.name` if not specified.

> **Note:** `logging.structured.ecs.service.version` will default to `spring.application.version` if not specified.

### Graylog Extended Log Format (GELF)

[Graylog Extended Log Format](https://go2docs.graylog.org/current/getting*in*log_data/gelf.html) is a JSON based logging format for the Graylog log analytics platform.

To enable the Graylog Extended Log Format, set the appropriate `format` property to `gelf`:

```yaml
logging:
  structured:
    format:
      console: gelf
      file: gelf
```

A log line looks like this:

```json
{"version":"1.1","short*message":"No active profile set, falling back to 1 default profile: \"default\"","timestamp":1725958035.857,"level":6,"*level*name":"INFO","*process*pid":47649,"*process*thread*name":"main","*log*logger":"org.example.Application"}
```

This format also adds every key value pair contained in the MDC to the JSON object.
You can also use the [SLF4J fluent logging API](https://www.slf4j.org/manual.html#fluent) to add key value pairs to the logged JSON object with the [addKeyValue](https://www.slf4j.org/apidocs/org/slf4j/spi/LoggingEventBuilder.html#addKeyValue(java.lang.String,java.lang.Object)) method.

Several fields can be customized using `logging.structured.gelf` properties:

```yaml
logging:
  structured:
    gelf:
      host: MyService
      service:
        version: 1.0
```

> **Note:** `logging.structured.gelf.host` will default to `spring.application.name` if not specified.

> **Note:** `logging.structured.gelf.service.version` will default to `spring.application.version` if not specified.

### Logstash JSON format

The [Logstash JSON format](https://github.com/logfellow/logstash-logback-encoder?tab=readme-ov-file#standard-fields) is a JSON based logging format.

To enable the Logstash JSON log format, set the appropriate `format` property to `logstash`:

```yaml
logging:
  structured:
    format:
      console: logstash
      file: logstash
```

A log line looks like this:

```json
{"@timestamp":"2024-01-01T10:15:00.111037681+02:00","@version":"1","message":"No active profile set, falling back to 1 default profile: \"default\"","logger*name":"org.example.Application","thread*name":"main","level":"INFO","level_value":20000}
```

This format also adds every key value pair contained in the MDC to the JSON object.
You can also use the [SLF4J fluent logging API](https://www.slf4j.org/manual.html#fluent) to add key value pairs to the logged JSON object with the [addKeyValue](https://www.slf4j.org/apidocs/org/slf4j/spi/LoggingEventBuilder.html#addKeyValue(java.lang.String,java.lang.Object)) method.

If you add [markers](https://www.slf4j.org/api/org/slf4j/Marker.html), these will show up in a `tags` string array in the JSON.

### Customizing Structured Logging JSON

Spring Boot attempts to pick sensible defaults for the JSON names and values output for structured logging.
Sometimes, however, you may want to make small adjustments to the JSON for your own needs.
For example, it's possible that you might want to change some of the names to match the expectations of your log ingestion system.
You might also want to filter out certain members since you don't find them useful.

The following properties allow you to change the way that structured logging JSON is written:

| Property | Description
| --- |
| `logging.structured.json.include` & `logging.structured.json.exclude`
| Filters specific paths from the JSON
| `logging.structured.json.rename`
| Renames a specific member in the JSON
| `logging.structured.json.add`
| Adds additional members to the JSON

For example, the following will exclude `log.level`, rename `process.id` to `procid` and add a fixed `corpname` field:

```yaml
logging:
  structured:
    json:
      exclude: log.level
      rename:
        process.id: procid
      add:
        corpname: mycorp
```

> **Tip:** For more advanced customizations, you can use the `StructuredLoggingJsonMembersCustomizer` interface.
You can reference one or more implementations using the `logging.structured.json.customizer` property.
You can also declare implementations by listing them in a `META-INF/spring.factories` file.

### Customizing Structured Logging Stack Traces

Complete stack traces are included in the JSON output whenever a message is logged with an exception.
This amount of information may be costly to process by your log ingestion system, so you may want to tune the way that stack traces are printed.

To do this, you can use one or more of the following properties:

| Property | Description
| --- |
| `logging.structured.json.stacktrace.root`
| Use `last` to print the root item last (same as Java) or `first` to print the root item first.
| `logging.structured.json.stacktrace.max-length`
| The maximum length that should be printed
| `logging.structured.json.stacktrace.max-throwable-depth`
| The maximum number of frames to print per stack trace (including common and suppressed frames)
| `logging.structured.json.stacktrace.include-common-frames`
| If common frames should be included or removed
| `logging.structured.json.stacktrace.include-hashes`
| If a hash of the stack trace should be included

For example, the following will use root first stack traces, limit their length, and include hashes.

```yaml
logging:
  structured:
    json:
      stacktrace:
        root: first
        max-length: 1024
        include-common-frames: true
        include-hashes: true
```

> **Tip:**
> If you need complete control over stack trace printing you can set `logging.structured.json.stacktrace.printer` to the name of a `StackTracePrinter` implementation.
> You can also set it to `logging-system` to force regular logging system stack trace output to be used.
> 
> Your `StackTracePrinter` implementation can also include a constructor argument that accepts a `StandardStackTracePrinter` if it wishes to apply further customization to the stack trace printer created from the properties.

### Supporting Other Structured Logging Formats

The structured logging support in Spring Boot is extensible, allowing you to define your own custom format.
To do this, implement the `StructuredLogFormatter` interface. The generic type argument has to be `ILoggingEvent` when using Logback and `LogEvent` when using Log4j2 (that means your implementation is tied to a specific logging system).
Your implementation is then called with the log event and returns the `String` to be logged, as seen in this example:

```java
// Example: MyCustomFormat
```

As you can see in the example, you can return any format, it doesn't have to be JSON.

To enable your custom format, set the property `logging.structured.format.console` or `logging.structured.format.file` to the fully qualified class name of your implementation.

Your implementation can use some constructor parameters, which are injected automatically.
Please see the JavaDoc of `StructuredLogFormatter` for more details.

## Logback Extensions

Spring Boot includes a number of extensions to Logback that can help with advanced configuration.
You can use these extensions in your `logback-spring.xml` configuration file.

> **Note:** Because the standard `logback.xml` configuration file is loaded too early, you cannot use extensions in it.
You need to either use `logback-spring.xml` or define a `logging.config` property.

> **Warning:** The extensions cannot be used with Logback's [configuration scanning](https://logback.qos.ch/manual/configuration.html#autoScan).
If you attempt to do so, making changes to the configuration file results in an error similar to one of the following being logged:

[source]
```
ERROR in ch.qos.logback.core.joran.spi.Interpreter@4:71 - no applicable action for [springProperty], current ElementPath is [[configuration][springProperty]]
ERROR in ch.qos.logback.core.joran.spi.Interpreter@4:71 - no applicable action for [springProfile], current ElementPath is [[configuration][springProfile]]
----

### Profile-specific Configuration

The `<springProfile>` tag lets you optionally include or exclude sections of configuration based on the active Spring profiles.
Profile sections are supported anywhere within the `<configuration>` element.
Use the `name` attribute to specify which profile accepts the configuration.
The `<springProfile>` tag can contain a profile name (for example `staging`) or a profile expression.
A profile expression allows for more complicated profile logic to be expressed, for example `production & (eu-central | eu-west)`.
Check the /core/beans/environment.html#beans-definition-profiles-java[Spring Framework reference guide] for more details.
The following listing shows three sample profiles:

```xml
<springProfile name="staging">
	<!-- configuration to be enabled when the "staging" profile is active -->
</springProfile>

<springProfile name="dev | staging">
	<!-- configuration to be enabled when the "dev" or "staging" profiles are active -->
</springProfile>

<springProfile name="!production">
	<!-- configuration to be enabled when the "production" profile is not active -->
</springProfile>
```

### Environment Properties

The `<springProperty>` tag lets you expose properties from the Spring `Environment` for use within Logback.
Doing so can be useful if you want to access values from your `application.properties` file in your Logback configuration.
The tag works in a similar way to Logback's standard `<property>` tag.
However, rather than specifying a direct `value`, you specify the `source` of the property (from the `Environment`).
If you need to store the property somewhere other than in `local` scope, you can use the `scope` attribute.
If you need a fallback value (in case the property is not set in the `Environment`), you can use the `defaultValue` attribute.
The following example shows how to expose properties for use within Logback:

```xml
<springProperty scope="context" name="fluentHost" source="myapp.fluentd.host"
		defaultValue="localhost"/>
<appender name="FLUENT" class="ch.qos.logback.more.appenders.DataFluentAppender">
	<remoteHost>$</remoteHost>
	...
</appender>
```

> **Note:** The `source` must be specified in kebab case (such as `my.property-name`).
However, properties can be added to the `Environment` by using the relaxed rules.

## Log4j2 Extensions

Spring Boot includes a number of extensions to Log4j2 that can help with advanced configuration.
You can use these extensions in any `log4j2-spring.xml` configuration file.

> **Note:** Because the standard `log4j2.xml` configuration file is loaded too early, you cannot use extensions in it.
You need to either use `log4j2-spring.xml` or define a `logging.config` property.

> **Note:** The extensions supersede the [Spring Boot support](https://logging.apache.org/log4j/2.x/log4j-spring-boot.html) provided by Log4J.
You should make sure not to include the `org.apache.logging.log4j:log4j-spring-boot` module in your build.

### Profile-specific Configuration

The `<SpringProfile>` tag lets you optionally include or exclude sections of configuration based on the active Spring profiles.
Profile sections are supported anywhere within the `<Configuration>` element.
Use the `name` attribute to specify which profile accepts the configuration.
The `<SpringProfile>` tag can contain a profile name (for example `staging`) or a profile expression.
A profile expression allows for more complicated profile logic to be expressed, for example `production & (eu-central | eu-west)`.
Check the /core/beans/environment.html#beans-definition-profiles-java[Spring Framework reference guide] for more details.
The following listing shows three sample profiles:

```xml
<SpringProfile name="staging">
	<!-- configuration to be enabled when the "staging" profile is active -->
</SpringProfile>

<SpringProfile name="dev | staging">
	<!-- configuration to be enabled when the "dev" or "staging" profiles are active -->
</SpringProfile>

<SpringProfile name="!production">
	<!-- configuration to be enabled when the "production" profile is not active -->
</SpringProfile>
```

### Environment Properties Lookup

If you want to refer to properties from your Spring `Environment` within your Log4j2 configuration you can use `spring:` prefixed [lookups](https://logging.apache.org/log4j/2.x/manual/lookups.html).
Doing so can be useful if you want to access values from your `application.properties` file in your Log4j2 configuration.

The following example shows how to set Log4j2 properties named `applicationName` and `applicationGroup` that read `spring.application.name` and `spring.application.group` from the Spring `Environment`:

```xml
<Properties>
	<Property name="applicationName">${spring:spring.application.name}</Property>
	<Property name="applicationGroup">${spring:spring.application.group}</Property>
</Properties>
```

> **Note:** The lookup key should be specified in kebab case (such as `my.property-name`).

### Log4j2 System Properties

Log4j2 supports a number of [System Properties](https://logging.apache.org/log4j/2.x/manual/systemproperties.html) that can be used to configure various items.
For example, the `log4j2.skipJansi` system property can be used to configure if the `ConsoleAppender` will try to use a [Jansi](https://github.com/fusesource/jansi) output stream on Windows.

All system properties that are loaded after the Log4j2 initialization can be obtained from the Spring `Environment`.
For example, you could add `log4j2.skipJansi=false` to your `application.properties` file to have the `ConsoleAppender` use Jansi on Windows.

> **Note:** The Spring `Environment` is only considered when system properties and OS environment variables do not contain the value being loaded.

> **Warning:** System properties that are loaded during early Log4j2 initialization cannot reference the Spring `Environment`.
For example, the property Log4j2 uses to allow the default Log4j2 implementation to be chosen is used before the Spring Environment is available.
