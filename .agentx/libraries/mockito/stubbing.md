---
title: "Stubbing"
source: mockito-javadoc
tokens: ~1261
tags: [mockito, stubbing]
---

# Stubbing

Stubbing and answers

## Stubbing void methods with exceptions

```java
doThrow(new RuntimeException()).when(mockedList).clear();

  //following throws RuntimeException:
  mockedList.clear();
```

Read more about `doThrow()`|`doAnswer()` family of methods in [section 12](#12).

## Stubbing consecutive calls (iterator-style stubbing)

Sometimes we need to stub with different return value/exception for the same
method call. Typical use case could be mocking iterators.
Original version of Mockito did not have this feature to promote simple mocking.
For example, instead of iterators one could use {@link Iterable} or simply
collections. Those offer natural ways of stubbing (e.g. using real
collections). In rare scenarios stubbing consecutive calls could be useful,
though:

```java
when(mock.someMethod("some arg"))
  .thenThrow(new RuntimeException())
  .thenReturn("foo");

//First call: throws runtime exception:
mock.someMethod("some arg");

//Second call: prints "foo"
System.out.println(mock.someMethod("some arg"));

//Any consecutive call: prints "foo" as well (last stubbing wins).
System.out.println(mock.someMethod("some arg"));
```

Alternative, shorter version of consecutive stubbing:

```java
when(mock.someMethod("some arg"))
  .thenReturn("one", "two", "three");
```

**Warning** : if instead of chaining {@code .thenReturn()} calls, multiple stubbing with the same matchers or arguments
is used, then each stubbing will override the previous one:

```java
//All mock.someMethod("some arg") calls will return "two"
when(mock.someMethod("some arg"))
  .thenReturn("one")
when(mock.someMethod("some arg"))
  .thenReturn("two")
```

## Stubbing with callbacks

Allows stubbing with generic {@link Answer} interface.

Yet another controversial feature which was not included in Mockito
originally. We recommend simply stubbing with `thenReturn()` or
`thenThrow()`, which should be enough to test/test-drive
any clean and simple code. However, if you do have a need to stub with the generic Answer interface, here is an example:

```java
when(mock.someMethod(anyString())).thenAnswer(
    new Answer() {
        public Object answer(InvocationOnMock invocation) {
            Object[] args = invocation.getArguments();
            Object mock = invocation.getMock();
            return "called with arguments: " + Arrays.toString(args);
        }
});

//Following prints "called with arguments: [foo]"
System.out.println(mock.someMethod("foo"));
```

## doReturn()|doThrow()|
doAnswer()|doNothing()|doCallRealMethod() family of methods

Stubbing void methods requires a different approach from {@link Mockito#when(Object)} because the compiler does not
like void methods inside brackets...

Use `doThrow()` when you want to stub a void method with an exception:

```java
doThrow(new RuntimeException()).when(mockedList).clear();

  //following throws RuntimeException:
  mockedList.clear();
```

You can use `doThrow()`, `doAnswer()`, `doNothing()`, `doReturn()`
and `doCallRealMethod()` in place of the corresponding call with `when()`, for any method.
It is necessary when you

    - stub void methods

    - stub methods on spy objects (see below)

    - stub the same method more than once, to change the behaviour of a mock in the middle of a test.

but you may prefer to use these methods in place of the alternative with `when()`, for all of your stubbing calls.

Read more about these methods:

{@link Mockito#doReturn(Object)}

{@link Mockito#doThrow(Throwable...)}

{@link Mockito#doThrow(Class)}

{@link Mockito#doAnswer(Answer)}

{@link Mockito#doNothing()}

{@link Mockito#doCallRealMethod()}

## Changing default return values of un-stubbed invocations (Since 1.7)

You can create a mock with specified strategy for its return values.
It's quite an advanced feature and typically you don't need it to write decent tests.
However, it can be helpful for working with **legacy systems**.

It is the default answer so it will be used **only when you don't** stub the method call.

```java
Foo mock = mock(Foo.class, Mockito.RETURNS_SMART_NULLS);
  Foo mockTwo = mock(Foo.class, new YourOwnAnswer());
```

Read more about this interesting implementation of *Answer*: {@link Mockito#RETURNS_SMART_NULLS}

## One-liner stubs (Since 1.9.0)

Mockito will now allow you to create mocks when stubbing.
Basically, it allows to create a stub in one line of code.
This can be helpful to keep test code clean.
For example, some boring stub can be created and stubbed at field initialization in a test:

```java
public class CarTest {
  Car boringStubbedCar = when(mock(Car.class).shiftGear()).thenThrow(EngineNotStarted.class).getMock();

  @Test public void should... {}
```

## Java 8 Custom Answer Support (Since 2.1.0)

As the {@link Answer} interface has just one method it is already possible to implement it in Java 8 using
a lambda expression for very simple situations. The more you need to use the parameters of the method call,
the more you need to typecast the arguments from {@link org.mockito.invocation.InvocationOnMock}.

Examples:

```java
// answer by returning 12 every time
doAnswer(invocation -> 12).when(mock).doSomething();

// answer by using one of the parameters - converting into the right
// type as your go - in this case, returning the length of the second string parameter
// as the answer. This gets long-winded quickly, with casting of parameters.
doAnswer(invocation -> ((String)invocation.getArgument(1)).length())
    .when(mock).doSomething(anyString(), anyString(), anyString());
```

For convenience it is possible to write custom answers/actions, which use the parameters to the method call,
as Java 8 lambdas. Even in Java 7 and lower these custom answers based on a typed interface can reduce boilerplate.
In particular, this approach will make it easier to test functions which use callbacks.

The methods {@link AdditionalAnswers#answer(Answer1)}} and {@link AdditionalAnswers#answerVoid(VoidAnswer1)}
can be used to create the answer. They rely on the related answer interfaces in org.mockito.stubbing that
support answers up to 5 parameters.

Examples:

```java
// Example interface to be mocked has a function like:
void execute(String operand, Callback callback);

// the example callback has a function and the class under test
// will depend on the callback being invoked
void receive(String item);

// Java 8 - style 1
doAnswer(AdditionalAnswers.answerVoid((operand, callback) -> callback.receive("dummy")))
    .when(mock).execute(anyString(), any(Callback.class));

// Java 8 - style 2 - assuming static import of AdditionalAnswers
doAnswer(answerVoid((String operand, Callback callback) -> callback.receive("dummy")))
    .when(mock).execute(anyString(), any(Callback.class));

// Java 8 - style 3 - where mocking function to is a static member of test class
private static void dummyCallbackImpl(String operation, Callback callback) {
    callback.receive("dummy");
}

doAnswer(answerVoid(TestClass::dummyCallbackImpl))
    .when(mock).execute(anyString(), any(Callback.class));

// Java 7
doAnswer(answerVoid(new VoidAnswer2() {
    public void answer(String operation, Callback callback) {
        callback.receive("dummy");
    }})).when(mock).execute(anyString(), any(Callback.class));

// returning a value is possible with the answer() function
// and the non-void version of the functional interfaces
// so if the mock interface had a method like
boolean isSameString(String input1, String input2);

// this could be mocked
// Java 8
doAnswer(AdditionalAnswers.answer((input1, input2) -> input1.equals(input2)))
    .when(mock).execute(anyString(), anyString());

// Java 7
doAnswer(answer(new Answer2() {
    public String answer(String input1, String input2) {
        return input1 + input2;
    }})).when(mock).execute(anyString(), anyString());
```

