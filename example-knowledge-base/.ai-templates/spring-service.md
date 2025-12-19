# Spring Service Template

## Standard Service Structure
```java
package com.example.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class {Resource}Service {

    private final {Resource}Repository repository;
    private final {Resource}Mapper mapper;
    // Inject integration services for downstream calls
    private final PaymentIntegrationService paymentService;

    @Transactional(readOnly = true)
    public PagedResponse<{Resource}Response> list(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var entities = repository.findAll(pageable);
        return PagedResponse.of(entities.map(mapper::toResponse));
    }

    @Transactional(readOnly = true)
    public {Resource}Response getById(String id) {
        return repository.findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("{Resource}", id));
    }

    @Transactional
    public {Resource}Response create(Create{Resource}Request request) {
        // Validate business rules
        validateCreateRequest(request);
        
        // Map to entity
        var entity = mapper.toEntity(request);
        
        // Call downstream if needed
        if (request.requiresPayment()) {
            var paymentResult = paymentService.processPayment(
                mapper.toPaymentRequest(request));
            entity.setPaymentId(paymentResult.id());
        }
        
        // Save and return
        var saved = repository.save(entity);
        log.info("Created {resource} id={}", saved.getId());
        return mapper.toResponse(saved);
    }

    @Transactional
    public {Resource}Response update(String id, Update{Resource}Request request) {
        var entity = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("{Resource}", id));
        
        mapper.updateEntity(entity, request);
        var saved = repository.save(entity);
        log.info("Updated {resource} id={}", id);
        return mapper.toResponse(saved);
    }

    @Transactional
    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("{Resource}", id);
        }
        repository.deleteById(id);
        log.info("Deleted {resource} id={}", id);
    }

    private void validateCreateRequest(Create{Resource}Request request) {
        // Business validation logic
    }
}
```

## Conventions
- Use `@Transactional(readOnly = true)` for read operations
- Use `@Transactional` for write operations
- Throw domain exceptions, not generic ones
- Log significant state changes
- Keep business logic in service, not controller

