# REST API Design Patterns

## Endpoint Naming
- Use plural nouns: `/users`, `/orders`, `/products`
- Use kebab-case for multi-word: `/order-items`, `/user-profiles`
- Nest resources logically: `/users/{userId}/orders`

## HTTP Methods
| Method | Purpose | Idempotent |
|--------|---------|------------|
| GET | Retrieve resource(s) | Yes |
| POST | Create resource | No |
| PUT | Replace resource | Yes |
| PATCH | Partial update | Yes |
| DELETE | Remove resource | Yes |

## Request/Response Standards

### Request DTOs
```java
public record CreateOrderRequest(
    @NotNull String customerId,
    @NotEmpty List<OrderItemRequest> items,
    @Valid ShippingAddress shippingAddress
) {}
```

### Response DTOs
```java
public record OrderResponse(
    String orderId,
    String customerId,
    List<OrderItemResponse> items,
    OrderStatus status,
    Instant createdAt
) {}
```

## Pagination
Use cursor-based pagination for large datasets:
```json
{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6MTAwfQ==",
    "hasMore": true
  }
}
```

## Versioning
- Use URL path versioning: `/api/v1/users`
- Major version only in URL
- Minor/patch changes are backward compatible

## Status Codes
| Code | Usage |
|------|-------|
| 200 | Success with body |
| 201 | Created |
| 204 | Success no body |
| 400 | Bad request / validation |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 422 | Unprocessable entity |
| 500 | Server error |

