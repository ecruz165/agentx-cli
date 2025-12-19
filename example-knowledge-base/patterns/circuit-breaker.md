# Circuit Breaker Pattern

## Overview
Prevent cascading failures when downstream services are unavailable.

## Resilience4j Configuration

### Application Properties
```yaml
resilience4j:
  circuitbreaker:
    instances:
      payment-service:
        registerHealthIndicator: true
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
        permittedNumberOfCallsInHalfOpenState: 3
        automaticTransitionFromOpenToHalfOpenEnabled: true
        waitDurationInOpenState: 30s
        failureRateThreshold: 50
        slowCallRateThreshold: 80
        slowCallDurationThreshold: 2s
        recordExceptions:
          - java.io.IOException
          - java.util.concurrent.TimeoutException
          - org.springframework.web.reactive.function.client.WebClientResponseException$ServiceUnavailable
        ignoreExceptions:
          - com.example.exception.BusinessException
```

### Programmatic Usage
```java
@Service
public class PaymentService {
    
    private final CircuitBreaker circuitBreaker;
    
    public PaymentService(CircuitBreakerRegistry registry) {
        this.circuitBreaker = registry.circuitBreaker("payment-service");
    }
    
    public PaymentResult processPayment(PaymentRequest request) {
        return circuitBreaker.executeSupplier(() -> 
            paymentClient.process(request)
        );
    }
}
```

## Fallback Strategies

### Return Cached Data
```java
public PaymentStatus getPaymentStatus(String paymentId) {
    return Try.ofSupplier(
        CircuitBreaker.decorateSupplier(circuitBreaker, 
            () -> paymentClient.getStatus(paymentId)))
        .recover(CallNotPermittedException.class, 
            e -> paymentCache.getLastKnownStatus(paymentId))
        .get();
}
```

### Graceful Degradation
```java
public OrderResponse createOrder(OrderRequest request) {
    Order order = orderRepository.save(toOrder(request));
    
    try {
        PaymentResult payment = paymentService.processPayment(order);
        order.setPaymentId(payment.id());
    } catch (CallNotPermittedException e) {
        // Queue for later processing
        paymentQueue.enqueue(order.getId());
        order.setStatus(OrderStatus.PAYMENT_PENDING);
    }
    
    return toResponse(order);
}
```

## Monitoring
- Expose circuit breaker state via actuator
- Alert on state transitions (CLOSED → OPEN)
- Track failure rates and slow call rates

