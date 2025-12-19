# Spring Controller Template

## Standard Controller Structure
```java
package com.example.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/{resource}")
@RequiredArgsConstructor
@Slf4j
@Validated
public class {Resource}Controller {

    private final {Resource}Service service;

    @GetMapping
    public ResponseEntity<PagedResponse<{Resource}Response>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Listing {resources} page={} size={}", page, size);
        return ResponseEntity.ok(service.list(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<{Resource}Response> getById(@PathVariable String id) {
        log.info("Getting {resource} by id={}", id);
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<{Resource}Response> create(
            @Valid @RequestBody Create{Resource}Request request) {
        log.info("Creating {resource}: {}", request);
        var response = service.create(request);
        return ResponseEntity.status(201).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<{Resource}Response> update(
            @PathVariable String id,
            @Valid @RequestBody Update{Resource}Request request) {
        log.info("Updating {resource} id={}: {}", id, request);
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        log.info("Deleting {resource} id={}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

## Conventions
- Use `@Validated` at class level for method parameter validation
- Use `@Valid` on request body DTOs
- Log entry point with relevant parameters
- Return appropriate HTTP status codes
- Use `ResponseEntity` for explicit status control
- Keep controllers thin - delegate to service layer

