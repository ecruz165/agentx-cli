# DTO Template

## Request DTOs
Use Java records with validation annotations:

```java
package com.example.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

// Create request
public record Create{Resource}Request(
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be at most 100 characters")
    String name,
    
    @NotNull(message = "Type is required")
    {Resource}Type type,
    
    @Valid
    @NotNull(message = "Details are required")
    {Resource}DetailsRequest details,
    
    @Size(max = 500, message = "Description must be at most 500 characters")
    String description
) {}

// Update request (all fields optional)
public record Update{Resource}Request(
    @Size(max = 100, message = "Name must be at most 100 characters")
    String name,
    
    {Resource}Type type,
    
    @Valid
    {Resource}DetailsRequest details,
    
    @Size(max = 500, message = "Description must be at most 500 characters")
    String description
) {}

// Nested request
public record {Resource}DetailsRequest(
    @NotBlank String field1,
    @Positive Integer field2
) {}
```

## Response DTOs
```java
package com.example.api.dto;

import java.time.Instant;
import java.util.List;

public record {Resource}Response(
    String id,
    String name,
    {Resource}Type type,
    {Resource}DetailsResponse details,
    String description,
    {Resource}Status status,
    Instant createdAt,
    Instant updatedAt
) {}

public record {Resource}DetailsResponse(
    String field1,
    Integer field2
) {}

// Paged response wrapper
public record PagedResponse<T>(
    List<T> data,
    PaginationInfo pagination
) {
    public static <T> PagedResponse<T> of(Page<T> page) {
        return new PagedResponse<>(
            page.getContent(),
            new PaginationInfo(
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext()
            )
        );
    }
}

public record PaginationInfo(
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean hasNext
) {}
```

## Conventions
- Use records for immutability
- Validate at API boundary with Jakarta Validation
- Keep request/response DTOs separate from entities
- Use MapStruct for entity ↔ DTO mapping

