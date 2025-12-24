---
title: "Argument Matchers"
source: mockito-javadoc
tokens: ~660
tags: [mockito, argument, matchers]
---

# Argument Matchers

Flexible argument matching

## Argument matchers

Mockito verifies argument values in natural java style: by using an `equals()` method.
Sometimes, when extra flexibility is required then you might use argument matchers:

```java
//stubbing using built-in anyInt() argument matcher
when(mockedList.get(anyInt())).thenReturn("element");

//stubbing using custom matcher (let's say isValid() returns your own matcher implementation):
when(mockedList.contains(argThat(isValid()))).thenReturn(true);

//following prints "element"
System.out.println(mockedList.get(999));

//**you can also verify using an argument matcher**
verify(mockedList).get(anyInt());

//**argument matchers can also be written as Java 8 Lambdas**
verify(mockedList).add(argThat(someString -> someString.length() > 5));
```

Argument matchers allow flexible verification or stubbing.
{@link ArgumentMatchers Click here} {@link org.mockito.hamcrest.MockitoHamcrest or here} to see more built-in matchers
and examples of **custom argument matchers / hamcrest matchers**.

For information solely on **custom argument matchers** check out javadoc for {@link ArgumentMatcher} class.

Be reasonable with using complicated argument matching.
The natural matching style using `equals()` with occasional `anyX()` matchers tend to give clean and simple tests.
Sometimes it's just better to refactor the code to allow `equals()` matching or even implement `equals()` method to help out with testing.

Also, read [section 15](#15) or javadoc for {@link ArgumentCaptor} class.
{@link ArgumentCaptor} is a special implementation of an argument matcher that captures argument values for further assertions.

**Warning on argument matchers:**

If you are using argument matchers, **all arguments** have to be provided
by matchers.

The following example shows verification but the same applies to stubbing:

```java
verify(mock).someMethod(anyInt(), anyString(), **eq("third argument")**);
  //above is correct - eq() is also an argument matcher

  verify(mock).someMethod(anyInt(), anyString(), **"third argument"**);
  //above is incorrect - exception will be thrown because third argument is given without an argument matcher.
```

Matcher methods like `any()`, `eq()` **do not** return matchers.
Internally, they record a matcher on a stack and return a dummy value (usually null).
This implementation is due to static type safety imposed by the java compiler.
The consequence is that you cannot use `any()`, `eq()` methods outside of verified/stubbed method.

## Java 8 Lambda Matcher Support (Since 2.1.0)

You can use Java 8 lambda expressions with {@link ArgumentMatcher} to reduce the dependency on {@link ArgumentCaptor}.
If you need to verify that the input to a function call on a mock was correct, then you would normally
use the {@link ArgumentCaptor} to find the operands used and then do subsequent assertions on them. While
for complex examples this can be useful, it's also long-winded.

Writing a lambda to express the match is quite easy. The argument to your function, when used in conjunction
with argThat, will be passed to the ArgumentMatcher as a strongly typed object, so it is possible
to do anything with it.

Examples:

```java
// verify a list only had strings of a certain length added to it
// note - this will only compile under Java 8
verify(list, times(2)).add(argThat(string -> string.length() (){
    public boolean matches(String arg) {
        return arg.length()  obj.getSubObject().get(0).equals("expected")));

// this can also be used when defining the behaviour of a mock under different inputs
// in this case if the input list was fewer than 3 items the mock returns null
when(mock.someMethod(argThat(list -> list.size()<3))).thenReturn(null);
```

