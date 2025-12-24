---
title: "Spies"
source: mockito-javadoc
tokens: ~972
tags: [mockito, spies]
---

# Spies

Partial mocks and spying

## Spying on real objects

You can create spies of real objects. When you use the spy then the **real** methods are called
(unless a method was stubbed).

Real spies should be used **carefully and occasionally**, for example when dealing with legacy code.

Spying on real objects can be associated with "partial mocking" concept.
**Before the release 1.8**, Mockito spies were not real partial mocks.
The reason was we thought partial mock is a code smell.
At some point we found legitimate use cases for partial mocks
(3rd party interfaces, interim refactoring of legacy code).

```java
List list = new LinkedList();
  List spy = spy(list);

  //optionally, you can stub out some methods:
  when(spy.size()).thenReturn(100);

  //using the spy calls ***real*** methods
  spy.add("one");
  spy.add("two");

  //prints "one" - the first element of a list
  System.out.println(spy.get(0));

  //size() method was stubbed - 100 is printed
  System.out.println(spy.size());

  //optionally, you can verify
  verify(spy).add("one");
  verify(spy).add("two");
```

Important gotcha on spying real objects!

- Sometimes it's impossible or impractical to use {@link Mockito#when(Object)} for stubbing spies.
Therefore when using spies please consider `doReturn`|`Answer`|`Throw()` family of
methods for stubbing. Example:

```java
List list = new LinkedList();
  List spy = spy(list);

  //Impossible: real method is called so spy.get(0) throws IndexOutOfBoundsException (the list is yet empty)
  when(spy.get(0)).thenReturn("foo");

  //You have to use doReturn() for stubbing
  doReturn("foo").when(spy).get(0);
```

- Mockito ***does not*** delegate calls to the passed real instance, instead it actually creates a copy of it.
So if you keep the real instance and interact with it, don't expect the spied to be aware of those interaction
and their effect on real instance state.
The corollary is that when an ***un-stubbed*** method is called ***on the spy*** but ***not on the real instance***,
you won't see any effects on the real instance.

- Watch out for final methods.
Mockito doesn't mock final methods so the bottom line is: when you spy on real objects + you try to stub a final method = trouble.
Also you won't be able to verify those method as well.

## Real partial mocks (Since 1.8.0)

Finally, after many internal debates and discussions on the mailing list, partial mock support was added to Mockito.
 Previously we considered partial mocks as code smells. However, we found a legitimate use case for partial mocks.
 

 **Before release 1.8** `spy()` was not producing real partial mocks and it was confusing for some users.
 Read more about spying: [here](#13) or in javadoc for {@link Mockito#spy(Object)} method.
 

 
```java
//you can create partial mock with spy() method:
   List list = spy(new LinkedList());

   //you can enable partial mock capabilities selectively on mocks:
   Foo mock = mock(Foo.class);
   //Be sure the real implementation is 'safe'.
   //If real implementation throws exceptions or depends on specific state of the object then you're in trouble.
   when(mock.someMethod()).thenCallRealMethod();
```

As usual you are going to read **the partial mock warning**:
Object oriented programming is more less tackling complexity by dividing the complexity into separate, specific, SRPy objects.
How does partial mock fit into this paradigm? Well, it just doesn't...
Partial mock usually means that the complexity has been moved to a different method on the same object.
In most cases, this is not the way you want to design your application.

However, there are rare cases when partial mocks come handy:
dealing with code you cannot change easily (3rd party interfaces, interim refactoring of legacy code etc.)
However, I wouldn't use partial mocks for new, test-driven and well-designed code.

## Spying or mocking abstract classes (Since 1.10.12, further enhanced in 2.7.13 and 2.7.14)

It is now possible to conveniently spy on abstract classes. Note that overusing spies hints at code design smells (see {@link #spy(Object)}).

Previously, spying was only possible on instances of objects.
New API makes it possible to use constructor when creating an instance of the mock.
This is particularly useful for mocking abstract classes because the user is no longer required to provide an instance of the abstract class.
At the moment, only parameter-less constructor is supported, let us know if it is not enough.

```java
//convenience API, new overloaded spy() method:
SomeAbstract spy = spy(SomeAbstract.class);

//Mocking abstract methods, spying default methods of an interface (only available since 2.7.13)
Function function = spy(Function.class);

//Robust API, via settings builder:
OtherAbstract spy = mock(OtherAbstract.class, withSettings()
   .useConstructor().defaultAnswer(CALLS_REAL_METHODS));

//Mocking an abstract class with constructor arguments (only available since 2.7.14)
SomeAbstract spy = mock(SomeAbstract.class, withSettings()
  .useConstructor("arg1", 123).defaultAnswer(CALLS_REAL_METHODS));

//Mocking a non-static inner abstract class:
InnerAbstract spy = mock(InnerAbstract.class, withSettings()
   .useConstructor().outerInstance(outerInstance).defaultAnswer(CALLS_REAL_METHODS));
```

For more information please see {@link MockSettings#useConstructor(Object...)}.

