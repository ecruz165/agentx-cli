---
title: "Verification"
source: mockito-javadoc
tokens: ~954
tags: [mockito, verification]
---

# Verification

Verifying mock interactions

## Verifying exact number of invocations /
at least x / never

```java
//using mock
mockedList.add("once");

mockedList.add("twice");
mockedList.add("twice");

mockedList.add("three times");
mockedList.add("three times");
mockedList.add("three times");

//following two verifications work exactly the same - times(1) is used by default
verify(mockedList).add("once");
verify(mockedList, times(1)).add("once");

//exact number of invocations verification
verify(mockedList, times(2)).add("twice");
verify(mockedList, times(3)).add("three times");

//verification using never(). never() is an alias to times(0)
verify(mockedList, never()).add("never happened");

//verification using atLeast()/atMost()
verify(mockedList, atMostOnce()).add("once");
verify(mockedList, atLeastOnce()).add("three times");
verify(mockedList, atLeast(2)).add("three times");
verify(mockedList, atMost(5)).add("three times");
```

**times(1) is the default.** Therefore using times(1) explicitly can be
omitted.

## Verification in order

```java
// A. Single mock whose methods must be invoked in a particular order
List singleMock = mock(List.class);

//using a single mock
singleMock.add("was added first");
singleMock.add("was added second");

//create an inOrder verifier for a single mock
InOrder inOrder = inOrder(singleMock);

//following will make sure that add is first called with "was added first", then with "was added second"
inOrder.verify(singleMock).add("was added first");
inOrder.verify(singleMock).add("was added second");

// B. Multiple mocks that must be used in a particular order
List firstMock = mock(List.class);
List secondMock = mock(List.class);

//using mocks
firstMock.add("was called first");
secondMock.add("was called second");

//create inOrder object passing any mocks that need to be verified in order
InOrder inOrder = inOrder(firstMock, secondMock);

//following will make sure that firstMock was called before secondMock
inOrder.verify(firstMock).add("was called first");
inOrder.verify(secondMock).add("was called second");

// Oh, and A + B can be mixed together at will
```

Verification in order is flexible - **you don't have to verify all
interactions** one-by-one but only those that you are interested in
testing in order.

Also, you can create an InOrder object passing only the mocks that are relevant for
in-order verification.

## Making sure interaction(s) never happened on mock

```java
//using mocks - only mockOne is interacted
mockOne.add("one");

//ordinary verification
verify(mockOne).add("one");

//verify that method was never called on a mock
verify(mockOne, never()).add("two");
```

## Finding redundant invocations

```java
//using mocks
mockedList.add("one");
mockedList.add("two");

verify(mockedList).add("one");

//following verification will fail
verifyNoMoreInteractions(mockedList);
```

A word of **warning**:
Some users who did a lot of classic, expect-run-verify mocking tend to use `verifyNoMoreInteractions()` very often, even in every test method.
`verifyNoMoreInteractions()` is not recommended to use in every test method.
`verifyNoMoreInteractions()` is a handy assertion from the interaction testing toolkit. Use it only when it's relevant.
Abusing it leads to **overspecified**, **less maintainable** tests.

See also {@link Mockito#never()} - it is more explicit and
communicates the intent well.

## Verification with timeout (Since 1.8.5)

Allows verifying with timeout. It causes a verify to wait for a specified period of time for a desired
interaction rather than fails immediately if had not already happened. May be useful for testing in concurrent
conditions.

This feature should be used rarely - figure out a better way of testing your multi-threaded system.

Not yet implemented to work with InOrder verification.

Examples:

```java
//passes when someMethod() is called no later than within 100 ms
  //exits immediately when verification is satisfied (e.g. may not wait full 100 ms)
  verify(mock, timeout(100)).someMethod();
  //above is an alias to:
  verify(mock, timeout(100).times(1)).someMethod();

  //passes as soon as someMethod() has been called 2 times under 100 ms
  verify(mock, timeout(100).times(2)).someMethod();

  //equivalent: this also passes as soon as someMethod() has been called 2 times under 100 ms
  verify(mock, timeout(100).atLeast(2)).someMethod();
```

## Verification ignoring stubs (Since 1.9.0)

Mockito will now allow to ignore stubbing for the sake of verification.
Sometimes useful when coupled with `verifyNoMoreInteractions()` or verification `inOrder()`.
Helps avoiding redundant verification of stubbed calls - typically we're not interested in verifying stubs.

**Warning**, `ignoreStubs()` might lead to overuse of verifyNoMoreInteractions(ignoreStubs(...));
Bear in mind that Mockito does not recommend bombarding every test with `verifyNoMoreInteractions()`
for the reasons outlined in javadoc for {@link Mockito#verifyNoMoreInteractions(Object...)}

Some examples:

```java
verify(mock).foo();
verify(mockTwo).bar();

//ignores all stubbed methods:
verifyNoMoreInteractions(ignoreStubs(mock, mockTwo));

//creates InOrder that will ignore stubbed
InOrder inOrder = inOrder(ignoreStubs(mock, mockTwo));
inOrder.verify(mock).foo();
inOrder.verify(mockTwo).bar();
inOrder.verifyNoMoreInteractions();
```

Advanced examples and more details can be found in javadoc for {@link Mockito#ignoreStubs(Object...)}

## BDD style verification (Since 1.10.0)

Enables Behavior Driven Development (BDD) style verification by starting verification with the BDD **then** keyword.

```java
given(dog.bark()).willReturn(2);

// when
...

then(person).should(times(2)).ride(bike);
```

For more information and an example see {@link BDDMockito#then(Object)}

## Custom verification failure message (Since 2.1.0)

Allows specifying a custom message to be printed if verification fails.

Examples:

```java
// will print a custom message on verification failure
verify(mock, description("This will print on failure")).someMethod();

// will work with any verification mode
verify(mock, times(2).description("someMethod should be called twice")).someMethod();
```

