---
title: "Annotations"
source: mockito-javadoc
tokens: ~553
tags: [mockito, annotations]
---

# Annotations

@Mock, @Spy, @InjectMocks, @Captor

## Shorthand for mocks creation - &#064;Mock annotation

- Minimizes repetitive mock creation code.

- Makes the test class more readable.

- Makes the verification error easier to read because the **field name**
is used to identify the mock.

```java
public class ArticleManagerTest {

      @Mock private ArticleCalculator calculator;
      @Mock private ArticleDatabase database;
      @Mock private UserProvider userProvider;

      private ArticleManager manager;

      @org.junit.jupiter.api.Test
      void testSomethingInJunit5(@Mock ArticleDatabase database) {
```

**Important!** This needs to be somewhere in the base class or a test
runner:

```java
MockitoAnnotations.openMocks(testClass);
```

You can use built-in runner: {@link MockitoJUnitRunner} or a rule: {@link MockitoRule}.
For JUnit5 tests, refer to the JUnit5 extension described in [section 45](#45).

Read more here: {@link MockitoAnnotations}

## New annotations: &#064;Captor,
&#064;Spy,
&#064;InjectMocks (Since 1.8.3)

Release 1.8.3 brings new annotations that may be helpful on occasion:

- @{@link Captor} simplifies creation of {@link ArgumentCaptor}
- useful when the argument to capture is a nasty generic class and you want to avoid compiler warnings
- @{@link Spy} - you can use it instead {@link Mockito#spy(Object)}.
- @{@link InjectMocks} - injects mock or spy fields into tested object automatically.

Note that @{@link InjectMocks} can also be used in combination with the @{@link Spy} annotation, it means
that Mockito will inject mocks into the partial mock under test. This complexity is another good reason why you
should only use partial mocks as a last resort. See point 16 about partial mocks.

All new annotations are ***only*** processed on {@link MockitoAnnotations#openMocks(Object)}.
Just like for @{@link Mock} annotation you can use the built-in runner: {@link MockitoJUnitRunner} or rule:
{@link MockitoRule}.

## Automatic instantiation of &#064;Spies,
&#064;InjectMocks and constructor injection goodness (Since 1.9.0)

Mockito will now try to instantiate @{@link Spy} and will instantiate @{@link InjectMocks} fields
using **constructor** injection, **setter** injection, or **field** injection.

To take advantage of this feature you need to use {@link MockitoAnnotations#openMocks(Object)}, {@link MockitoJUnitRunner}
or {@link MockitoRule}.

Read more about available tricks and the rules of injection in the javadoc for {@link InjectMocks}

```java
//instead:
@Spy BeerDrinker drinker = new BeerDrinker();
//you can write:
@Spy BeerDrinker drinker;

//same applies to @InjectMocks annotation:
@InjectMocks LocalPub;
```

## New strictness attribute for @Mock annotation and MockSettings.strictness() methods (Since 4.6.0)

You can now customize the strictness level for a single mock, either using `@Mock` annotation strictness attribute or
using `MockSettings.strictness()`. This can be useful if you want all of your mocks to be strict,
but one of the mocks to be lenient.

```java
@Mock(strictness = Strictness.LENIENT)
  Foo mock;
  // using MockSettings.withSettings()
  Foo mock = Mockito.mock(Foo.class, withSettings().strictness(Strictness.WARN));
```

