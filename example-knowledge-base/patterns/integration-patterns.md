# Downstream Integration Patterns

## Overview
When calling downstream systems (external APIs, microservices), follow these patterns for resilience and maintainability.

## Client Architecture

### WebClient Configuration
```java
@Configuration
public class WebClientConfig {
    
    @Bean
    public WebClient paymentServiceClient(
            @Value("${services.payment.base-url}") String baseUrl) {
        return WebClient.builder()
            .baseUrl(baseUrl)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .filter(logRequest())
            .filter(logResponse())
            .build();
    }
}
```

### Integration Service Pattern
```java
@Service
@RequiredArgsConstructor
public class PaymentIntegrationService {
    
    private final WebClient paymentServiceClient;
    private final CircuitBreakerRegistry circuitBreakerRegistry;
    
    public Mono<PaymentResponse> processPayment(PaymentRequest request) {
        return Mono.fromCallable(() -> 
            circuitBreakerRegistry.circuitBreaker("payment-service"))
            .flatMap(cb -> paymentServiceClient
                .post()
                .uri("/v1/payments")
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, this::handle4xxError)
                .onStatus(HttpStatusCode::is5xxServerError, this::handle5xxError)
                .bodyToMono(PaymentResponse.class)
                .transformDeferred(CircuitBreakerOperator.of(cb))
            );
    }
}
```

## Error Mapping
Map downstream errors to domain exceptions:

```java
private Mono<? extends Throwable> handle4xxError(ClientResponse response) {
    return response.bodyToMono(ErrorResponse.class)
        .flatMap(error -> switch (response.statusCode().value()) {
            case 400 -> Mono.error(new InvalidPaymentException(error.message()));
            case 404 -> Mono.error(new PaymentNotFoundException(error.message()));
            case 409 -> Mono.error(new DuplicatePaymentException(error.message()));
            default -> Mono.error(new PaymentServiceException(error.message()));
        });
}
```

## Timeout Configuration
```yaml
services:
  payment:
    base-url: https://payment-api.internal
    connect-timeout: 2s
    read-timeout: 5s
    retry:
      max-attempts: 3
      backoff: 100ms
```

## Request/Response Logging
Always log integration calls for debugging:
- Request: method, URL, headers (sanitized), body hash
- Response: status, latency, body hash
- Correlation ID for tracing

