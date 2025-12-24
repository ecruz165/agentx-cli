---
title: "Strictness and Lenient Mocking"
source: mockito-javadoc
tokens: ~554
tags: [mockito, strictness]
---

# Strictness and Lenient Mocking

Strict stubbing and lenient mode

## Improved productivity and cleaner tests with "stricter" Mockito (Since 2.+)

To quickly find out how "stricter" Mockito can make you more productive and get your tests cleaner, see:

    - Strict stubbing with JUnit4 Rules - {@link MockitoRule#strictness(Strictness)} with {@link Strictness#STRICT_STUBS}

    - Strict stubbing with JUnit4 Runner - {@link Strict MockitoJUnitRunner.Strict}

    - Strict stubbing with JUnit5 Extension - `org.mockito.junit.jupiter.MockitoExtension`

    - Strict stubbing with TestNG Listener [MockitoTestNGListener](https://github.com/mockito/mockito-testng)

    - Strict stubbing if you cannot use runner/rule - {@link MockitoSession}

    - Unnecessary stubbing detection with {@link MockitoJUnitRunner}

    - Stubbing argument mismatch warnings, documented in {@link MockitoHint}

Mockito is a "loose" mocking framework by default.
Mocks can be interacted with without setting any expectations beforehand.
This is intentional and it improves the quality of tests by forcing users to be explicit about what they want to stub / verify.
It is also very intuitive, easy to use and blends nicely with "given", "when", "then" template of clean test code.
This is also different from the classic mocking frameworks of the past, they were "strict" by default.

Being "loose" by default makes Mockito tests harder to debug at times.
There are scenarios where misconfigured stubbing (like using a wrong argument) forces the user to run the test with a debugger.
Ideally, tests failures are immediately obvious and don't require debugger to identify the root cause.
Starting with version 2.1 Mockito has been getting new features that nudge the framework towards "strictness".
We want Mockito to offer fantastic debuggability while not losing its core mocking style, optimized for
intuitiveness, explicitness and clean test code.

Help Mockito! Try the new features, give us feedback, join the discussion about Mockito strictness at GitHub
[issue 769](https://github.com/mockito/mockito/issues/769).

## New Mockito.lenient() and MockSettings.lenient() methods (Since 2.20.0)

Strict stubbing feature is available since early Mockito 2.
It is very useful because it drives cleaner tests and improved productivity.
Strict stubbing reports unnecessary stubs, detects stubbing argument mismatch and makes the tests more DRY ({@link Strictness#STRICT_STUBS}).
This comes with a trade-off: in some cases, you may get false negatives from strict stubbing.
To remedy those scenarios you can now configure specific stubbing to be lenient, while all the other stubbings and mocks use strict stubbing:

```java
lenient().when(mock.foo()).thenReturn("ok");
```

If you want all the stubbings on a given mock to be lenient, you can configure the mock accordingly:

```java
Foo mock = Mockito.mock(Foo.class, withSettings().lenient());
```

For more information refer to {@link Mockito#lenient()}.
Let us know how do you find the new feature by opening a GitHub issue to discuss!

