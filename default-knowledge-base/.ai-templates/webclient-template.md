# WebClient Integration Template

## Integration Service Structure
```java
package com.example.integration;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.reactor.circuitbreaker.operator.CircuitBreakerOperator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class {Service}IntegrationService {

    private final WebClient webClient;
    private final CircuitBreaker circuitBreaker;

    public {Service}IntegrationService(
            WebClient.Builder webClientBuilder,
            CircuitBreakerRegistry circuitBreakerRegistry,
            @Value("${services.{service}.base-url}") String baseUrl) {
        this.webClient = webClientBuilder
            .baseUrl(baseUrl)
            .build();
        this.circuitBreaker = circuitBreakerRegistry.circuitBreaker("{service}-service");
    }

    public {Response}Response call{Operation}({Request}Request request) {
        log.info("Calling {service} {operation}: {}", request.id());
        
        return webClient
            .post()
            .uri("/v1/{endpoint}")
            .bodyValue(request)
            .retrieve()
            .onStatus(HttpStatusCode::is4xxClientError, this::handle4xxError)
            .onStatus(HttpStatusCode::is5xxServerError, this::handle5xxError)
            .bodyToMono({Response}Response.class)
            .transformDeferred(CircuitBreakerOperator.of(circuitBreaker))
            .doOnSuccess(r -> log.info("{Service} {operation} success: {}", r.id()))
            .doOnError(e -> log.error("{Service} {operation} failed", e))
            .block(); // Or return Mono for reactive
    }

    private Mono<? extends Throwable> handle4xxError(ClientResponse response) {
        return response.bodyToMono({Service}ErrorResponse.class)
            .flatMap(error -> {
                log.warn("{Service} client error: {} - {}", 
                    response.statusCode(), error.message());
                return switch (response.statusCode().value()) {
                    case 400 -> Mono.error(new {Service}ValidationException(error));
                    case 404 -> Mono.error(new {Service}NotFoundException(error));
                    case 409 -> Mono.error(new {Service}ConflictException(error));
                    default -> Mono.error(new {Service}ClientException(error));
                };
            });
    }

    private Mono<? extends Throwable> handle5xxError(ClientResponse response) {
        log.error("{Service} server error: {}", response.statusCode());
        return Mono.error(new {Service}UnavailableException(
            "{Service} is temporarily unavailable"));
    }
}
```

## Configuration
```yaml
services:
  {service}:
    base-url: ${SERVICE_URL:http://localhost:8081}
    connect-timeout: 2s
    read-timeout: 5s
```

## Conventions
- Always use circuit breaker for external calls
- Map downstream errors to domain exceptions
- Log request/response for debugging
- Use correlation IDs for tracing
- Never expose downstream error details to clients

