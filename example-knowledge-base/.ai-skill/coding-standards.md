# Coding Standards

## General Principles
- Write clean, readable code over clever code
- Follow SOLID principles
- Prefer composition over inheritance
- Keep methods small and focused (< 20 lines ideal)
- Use meaningful names that reveal intent

## Java/Spring Boot Standards

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Class | PascalCase | `OrderService` |
| Method | camelCase | `processOrder()` |
| Constant | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Package | lowercase | `com.example.order` |

### Package Structure
```
com.example.{service}/
├── api/
│   ├── controller/     # REST controllers
│   └── dto/            # Request/Response DTOs
├── domain/
│   ├── model/          # Domain entities
│   ├── repository/     # Data access
│   └── service/        # Business logic
├── integration/        # External service clients
├── config/             # Spring configuration
└── exception/          # Custom exceptions
```

### Annotations
- Use Lombok: `@RequiredArgsConstructor`, `@Slf4j`, `@Data` (for DTOs only)
- Prefer constructor injection over field injection
- Use `@Validated` for validation

### Logging
```java
// Good - structured, contextual
log.info("Processing order orderId={} customerId={}", orderId, customerId);

// Bad - concatenation, no context
log.info("Processing order " + orderId);
```

### Error Handling
- Throw specific domain exceptions
- Never catch and ignore exceptions
- Log errors with full context
- Don't expose internal details in API responses

### Testing
- Unit test business logic
- Integration test API endpoints
- Use meaningful test names: `should_returnNotFound_when_orderDoesNotExist`
- Follow Arrange-Act-Assert pattern

## Code Review Checklist
- [ ] No hardcoded values (use config)
- [ ] Proper error handling
- [ ] Adequate logging
- [ ] Input validation
- [ ] Tests included
- [ ] No security vulnerabilities

