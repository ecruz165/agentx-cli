---
title: "Mockito Basics"
source: mockito-javadoc
tokens: ~419
tags: [mockito, basics]
---

# Mockito Basics

Verification and stubbing fundamentals

## Let's verify some behaviour!

The following examples mock a List, because most people are familiar with the interface (such as the
`add()`, `get()`, `clear()` methods). 

In reality, please don't mock the List class. Use a real instance instead.

```java
//Let's import Mockito statically so that the code looks clearer
import static org.mockito.Mockito.*;

//mock creation
List mockedList = mock(List.class);

//using mock object
mockedList.add("one");
mockedList.clear();

//verification
verify(mockedList).add("one");
verify(mockedList).clear();
```

Once created, a mock will remember all interactions. Then you can selectively
verify whatever interactions you are interested in.

## How about some stubbing?

```java
//You can mock concrete classes, not just interfaces
LinkedList mockedList = mock(LinkedList.class);

//stubbing
when(mockedList.get(0)).thenReturn("first");
when(mockedList.get(1)).thenThrow(new RuntimeException());

//following prints "first"
System.out.println(mockedList.get(0));

//following throws runtime exception
System.out.println(mockedList.get(1));

//following prints "null" because get(999) was not stubbed
System.out.println(mockedList.get(999));

//Although it is possible to verify a stubbed invocation, usually **it's just redundant**
//If your code cares what get(0) returns, then something else breaks (often even before verify() gets executed).
//If your code doesn't care what get(0) returns, then it should not be stubbed.
verify(mockedList).get(0);
```

- By default, for all methods that return a value, a mock will return either null,
a primitive/primitive wrapper value, or an empty collection, as appropriate.
For example 0 for an int/Integer and false for a boolean/Boolean. 

- Stubbing can be overridden: for example common stubbing can go to
fixture setup but the test methods can override it.
Please note that overriding stubbing is a potential code smell that points out too much stubbing

- Once stubbed, the method will always return a stubbed value, regardless
of how many times it is called. 

- Last stubbing is more important - when you stubbed the same method with
the same arguments many times.
Other words: **the order of stubbing matters** but it is only meaningful rarely,
e.g. when stubbing exactly the same method calls or sometimes when argument matchers are used, etc.

