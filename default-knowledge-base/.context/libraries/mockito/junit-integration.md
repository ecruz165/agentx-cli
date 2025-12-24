---
title: "JUnit Integration"
source: mockito-javadoc
tokens: ~437
tags: [mockito, junit, integration]
---

# JUnit Integration

JUnit 4 and JUnit 5 integration

## Mockito JUnit rule (Since 1.10.17)

Mockito now offers a JUnit rule. Until now in JUnit there were two ways to initialize fields annotated by Mockito annotations
such as `@{@link Mock}`, `@{@link Spy}`, `@{@link InjectMocks}`, etc.

    - Annotating the JUnit test class with a `@{@link org.junit.runner.RunWith}({@link MockitoJUnitRunner}.class)`

    - Invoking `{@link MockitoAnnotations#openMocks(Object)}` in the `@{@link org.junit.Before}` method

Now you can choose to use a rule :

```java
@RunWith(YetAnotherRunner.class)
public class TheTest {
    @Rule public MockitoRule mockito = MockitoJUnit.rule();
    // ...
}
```

For more information see {@link MockitoJUnit#rule()}.

## New API for integrations: MockitoSession is usable by testing frameworks (Since 2.15.+)

{@link MockitoSessionBuilder} and {@link MockitoSession} were enhanced to enable reuse by testing framework
integrations (e.g. {@link MockitoRule} for JUnit):

    - {@link MockitoSessionBuilder#initMocks(Object...)} allows to pass in multiple test class instances for
     initialization of fields annotated with Mockito annotations like {@link org.mockito.Mock}.
     This method is useful for advanced framework integrations (e.g. JUnit Jupiter), when a test uses multiple,
     e.g. nested, test class instances.
    

    - {@link MockitoSessionBuilder#name(String)} allows to pass a name from the testing framework to the
     {@link MockitoSession} that will be used for printing warnings when {@link Strictness#WARN} is used.
    

    - {@link MockitoSessionBuilder#logger(MockitoSessionLogger)} makes it possible to customize the logger used
     for hints/warnings produced when finishing mocking (useful for testing and to connect reporting capabilities
     provided by testing frameworks such as JUnit Jupiter).
    

    - {@link MockitoSession#setStrictness(Strictness)} allows to change the strictness of a {@link MockitoSession}
     for one-off scenarios, e.g. it enables configuring a default strictness for all tests in a class but makes it
     possible to change the strictness for a single or a few tests.
    

    - {@link MockitoSession#finishMocking(Throwable)} was added to avoid confusion that may arise because
     there are multiple competing failures. It will disable certain checks when the supplied *failure*
     is not {@code null}.

## New JUnit Jupiter (JUnit5+) extension

For integration with JUnit Jupiter (JUnit5+), use the `org.mockito:mockito-junit-jupiter` artifact.
For more information about the usage of the integration, see [the JavaDoc of `MockitoExtension`](https://javadoc.io/doc/org.mockito/mockito-junit-jupiter/latest/org.mockito.junit.jupiter/org/mockito/junit/jupiter/MockitoExtension.html).

