---
title: "Static and Construction Mocking"
source: mockito-javadoc
tokens: ~1200
tags: [mockito, static, MockedStatic, mockStatic, mockConstruction]
---

# Static and Construction Mocking

Mockito 3.4+ supports mocking static methods and object construction.

## Requirements

Requires the inline mock maker (default since Mockito 5.0):

```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>5.x.x</version>
    <scope>test</scope>
</dependency>
```

## Mocking Static Methods (Since 3.4.0)

Static mocks are scoped to the current thread. Use try-with-resources for automatic cleanup:

```java
assertEquals("foo", Foo.method());
try (MockedStatic<Foo> mocked = mockStatic(Foo.class)) {
    mocked.when(Foo::method).thenReturn("bar");
    assertEquals("bar", Foo.method());
    mocked.verify(Foo::method);
}
assertEquals("foo", Foo.method());  // Back to original
```

### Static Methods with Arguments

```java
try (MockedStatic<StringUtils> mocked = mockStatic(StringUtils.class)) {
    mocked.when(() -> StringUtils.isEmpty("test")).thenReturn(true);
    mocked.when(() -> StringUtils.join(any(), anyString())).thenReturn("joined");
    
    assertTrue(StringUtils.isEmpty("test"));
    assertEquals("joined", StringUtils.join(List.of("a", "b"), ","));
}
```

### Mocking Time

```java
@Test
void mockCurrentTime() {
    LocalDateTime fixedTime = LocalDateTime.of(2024, 1, 15, 10, 30);
    
    try (MockedStatic<LocalDateTime> mocked = mockStatic(LocalDateTime.class)) {
        mocked.when(LocalDateTime::now).thenReturn(fixedTime);
        assertEquals(fixedTime, LocalDateTime.now());
    }
}

@Test
void mockInstant() {
    Instant fixedInstant = Instant.parse("2024-01-15T10:30:00Z");
    
    try (MockedStatic<Instant> mocked = mockStatic(Instant.class)) {
        mocked.when(Instant::now).thenReturn(fixedInstant);
        assertEquals(fixedInstant, Instant.now());
    }
}
```

### Verification

```java
try (MockedStatic<Logger> mocked = mockStatic(Logger.class)) {
    mocked.when(() -> Logger.getLogger(anyString()))
        .thenReturn(mock(Logger.class));
    
    service.doSomething();
    
    // Verify static method was called
    mocked.verify(() -> Logger.getLogger("MyService"));
    mocked.verify(() -> Logger.getLogger(anyString()), times(1));
    mocked.verifyNoMoreInteractions();
}
```

### MockedStatic API

```java
MockedStatic<T> mocked = mockStatic(Foo.class);

mocked.when(verification)           // Stub static method
mocked.verify(verification)         // Verify called once
mocked.verify(verification, mode)   // Verify with mode
mocked.reset()                      // Reset stubbing
mocked.clearInvocations()           // Clear invocation records
mocked.verifyNoMoreInteractions()   // No unexpected calls
mocked.verifyNoInteractions()       // Never called
mocked.close()                      // Release the mock
```

## Mocking Object Construction (Since 3.5.0)

Mock objects created with `new`:

```java
assertEquals("foo", new Foo().method());
try (MockedConstruction<Foo> mocked = mockConstruction(Foo.class)) {
    Foo foo = new Foo();
    when(foo.method()).thenReturn("bar");
    assertEquals("bar", foo.method());
    verify(foo).method();
}
assertEquals("foo", new Foo().method());  // Back to original
```

### With Default Stubbing

```java
try (MockedConstruction<Database> mocked = mockConstruction(Database.class,
        (mock, context) -> {
            when(mock.isConnected()).thenReturn(true);
            when(mock.query(anyString())).thenReturn(defaultResult);
        })) {
    
    Database db = new Database();
    assertTrue(db.isConnected());  // Pre-stubbed
}
```

### Accessing Constructed Mocks

```java
try (MockedConstruction<Foo> mocked = mockConstruction(Foo.class)) {
    new Foo();
    new Foo();
    new Foo();
    
    List<Foo> constructed = mocked.constructed();
    assertEquals(3, constructed.size());
    
    // Verify on specific instance
    verify(constructed.get(0)).someMethod();
}
```

## Using @Mock Annotation for Static Mocks

```java
@ExtendWith(MockitoExtension.class)
class MyTest {

    @Mock
    MockedStatic<Utility> mockedUtility;
    
    @Test
    void test() {
        mockedUtility.when(Utility::getValue).thenReturn(42);
        assertEquals(42, Utility.getValue());
    }
}
```

## Important Notes

### Thread Safety
Static mocks are thread-local - each thread needs its own mock.

### Scope
The mock is **only** active within the try-with-resources block.

### Performance
Static mocking has overhead. Prefer dependency injection when possible.

### Don't Nest Static Mocks
Avoid nesting static mocks of the same class:
```java
// DON'T DO THIS
try (MockedStatic<Foo> outer = mockStatic(Foo.class)) {
    try (MockedStatic<Foo> inner = mockStatic(Foo.class)) { // Bad!
    }
}
```
