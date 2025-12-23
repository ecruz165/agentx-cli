# Error Handling Patterns

## Exception Hierarchy
```java
// Base exception
public abstract class DomainException extends RuntimeException {
    private final String errorCode;
    private final Map<String, Object> context;
}

// Specific exceptions
public class ResourceNotFoundException extends DomainException {
    public ResourceNotFoundException(String resourceType, String id) {
        super("NOT_FOUND", "%s not found: %s".formatted(resourceType, id));
    }
}

public class ValidationException extends DomainException {
    private final List<FieldError> fieldErrors;
}

public class IntegrationException extends DomainException {
    private final String serviceName;
    private final int statusCode;
}
```

## Global Exception Handler
```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(404)
            .body(new ErrorResponse(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException ex) {
        log.warn("Validation failed: {}", ex.getFieldErrors());
        return ResponseEntity.status(400)
            .body(new ErrorResponse("VALIDATION_ERROR", ex.getMessage(), ex.getFieldErrors()));
    }

    @ExceptionHandler(IntegrationException.class)
    public ResponseEntity<ErrorResponse> handleIntegration(IntegrationException ex) {
        log.error("Integration error with {}: {}", ex.getServiceName(), ex.getMessage());
        return ResponseEntity.status(502)
            .body(new ErrorResponse("INTEGRATION_ERROR", "Service temporarily unavailable"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(500)
            .body(new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred"));
    }
}
```

## Error Response Format
```java
public record ErrorResponse(
    String code,
    String message,
    List<FieldError> fieldErrors,
    String traceId,
    Instant timestamp
) {
    public ErrorResponse(String code, String message) {
        this(code, message, List.of(), MDC.get("traceId"), Instant.now());
    }
}

public record FieldError(
    String field,
    String message,
    Object rejectedValue
) {}
```

## Integration Error Handling
When downstream calls fail:
1. Log full error details internally
2. Return sanitized error to client
3. Include correlation ID for debugging
4. Don't expose internal service names/URLs

