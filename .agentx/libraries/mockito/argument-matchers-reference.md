---
title: "Argument Matchers Reference"
source: mockito-javadoc
tokens: ~1500
tags: [mockito, matchers, any, eq, argThat, ArgumentMatcher]
---

# Argument Matchers Reference

Complete reference for all built-in argument matchers in Mockito.

## Important Rules

**If you use any matcher, ALL arguments must use matchers:**

```java
// CORRECT - eq() is also a matcher
verify(mock).someMethod(anyInt(), anyString(), eq("third argument"));

// INCORRECT - will throw exception
verify(mock).someMethod(anyInt(), anyString(), "third argument");
```

**Matchers don't return matchers** - they record internally and return dummy values (usually null).

## Type Matchers

### any() - Matches anything including null

```java
when(mock.method(any())).thenReturn(result);
// Since Mockito 5.0.0, any() no longer matches varargs
```

### any(Class) - Matches any non-null of type

```java
when(mock.method(any(String.class))).thenReturn(result);
when(mock.method(any(User.class))).thenReturn(result);
// Does NOT match null - use isNull() or nullable() for null
```

### isA(Class) - Type check matcher

```java
when(mock.process(isA(HttpRequest.class))).thenReturn(response);
```

## Primitive Matchers

All primitive matchers exclude null values:

```java
anyBoolean()   // any boolean
anyByte()      // any byte
anyChar()      // any char  
anyShort()     // any short
anyInt()       // any int
anyLong()      // any long
anyFloat()     // any float
anyDouble()    // any double
anyString()    // any non-null String
```

Example:
```java
when(calculator.add(anyInt(), anyInt())).thenReturn(42);
when(service.process(anyString())).thenReturn(result);
```

## Collection Matchers

```java
anyList()        // any List (non-null)
anySet()         // any Set (non-null)
anyMap()         // any Map (non-null)
anyCollection()  // any Collection (non-null)
anyIterable()    // any Iterable (non-null)
```

Example:
```java
when(repo.saveAll(anyList())).thenReturn(savedEntities);
when(service.process(anyMap())).thenReturn(result);
```

## Equality Matchers

### eq() - Equals matcher

```java
// Required when mixing matchers with literal values
verify(mock).method(eq("literal"), anyInt());

// Works with all types
eq(42)           // int
eq("string")     // String
eq(myObject)     // Object (uses .equals())
```

### same() - Reference equality (==)

```java
User user = new User();
when(mock.process(same(user))).thenReturn(result);
// Only matches the exact same object reference
```

### refEq() - Reflection-based equality

```java
// Compares objects field-by-field using reflection
when(mock.save(refEq(expectedUser))).thenReturn(savedUser);

// Exclude specific fields from comparison
when(mock.save(refEq(expectedUser, "id", "createdAt"))).thenReturn(savedUser);
```

## Null Matchers

```java
isNull()         // matches null
isNull(Class)    // typed null matcher
notNull()        // matches any non-null
isNotNull()      // alias for notNull()
nullable(Class)  // matches null OR any instance of type
```

Example:
```java
when(mock.process(isNull())).thenReturn(defaultResult);
when(mock.process(nullable(String.class))).thenReturn(result); // null or any String
```

## String Matchers

```java
contains("substring")     // String containing substring
startsWith("prefix")      // String starting with prefix
endsWith("suffix")        // String ending with suffix
matches("regex")          // String matching regex pattern
matches(Pattern.compile("regex"))  // Compiled pattern
```

Example:
```java
when(validator.validate(contains("@"))).thenReturn(true);
when(parser.parse(startsWith("http"))).thenReturn(url);
when(matcher.find(matches("\\d{4}-\\d{2}-\\d{2}"))).thenReturn(date);
```

## Custom Matchers

### argThat() - Lambda/custom matcher

```java
// Lambda matcher (Java 8+)
when(repo.save(argThat(user -> user.getEmail() != null))).thenReturn(saved);

// Verification with lambda
verify(emailService).send(argThat(email -> 
    email.getTo().equals("admin@example.com") &&
    email.getSubject().contains("Alert")
));
```

### assertArg() - Assert and match (Since 5.3.0)

```java
// Combines matching with assertions - throws on mismatch
verify(repo).save(assertArg(user -> {
    assertThat(user.getEmail()).isNotNull();
    assertThat(user.getName()).startsWith("John");
}));
```

### Primitive custom matchers

```java
intThat(matcher)      // custom int matcher
longThat(matcher)     // custom long matcher
doubleThat(matcher)   // custom double matcher
booleanThat(matcher)  // custom boolean matcher
charThat(matcher)     // custom char matcher
byteThat(matcher)     // custom byte matcher
shortThat(matcher)    // custom short matcher
floatThat(matcher)    // custom float matcher
```

## ArgumentMatcher Interface

For reusable custom matchers:

```java
class IsValidEmail implements ArgumentMatcher<String> {
    @Override
    public boolean matches(String email) {
        return email != null && email.contains("@") && email.contains(".");
    }
    
    @Override
    public String toString() {
        return "[valid email]";  // Shown in verification failures
    }
}

// Usage
when(service.send(argThat(new IsValidEmail()))).thenReturn(true);
```

## AdditionalMatchers

For combining and negating matchers:

```java
import static org.mockito.AdditionalMatchers.*;

// Logical operators
and(gt(5), lt(10))    // 5 < x < 10
or(eq(1), eq(2))      // x == 1 || x == 2  
not(eq(0))            // x != 0

// Comparison
gt(5)                 // greater than
lt(10)                // less than
geq(5)                // greater or equal
leq(10)               // less or equal

// Array equality
aryEq(new int[]{1, 2, 3})
```
