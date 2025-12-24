---
title: "BDD Style with Mockito"
source: mockito-javadoc
tokens: ~900
tags: [mockito, bdd, given, then, willReturn, should]
---

# BDD Style with Mockito

BDDMockito provides aliases that integrate with //given //when //then test structure.

## Import

```java
import static org.mockito.BDDMockito.*;
```

## given() instead of when()

```java
// Traditional Mockito
when(seller.askForBread()).thenReturn(new Bread());

// BDD Style
given(seller.askForBread()).willReturn(new Bread());
```

## Complete BDD Test

```java
import static org.mockito.BDDMockito.*;

Seller seller = mock(Seller.class);
Shop shop = new Shop(seller);

@Test
void shouldBuyBread() {
    //given
    given(seller.askForBread()).willReturn(new Bread());
    
    //when
    Goods goods = shop.buyBread();
    
    //then
    assertThat(goods, containsBread());
}
```

## then() instead of verify()

```java
// Traditional Mockito
verify(person).ride(bike);
verify(person, times(2)).ride(bike);

// BDD Style
then(person).should().ride(bike);
then(person).should(times(2)).ride(bike);
```

## BDD Verification

```java
person.ride(bike);
person.ride(bike);

then(person).should(times(2)).ride(bike);
then(person).shouldHaveNoMoreInteractions();
then(police).shouldHaveZeroInteractions();
```

## BDD Stubbing Methods

| Traditional | BDD Style |
|------------|-----------|
| `when().thenReturn()` | `given().willReturn()` |
| `when().thenThrow()` | `given().willThrow()` |
| `when().thenAnswer()` | `given().willAnswer()` |
| `when().thenCallRealMethod()` | `given().willCallRealMethod()` |
| `doReturn().when()` | `willReturn().given()` |
| `doThrow().when()` | `willThrow().given()` |
| `doAnswer().when()` | `willAnswer().given()` |
| `doNothing().when()` | `willDoNothing().given()` |

## For Void Methods

```java
// Traditional
doThrow(new RuntimeException("boo")).when(mock).foo();

// BDD Style
willThrow(new RuntimeException("boo")).given(mock).foo();
```

Example:
```java
//given
willThrow(new RuntimeException("boo")).given(mock).foo();

//when
Result result = systemUnderTest.perform();

//then
assertEquals(failure, result);
```

## BDD with InOrder

```java
InOrder inOrder = inOrder(person);

person.drive(car);
person.ride(bike);
person.ride(bike);

then(person).should(inOrder).drive(car);
then(person).should(inOrder, times(2)).ride(bike);
```

## BDD Verification Modes

```java
// Verify called
then(mock).should().method();

// Verify with mode
then(mock).should(times(2)).method();
then(mock).should(never()).method();
then(mock).should(atLeastOnce()).method();

// Verify no interactions
then(mock).shouldHaveNoInteractions();

// Verify no more interactions
then(mock).shouldHaveNoMoreInteractions();
```

## Full Example with AssertJ BDD

```java
import static org.mockito.BDDMockito.*;
import static org.assertj.core.api.BDDAssertions.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    UserRepository userRepository;
    
    @Mock
    EmailService emailService;
    
    @InjectMocks
    UserService userService;
    
    @Test
    void shouldCreateUserWhenEmailIsUnique() {
        // Given
        given(userRepository.existsByEmail("john@example.com")).willReturn(false);
        given(userRepository.save(any(User.class))).willAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
        
        // When
        User created = userService.createUser("john@example.com", "John");
        
        // Then
        then(userRepository).should().existsByEmail("john@example.com");
        then(userRepository).should().save(any(User.class));
        then(emailService).should().sendWelcomeEmail("john@example.com");
        
        // AssertJ BDD assertions
        then(created.getId()).isEqualTo(1L);
        then(created.getEmail()).isEqualTo("john@example.com");
    }
    
    @Test
    void shouldNotCreateUserWhenEmailExists() {
        // Given
        given(userRepository.existsByEmail("existing@example.com")).willReturn(true);
        
        // When/Then
        thenThrownBy(() -> userService.createUser("existing@example.com", "Jane"))
            .isInstanceOf(EmailExistsException.class);
        
        then(userRepository).should(never()).save(any());
        then(emailService).shouldHaveNoInteractions();
    }
}
```
