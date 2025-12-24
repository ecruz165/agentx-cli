---
title: "How-to: Batch Applications"
source: spring-boot-docs-v4
tokens: ~495
---

# Batch Applications

A number of questions often arise when people use Spring Batch from within a Spring Boot application.
This section addresses those questions.

## Specifying a Batch Data Source

Batch applications that store job details in an SQL database require a `DataSource` bean.
A single `DataSource` bean is required by default.
To have Spring Batch use a `DataSource` other than the application’s main `DataSource`, declare a `DataSource` bean, annotating its `@Bean` method with `@BatchDataSource`.
If you do so and want two data sources (for example by retaining the main auto-configured `DataSource`), set the `defaultCandidate` attribute of the `@Bean` annotation to `false`.

## Specifying a Batch Transaction Manager

Similar to , you can define a `PlatformTransactionManager` for use in batch processing by annotating its `@Bean` method with `@BatchTransactionManager`.
If you do so and want two transaction managers (for example by retaining the auto-configured `PlatformTransactionManager`), set the `defaultCandidate` attribute of the `@Bean` annotation to `false`.

## Specifying a Batch Task Executor

Similar to , you can define a `TaskExecutor` for use in batch processing by annotating its `@Bean` method with `@BatchTaskExecutor`.
If you do so and want two task executors (for example by retaining the auto-configured `TaskExecutor`), set the `defaultCandidate` attribute of the `@Bean` annotation to `false`.

## Running From the Command Line

Spring Boot converts any command line argument starting with `--` to a property to add to the `Environment`, see accessing command line properties.
This should not be used to pass arguments to batch jobs.
To specify batch arguments on the command line, use the regular format (that is without `--`), as shown in the following example:

```shell
$ java -jar myapp.jar someParameter=someValue anotherParameter=anotherValue
```

If you specify a property of the `Environment` on the command line, it is ignored by the job.
Consider the following command:

```shell
$ java -jar myapp.jar --server.port=7070 someParameter=someValue
```

This provides only one argument to the batch job: `someParameter=someValue`.

## Restarting a Stopped or Failed Job

To restart a failed `Job`, all parameters (identifying and non-identifying) must be re-specified on the command line.
Non-identifying parameters are **not** copied from the previous execution.
This allows them to be modified or removed.

> **Note:** When you're using a custom `JobParametersIncrementer`, you have to gather all parameters managed by the incrementer to restart a failed execution.
