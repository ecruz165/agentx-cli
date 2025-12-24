---
title: "Mock Settings"
source: mockito-javadoc
tokens: ~2413
tags: [mockito, mock, settings]
---

# Mock Settings

Advanced mock configuration

## Resetting mocks (Since 1.8.0)

Using this method could be an indication of poor testing.
Normally, you don't need to reset your mocks, just create new mocks for each test method.

Instead of `reset()` please consider writing simple, small and focused test methods over lengthy, over-specified tests.
**First potential code smell is `reset()` in the middle of the test method.** This probably means you're testing too much.
Follow the whisper of your test methods: "Please keep us small and focused on single behavior".
There are several threads about it on mockito mailing list.

The only reason we added `reset()` method is to
make it possible to work with container-injected mocks.
For more information see FAQ ([here](https://github.com/mockito/mockito/wiki/FAQ)).

**Don't harm yourself.** `reset()` in the middle of the test method is a code smell (you're probably testing too much).

```java
List mock = mock(List.class);
  when(mock.size()).thenReturn(10);
  mock.add(1);

  reset(mock);
  //at this point the mock forgot any interactions and stubbing
```

## Troubleshooting and validating framework usage (Since 1.8.0)

First of all, in case of any trouble, I encourage you to read the Mockito FAQ:
[https://github.com/mockito/mockito/wiki/FAQ](https://github.com/mockito/mockito/wiki/FAQ)

In case of questions you may also post to mockito mailing list:
[https://groups.google.com/group/mockito](https://groups.google.com/group/mockito)

Next, you should know that Mockito validates if you use it correctly **all the time**.
However, there's a gotcha so please read the javadoc for {@link Mockito#validateMockitoUsage()}

## Serializable mocks (Since 1.8.1)

Mocks can be made serializable. With this feature you can use a mock in a place that requires dependencies to be serializable.

WARNING: This should be rarely used in unit testing.

The behaviour was implemented for a specific use case of a BDD spec that had an unreliable external dependency.  This
was in a web environment and the objects from the external dependency were being serialized to pass between layers.

To create serializable mock use {@link MockSettings#serializable()}:

```java
List serializableMock = mock(List.class, withSettings().serializable());
```

The mock can be serialized assuming all the normal 
serialization requirements are met by the class.

Making a real object spy serializable is a bit more effort as the spy(...) method does not have an overloaded version
which accepts MockSettings. No worries, you will hardly ever use it.

```java
List list = new ArrayList();
List spy = mock(ArrayList.class, withSettings()
                .spiedInstance(list)
                .defaultAnswer(CALLS_REAL_METHODS)
                .serializable());
```

## Mocking details (Improved in 2.2.x)

Mockito offers API to inspect the details of a mock object.
This API is useful for advanced users and mocking framework integrators.

```java
//To identify whether a particular object is a mock or a spy:
  Mockito.mockingDetails(someObject).isMock();
  Mockito.mockingDetails(someObject).isSpy();

  //Getting details like type to mock or default answer:
  MockingDetails details = mockingDetails(mock);
  details.getMockCreationSettings().getTypeToMock();
  details.getMockCreationSettings().getDefaultAnswer();

  //Getting invocations and stubbings of the mock:
  MockingDetails details = mockingDetails(mock);
  details.getInvocations();
  details.getStubbings();

  //Printing all interactions (including stubbing, unused stubs)
  System.out.println(mockingDetails(mock).printInvocations());
```

For more information see javadoc for {@link MockingDetails}.

## Delegate calls to real instance (Since 1.9.5)

Useful for spies or partial mocks of objects **that are difficult to mock or spy** using the usual spy API.
Since Mockito 1.10.11, the delegate may or may not be of the same type as the mock.
If the type is different, a matching method needs to be found on delegate type otherwise an exception is thrown.

Possible use cases for this feature:

    - Final classes but with an interface

    - Already custom proxied object

    - Special objects with a finalize method, i.e. to avoid executing it 2 times

The difference with the regular spy:

  - The regular spy ({@link #spy(Object)}) contains **all** state from the spied instance
    and the methods are invoked on the spy. The spied instance is only used at mock creation to copy the state from.
    If you call a method on a regular spy and it internally calls other methods on this spy, those calls are remembered
    for verifications, and they can be effectively stubbed.
  

  - The mock that delegates simply delegates all methods to the delegate.
    The delegate is used all the time as methods are delegated onto it.
    If you call a method on a mock that delegates and it internally calls other methods on this mock,
    those calls are **not** remembered for verifications, stubbing does not have effect on them, too.
    Mock that delegates is less powerful than the regular spy but it is useful when the regular spy cannot be created.
  

See more information in docs for {@link AdditionalAnswers#delegatesTo(Object)}.

## MockMaker API (Since 1.9.5)

Driven by requirements and patches from Google Android guys Mockito now offers an extension point
  that allows replacing the proxy generation engine. By default, Mockito uses [Byte Buddy](https://github.com/raphw/byte-buddy)
  to create dynamic proxies.

The extension point is for advanced users that want to extend Mockito. For example, it is now possible
  to use Mockito for Android testing with a help of [dexmaker](https://github.com/crittercism/dexmaker).

For more details, motivations and examples please refer to
the docs for {@link org.mockito.plugins.MockMaker}.

## Mockito mocks can be serialized / deserialized across classloaders (Since 1.10.0)

Mockito introduces serialization across classloader.

Like with any other form of serialization, all types in the mock hierarchy have to serializable, including answers.
As this serialization mode require considerably more work, this is an opt-in setting.

```java
// use regular serialization
mock(Book.class, withSettings().serializable());

// use serialization across classloaders
mock(Book.class, withSettings().serializable(ACROSS_CLASSLOADERS));
```

For more details see {@link MockSettings#serializable(SerializableMode)}.

## Better generic support with deep stubs (Since 1.10.0)

Deep stubbing has been improved to find generic information if available in the class.
That means that classes like this can be used without having to mock the behavior.

```java
class Lines extends List {
    // ...
}

lines = mock(Lines.class, RETURNS_DEEP_STUBS);

// Now Mockito understand this is not an Object but a Line
Line line = lines.iterator().next();
```

Please note that in most scenarios a mock returning a mock is wrong.

## Meta data and generic type retention (Since 2.1.0)

Mockito now preserves annotations on mocked methods and types as well as generic meta data. Previously, a mock type did not preserve
annotations on types unless they were explicitly inherited and never retained annotations on methods. As a consequence, the following
conditions now hold true:

```java
{@literal @}{@code MyAnnotation
 class Foo {
   List bar() { ... }
 }

 Class mockType = mock(Foo.class).getClass();
 assert mockType.isAnnotationPresent(MyAnnotation.class);
 assert mockType.getDeclaredMethod("bar").getGenericReturnType() instanceof ParameterizedType;
}
```

When using Java 8, Mockito now also preserves type annotations. This is default behavior and might not hold [if an
alternative {@link org.mockito.plugins.MockMaker} is used](#28).

## Mocking final types, enums and final methods (Since 2.1.0)

Mockito now offers support for mocking final classes and methods by default.
This is a fantastic improvement that demonstrates Mockito's everlasting quest for improving testing experience.
Our ambition is that Mockito "just works" with final classes and methods.
Previously they were considered *unmockable*, preventing the user from mocking.
Since 5.0.0, this feature is enabled by default.

This alternative mock maker which uses
a combination of both Java instrumentation API and sub-classing rather than creating a new class to represent
a mock. This way, it becomes possible to mock final types and methods.

In versions preceding 5.0.0, this mock maker is **turned off by default** because it is based on
completely different mocking mechanism that required more feedback from the community. It can be activated
explicitly by the mockito extension mechanism, just create in the classpath a file
`/mockito-extensions/org.mockito.plugins.MockMaker` containing the value `mock-maker-inline`.

As a convenience, the Mockito team provides an artifact where this mock maker is preconfigured. Instead of using the
*mockito-core* artifact, include the *mockito-inline* artifact in your project. Note that this artifact is
likely to be discontinued once mocking of final classes and methods gets integrated into the default mock maker.

Some noteworthy notes about this mock maker:

    - Mocking final types and enums is incompatible with mock settings like :
    

        - explicitly serialization support `withSettings().serializable()`

        - extra-interfaces `withSettings().extraInterfaces()`

    

    

    - Some methods cannot be mocked
        

             - Package-visible methods of `java.*`

             - `native` methods

        

    

    - This mock maker has been designed around Java Agent runtime attachment ; this require a compatible JVM,
    that is part of the JDK (or Java 9 VM). When running on a non-JDK VM prior to Java 9, it is however possible to
    manually add the [Byte Buddy Java agent jar](https://bytebuddy.net) using the `-javaagent`
    parameter upon starting the JVM.
    

If you are interested in more details of this feature please read the javadoc of
`org.mockito.internal.creation.bytebuddy.InlineByteBuddyMockMaker`

## New API for clearing mock state in inline mocking (Since 2.25.0)

In certain specific, rare scenarios (issue [#1619](https://github.com/mockito/mockito/pull/1619))
inline mocking causes memory leaks.
There is no clean way to mitigate this problem completely.
Hence, we introduced a new API to explicitly clear mock state (only make sense in inline mocking!).
See example usage in {@link MockitoFramework#clearInlineMocks()}.
If you have feedback or a better idea how to solve the problem please reach out.

## Avoiding code generation when only interfaces are mocked (since 3.12.2)

The JVM offers the {@link java.lang.reflect.Proxy} facility for creating dynamic proxies of interface types. For most applications, Mockito
must be capable of mocking classes as supported by the default mock maker, or even final classes, as supported by the inline mock maker. To
create such mocks, Mockito requires to setup diverse JVM facilities and must apply code generation. If only interfaces are supposed to be
mocked, one can however choose to use a org.mockito.internal.creation.proxy.ProxyMockMaker that is based on the {@link java.lang.reflect.Proxy}
API which avoids diverse overhead of the other mock makers but also limits mocking to interfaces.

This mock maker can be activated explicitly by the mockito extension mechanism, just create in the classpath a file
`/mockito-extensions/org.mockito.plugins.MockMaker` containing the value `mock-maker-proxy`.

## Mark classes as unmockable (since 4.1.0)

In some cases, mocking a class/interface can lead to unexpected runtime behavior. For example, mocking a `java.util.List`
is difficult, given the requirements imposed by the interface. This means that on runtime, depending on what methods the application
calls on the list, your mock might behave in such a way that it violates the interface.

For any class/interface you own that is problematic to mock, you can now mark the class with {@link org.mockito.DoNotMock @DoNotMock}. For usage
of the annotation and how to ship your own (to avoid a compile time dependency on a test artifact), please see its JavaDoc.

## Specifying mock maker for individual mocks (Since 4.8.0)

You may encounter situations where you want to use a different mock maker for a specific test only.
In such case, you can (temporarily) use {@link MockSettings#mockMaker(String)} and {@link Mock#mockMaker()}
to specify the mock maker for a specific mock which is causing the problem.

```java
// using annotation
  @Mock(mockMaker = MockMakers.SUBCLASS)
  Foo mock;
  // using MockSettings.withSettings()
  Foo mock = Mockito.mock(Foo.class, withSettings().mockMaker(MockMakers.SUBCLASS));
```

## Mocking/spying without specifying class (Since 4.10.0)

Instead of calling method {@link Mockito#mock(Class)} or {@link Mockito#spy(Class)} with Class parameter, you can
now call method {@code mock()} or {@code spy()} **without parameters**:

```java
Foo foo = Mockito.mock();
  Bar bar = Mockito.spy();
```

Mockito will automatically detect the needed class.

It works only if you assign result of {@code mock()} or {@code spy()} to a variable or field with an explicit type.
With an implicit type, the Java compiler is unable to automatically determine the type of a mock and you need
to pass in the {@code Class} explicitly.

