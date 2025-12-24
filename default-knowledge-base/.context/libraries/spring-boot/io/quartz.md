---
title: "Quartz Scheduler"
source: spring-boot-docs-v4
tokens: ~537
---

# Quartz Scheduler

Spring Boot offers several conveniences for working with the [Quartz scheduler](https://www.quartz-scheduler.org/), including the `spring-boot-starter-quartz` starter.
If Quartz is available, a `Scheduler` is auto-configured (through the `SchedulerFactoryBean` abstraction).

Beans of the following types are automatically picked up and associated with the `Scheduler`:

* `JobDetail`: defines a particular Job.
  `JobDetail` instances can be built with the `JobBuilder` API.
* `Calendar`.
* `Trigger`: defines when a particular job is triggered.

By default, an in-memory `JobStore` is used.
However, it is possible to configure a JDBC-based store if a `DataSource` bean is available in your application and if the `spring.quartz.job-store-type` property is configured accordingly, as shown in the following example:

```yaml
spring:
  quartz:
    job-store-type: "jdbc"
```

When the JDBC store is used, the schema can be initialized on startup, as shown in the following example:

```yaml
spring:
  quartz:
    jdbc:
      initialize-schema: "always"
```

> **Warning:** By default, the database is detected and initialized by using the standard scripts provided with the Quartz library.
These scripts drop existing tables, deleting all triggers on every restart.
To use a custom script, set the `spring.quartz.jdbc.schema` property.
Some of the standard scripts – such as those for SQL Server, Azure SQL, and Sybase – cannot be used without modification.
In these cases, make a copy of the script and edit it as directed in the script's comments then set `spring.quartz.jdbc.schema` to use your customized script.

To have Quartz use a `DataSource` other than the application's main `DataSource`, declare a `DataSource` bean, annotating its `@Bean` method with `@QuartzDataSource`.
Doing so ensures that the Quartz-specific `DataSource` is used by both the `SchedulerFactoryBean` and for schema initialization.
Similarly, to have Quartz use a `TransactionManager` other than the application's main `TransactionManager` declare a `TransactionManager` bean, annotating its `@Bean` method with `@QuartzTransactionManager`.

By default, jobs created by configuration will not overwrite already registered jobs that have been read from a persistent job store.
To enable overwriting existing job definitions set the `spring.quartz.overwrite-existing-jobs` property.

Quartz Scheduler configuration can be customized using `spring.quartz` properties and `SchedulerFactoryBeanCustomizer` beans, which allow programmatic `SchedulerFactoryBean` customization.
Advanced Quartz configuration properties can be customized using `spring.quartz.properties.*`.

> **Note:** In particular, an `Executor` bean is not associated with the scheduler as Quartz offers a way to configure the scheduler through `spring.quartz.properties`.
If you need to customize the task executor, consider implementing `SchedulerFactoryBeanCustomizer`.

Jobs can define setters to inject data map properties.
Regular beans can also be injected in a similar manner, as shown in the following example:

```java
// Example: MySampleJob
```
