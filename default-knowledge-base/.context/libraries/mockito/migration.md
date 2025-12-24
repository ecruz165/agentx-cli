---
title: "Migration and Setup"
source: mockito-javadoc
tokens: ~1499
tags: [mockito, migration]
---

# Migration and Setup

Setup and migration guides

## Migrating to Mockito 2

In order to continue improving Mockito and further improve the unit testing experience, we want you to upgrade to 2.1.0!
Mockito follows [semantic versioning](https://semver.org/) and contains breaking changes only on major version upgrades.
In the lifecycle of a library, breaking changes are necessary
to roll out a set of brand new features that alter the existing behavior or even change the API.
For a comprehensive guide on the new release including incompatible changes,
see '[What's new in Mockito 2](https://github.com/mockito/mockito/wiki/What%27s-new-in-Mockito-2)' wiki page.
We hope that you enjoy Mockito 2!

## . Mockito Android support

With Mockito version 2.6.1 we ship "native" Android support. To enable Android support, add the `mockito-android` library as dependency
to your project. This artifact is published to the same Mockito organization and can be imported for Android as follows:

`
repositories {
  mavenCentral()
}
dependencies {
  testCompile "org.mockito:mockito-core:+"
  androidTestCompile "org.mockito:mockito-android:+"
}
`

You can continue to run the same unit tests on a regular VM by using the `mockito-core` artifact in your "testCompile" scope as shown
above. Be aware that you cannot use the [inline mock maker](#39) on Android due to limitations in the Android VM.

If you encounter issues with mocking on Android, please open an issue
[on the official issue tracker](https://github.com/mockito/mockito/issues/new).
Do provide the version of Android you are working on and dependencies of your project.

## . Configuration-free inline mock making

Starting with version 2.7.6, we offer the 'mockito-inline' artifact that enables [inline mock making](#39) without configuring
the MockMaker extension file. To use this, add the `mockito-inline` instead of the `mockito-core` artifact as follows:

`
repositories {
  mavenCentral()
}
dependencies {
  testCompile "org.mockito:mockito-inline:+"
}
`

Be aware that starting from 5.0.0 the [inline mock maker](#39) became the default mock maker and this
artifact may be abolished in future versions.

For more information about inline mock making, see [section 39](#39).

## . Explicitly setting up instrumentation for inline mocking (Java 21+)

Starting from Java 21, the [JDK restricts the ability of libraries
to attach a Java agent to their own JVM](https://openjdk.org/jeps/451). As a result, the inline-mock-maker might not be able
to function without an explicit setup to enable instrumentation, and the JVM will always display a warning.

The following are examples about how to set up mockito-core as a Java agent, and it may be more appropriate to choose
a different approach depending on your project constraints.

To explicitly attach Mockito during test execution, the library's jar file needs to be specified as `-javaagent`
as an argument to the executing JVM. To enable this in Gradle, the following example adds Mockito to all test
tasks using **Kotlin DSL**. Although omitted for simplicity, using a `CommandLineArgumentProvider` is recommended by Gradle to ensure task relocatability ([documentation](https://docs.gradle.org/current/userguide/caching_java_projects.html#dealing_with_file_paths)):

```kotlin
val mockitoAgent = configurations.create("mockitoAgent")
dependencies {
    testImplementation(libs.mockito)
    mockitoAgent(libs.mockito) { isTransitive = false }
}
tasks {
    test {
        jvmArgs.add("-javaagent:${mockitoAgent.asPath}")
    }
}
```

The same can be achieved using **Groovy DSL**:

```groovy
configurations {
    mockitoAgent
}
dependencies {
    testImplementation(libs.mockito)
    mockitoAgent(libs.mockito) {
        transitive = false
    }
}
tasks {
    test {
        jvmArgs += "-javaagent:${configurations.mockitoAgent.asPath}"
    }
}
```

Supposing `Mockito` is declared in the version catalog as the following

```toml
[versions]
mockito = "5.14.0"

[libraries]
mockito = { module = "org.mockito:mockito-core", version.ref = "mockito" }
```

To add Mockito as an agent to Maven's surefire plugin, the following configuration is needed:

```xml

    org.apache.maven.plugins
    maven-dependency-plugin
    
        
            
                properties
            
        
    

    org.apache.maven.plugins
    maven-surefire-plugin
    
        @{argLine} -javaagent:${org.mockito:mockito-core:jar}
    

```

Note however, that `@{argLine}` needs to exist when surefire performs its
[late replacement](https://maven.apache.org/surefire/maven-surefire-plugin/test-mojo.html#argLine) otherwise
it will just use the value verbatim which will crash the VM,
`The forked VM terminated without properly saying goodbye. VM crash or System.exit called.`, in this case,
you may need to adapt your maven configuration, for example by adding an empty `<argLine/>` property
to the POM file.

Alternatively, to enable support for dynamic attach, it is also possible to start a JVM with
`-XX:+EnableDynamicAgentLoading` flag. Do however note that, since this option is not standardized, any future
release of a JDK might prohibit this behaviour.

## Switch on or off plugins (Since 1.10.15)

An incubating feature made it's way in mockito that will allow to toggle a mockito-plugin.

More information here {@link org.mockito.plugins.PluginSwitch}.

## Advanced public API for framework integrations (Since 2.10.+)

In Summer 2017 we decided that Mockito
[
should offer better API
](https://www.linkedin.com/pulse/mockito-vs-powermock-opinionated-dogmatic-static-mocking-faber)
for advanced framework integrations.
The new API is not intended for users who want to write unit tests.
It is intended for other test tools and mocking frameworks that need to extend or wrap Mockito with some custom logic.
During the design and implementation process ([issue 1110](https://github.com/mockito/mockito/issues/1110))
we have developed and changed following public API elements:

    - New {@link MockitoPlugins} -
     Enables framework integrators to get access to default Mockito plugins.
     Useful when one needs to implement custom plugin such as {@link MockMaker}
     and delegate some behavior to the default Mockito implementation.
    

    - New {@link MockSettings#build(Class)} -
     Creates immutable view of mock settings used later by Mockito.
     Useful for creating invocations with {@link InvocationFactory} or when implementing custom {@link MockHandler}.
    

    - New {@link MockingDetails#getMockHandler()} -
     Other frameworks may use the mock handler to programmatically simulate invocations on mock objects.
    

    - New {@link MockHandler#getMockSettings()} -
     Useful to get hold of the setting the mock object was created with.
    

    - New {@link InvocationFactory} -
     Provides means to create instances of {@link Invocation} objects.
     Useful for framework integrations that need to programmatically simulate method calls on mock objects.
    

    - New {@link MockHandler#getInvocationContainer()} -
     Provides access to invocation container object which has no methods (marker interface).
     Container is needed to hide the internal implementation and avoid leaking it to the public API.
    

    - Changed {@link org.mockito.stubbing.Stubbing} -
     it now extends {@link Answer} interface.
     It is backwards compatible because Stubbing interface is not extensible (see {@link NotExtensible}).
     The change should be seamless to our users.
    

    - {@link NotExtensible} -
      Public annotation that indicates to the user that she should not provide custom implementations of given type.
      Helps framework integrators and our users understand how to use Mockito API safely.
    

Do you have feedback? Please leave comment in [issue 1110](https://github.com/mockito/mockito/issues/1110).

## New API for integrations: listening on verification start events (Since 2.11.+)

Framework integrations such as [Spring Boot](https://projects.spring.io/spring-boot) needs public API to tackle double-proxy use case
([issue 1191](https://github.com/mockito/mockito/issues/1191)).
We added:

    - New {@link VerificationStartedListener} and {@link VerificationStartedEvent}
     enable framework integrators to replace the mock object for verification.
     The main driving use case is [Spring Boot](https://projects.spring.io/spring-boot/) integration.
     For details see Javadoc for {@link VerificationStartedListener}.
    

    - New public method {@link MockSettings#verificationStartedListeners(VerificationStartedListener...)}
    allows to supply verification started listeners at mock creation time.
    

    - New handy method {@link MockingDetails#getMock()} was added to make the {@code MockingDetails} API more complete.
    We found this method useful during the implementation.

## Deprecated org.mockito.plugins.InstantiatorProvider as it was leaking internal API. it was
      replaced by org.mockito.plugins.InstantiatorProvider2 (Since 2.15.4)

org.mockito.plugins.InstantiatorProvider returned an internal API. Hence it was deprecated and replaced
by {@link org.mockito.plugins.InstantiatorProvider2}. org.mockito.plugins.InstantiatorProvider
has now been removed.

