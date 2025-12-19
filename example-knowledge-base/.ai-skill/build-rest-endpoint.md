# Skill: Build REST Endpoint

## Overview
This skill guides you through building a complete REST API endpoint following clean layered architecture with proper separation of concerns.

## ⚠️ IMPORTANT: Requirements Check First

**Before generating ANY code, verify all required information is provided.**

### Required Information Checklist

| Category | Required | Question if Missing |
|----------|----------|---------------------|
| **Resource** | Resource/entity name | "What is the name of the resource? (e.g., Order, Product, User)" |
| **Endpoint** | HTTP method | "What HTTP method? (GET, POST, PUT, PATCH, DELETE)" |
| **Endpoint** | URL path | "What is the endpoint path? (e.g., /api/v1/orders)" |
| **Request** | Request fields | "What fields should the request body contain? Please list field names and types." |
| **Request** | Required vs optional | "Which request fields are required vs optional?" |
| **Request** | Validation rules | "Are there any validation rules? (e.g., max length, format, range)" |
| **Response** | Response fields | "What fields should be returned in the response?" |
| **Data** | Persist to database? | "Should this data be persisted to a database?" |
| **Integration** | Downstream calls | "Does this endpoint need to call any downstream/external services? If yes, which ones and what data?" |
| **Errors** | Error scenarios | "What error scenarios should be handled? (e.g., not found, validation failed, downstream unavailable)" |

### Pre-Canned Questions for Incomplete Prompts

**If prompt is vague like "build an orders endpoint":**
```
I'd be happy to help build the orders endpoint. To generate the correct code, I need a few details:

1. **Operation**: What operation? (Create order, Get order, Update order, List orders?)
2. **Request payload**: What data will the client send? For example:
   - Customer ID
   - List of items (product ID, quantity)
   - Shipping address
   - Payment method
3. **Downstream services**: Should creating an order:
   - Call a payment service?
   - Call an inventory service?
   - Send notifications?
4. **Response**: What should be returned? (Order ID, status, total amount?)

Please provide these details so I can generate accurate code.
```

**If missing request fields:**
```
What fields should the request contain? For example:
- String fields (customerId, notes)
- Nested objects (shippingAddress with street, city, postalCode)
- Lists (items with productId, quantity, price)
- Enums (priority: LOW, MEDIUM, HIGH)
```

**If missing downstream integration details:**
```
You mentioned calling the payment service. I need to know:
1. What data do we send to the payment service? (amount, customerId, orderId?)
2. What do we expect back? (paymentId, status, transactionRef?)
3. What happens if payment fails? (reject order, queue for retry, partial state?)
```

**If missing validation rules:**
```
What validation rules should apply?
- Required fields?
- String length limits? (e.g., notes max 500 chars)
- Numeric ranges? (e.g., quantity > 0)
- Format patterns? (e.g., email, phone)
- Business rules? (e.g., max 100 items per order)
```

### Decision: Proceed or Ask

**ASK questions if:**
- Resource name is unclear
- Request/response fields not specified
- Downstream integration mentioned but not detailed
- Critical business rules might exist

**PROCEED with sensible defaults if:**
- Minor details like field lengths (use reasonable defaults)
- Standard patterns (use REST conventions)
- Common validations (@NotNull, @NotBlank)

---

## Architecture Layers
```
┌─────────────────────────────────────────────────────────────┐
│  API Layer                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Request DTO │  │ Response DTO│  │ Controller          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Domain Layer                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Domain Model│  │ Service     │  │ Domain Exceptions   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ DAO/Entity  │  │ DataService │  │ Repository          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Integration Layer                                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ External Service Clients (WebClient + Circuit Breaker)  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Requirements Confirmation

After gathering information, confirm understanding:

```
## Confirmed Requirements

**Endpoint:** POST /api/v1/orders

**Request:**
- customerId (string, required)
- items (array, required, min 1)
  - productId (string, required)
  - quantity (integer, required, > 0)
- shippingAddress (object, required)
  - street, city, postalCode, country (all required)
- notes (string, optional, max 500 chars)

**Response:**
- id, customerId, items, shippingAddress
- status (PENDING → CONFIRMED)
- totalAmount (calculated)
- paymentId (from payment service)
- createdAt, updatedAt

**Downstream:**
- Payment Service: POST /v1/payments
  - Send: customerId, amount
  - Receive: paymentId, status

**Errors:**
- 400: Validation errors
- 502: Payment service unavailable

Shall I proceed with code generation?
```

---

## Step 2: Define Request Model (DTO)

**File:** `src/main/java/com/example/api/dto/Create{Resource}Request.java`

```java
package com.example.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

/**
 * Request DTO for creating a {Resource}.
 * Validated at API boundary - contains only what client sends.
 */
public record Create{Resource}Request(
    @NotBlank(message = "Customer ID is required")
    String customerId,

    @NotEmpty(message = "At least one item is required")
    @Valid
    List<{Resource}ItemRequest> items,

    @Valid
    @NotNull(message = "Shipping address is required")
    AddressRequest shippingAddress,

    @Size(max = 500, message = "Notes must be at most 500 characters")
    String notes
) {}

public record {Resource}ItemRequest(
    @NotBlank String productId,
    @Positive int quantity,
    @PositiveOrZero BigDecimal unitPrice
) {}

public record AddressRequest(
    @NotBlank String street,
    @NotBlank String city,
    @NotBlank String postalCode,
    @NotBlank String country
) {}
```

**Checklist:**
- [ ] Use Java records for immutability
- [ ] Add Jakarta Validation annotations on all fields
- [ ] Nest complex objects as separate records
- [ ] Use `@Valid` for nested validation
- [ ] Add meaningful validation messages

---

## Step 3: Define Response Model (DTO)

**File:** `src/main/java/com/example/api/dto/{Resource}Response.java`

```java
package com.example.api.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Response DTO for {Resource}.
 * Contains only what client should see - no internal details.
 */
public record {Resource}Response(
    String id,
    String customerId,
    List<{Resource}ItemResponse> items,
    AddressResponse shippingAddress,
    {Resource}Status status,
    BigDecimal totalAmount,
    String notes,
    Instant createdAt,
    Instant updatedAt
) {}

public record {Resource}ItemResponse(
    String productId,
    String productName,
    int quantity,
    BigDecimal unitPrice,
    BigDecimal subtotal
) {}

public record AddressResponse(
    String street,
    String city,
    String postalCode,
    String country
) {}

public enum {Resource}Status {
    PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
}
```

**Checklist:**
- [ ] Use Java records
- [ ] Include all fields client needs
- [ ] Exclude internal/sensitive fields
- [ ] Use appropriate types (Instant for timestamps, BigDecimal for money)
- [ ] Define enums for status fields

---

## Step 4: Define Domain Model

**File:** `src/main/java/com/example/domain/model/{Resource}.java`

```java
package com.example.domain.model;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Domain model for {Resource}.
 * Contains business logic and domain rules.
 * Independent of API and persistence concerns.
 */
@Data
@Builder
public class {Resource} {
    private String id;
    private String customerId;
    private List<{Resource}Item> items;
    private Address shippingAddress;
    private {Resource}Status status;
    private BigDecimal totalAmount;
    private String notes;
    private String paymentId;  // From downstream payment service
    private Instant createdAt;
    private Instant updatedAt;

    // Domain behavior
    public void calculateTotal() {
        this.totalAmount = items.stream()
            .map({Resource}Item::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public boolean canBeCancelled() {
        return status == {Resource}Status.PENDING ||
               status == {Resource}Status.CONFIRMED;
    }

    public void confirm(String paymentId) {
        if (this.status != {Resource}Status.PENDING) {
            throw new IllegalStateException("Can only confirm pending {resource}s");
        }
        this.paymentId = paymentId;
        this.status = {Resource}Status.CONFIRMED;
    }
}

@Data
@Builder
public class {Resource}Item {
    private String productId;
    private String productName;
    private int quantity;
    private BigDecimal unitPrice;

    public BigDecimal getSubtotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}

@Data
@Builder
public class Address {
    private String street;
    private String city;
    private String postalCode;
    private String country;
}
```

**Checklist:**
- [ ] Use Lombok `@Data` and `@Builder`
- [ ] Include business methods (not just data)
- [ ] Keep domain logic here, not in service
- [ ] Independent of JPA annotations (that's for DAO)

---

## Step 5: Define Controller

**File:** `src/main/java/com/example/api/controller/{Resource}Controller.java`

```java
package com.example.api.controller;

import com.example.api.dto.*;
import com.example.api.mapper.{Resource}ApiMapper;
import com.example.domain.service.{Resource}Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/{resources}")
@RequiredArgsConstructor
@Validated
@Slf4j
public class {Resource}Controller {

    private final {Resource}Service service;
    private final {Resource}ApiMapper mapper;

    @PostMapping
    public ResponseEntity<{Resource}Response> create(
            @Valid @RequestBody Create{Resource}Request request) {
        log.info("Creating {resource} for customer={}", request.customerId());

        var domain = mapper.toDomain(request);
        var created = service.create(domain);
        var response = mapper.toResponse(created);

        log.info("Created {resource} id={}", response.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<{Resource}Response> getById(@PathVariable String id) {
        log.info("Getting {resource} id={}", id);
        var domain = service.getById(id);
        return ResponseEntity.ok(mapper.toResponse(domain));
    }
}
```

**Checklist:**
- [ ] Thin controller - only HTTP concerns
- [ ] Use mapper to convert DTO ↔ Domain
- [ ] Add validation with `@Valid`
- [ ] Log entry/exit with key identifiers
- [ ] Return appropriate HTTP status codes

---

## Step 6: Define Service

**File:** `src/main/java/com/example/domain/service/{Resource}Service.java`

```java
package com.example.domain.service;

import com.example.domain.model.*;
import com.example.data.{Resource}DataService;
import com.example.integration.PaymentIntegrationService;
import com.example.exception.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class {Resource}Service {

    private final {Resource}DataService dataService;
    private final PaymentIntegrationService paymentService;

    @Transactional
    public {Resource} create({Resource} {resource}) {
        // 1. Business validation
        validateCreate({resource});

        // 2. Calculate derived fields
        {resource}.calculateTotal();
        {resource}.setStatus({Resource}Status.PENDING);

        // 3. Call downstream payment service
        var paymentResult = paymentService.processPayment(
            {resource}.getCustomerId(),
            {resource}.getTotalAmount()
        );

        // 4. Update domain with payment result
        {resource}.confirm(paymentResult.paymentId());

        // 5. Persist via data service
        var saved = dataService.save({resource});

        log.info("Created {resource} id={} paymentId={}",
            saved.getId(), saved.getPaymentId());
        return saved;
    }

    @Transactional(readOnly = true)
    public {Resource} getById(String id) {
        return dataService.findById(id)
            .orElseThrow(() -> new {Resource}NotFoundException(id));
    }

    private void validateCreate({Resource} {resource}) {
        if ({resource}.getItems() == null || {resource}.getItems().isEmpty()) {
            throw new {Resource}ValidationException("At least one item required");
        }
        // Additional business rules...
    }
}
```

**Checklist:**
- [ ] Orchestrates domain logic
- [ ] Calls data service for persistence
- [ ] Calls integration services for downstream
- [ ] Transaction boundaries defined here
- [ ] Business validation before processing

---

## Step 7: Define API Mapper (Request DTO → Domain, Domain → Response DTO)

**File:** `src/main/java/com/example/api/mapper/{Resource}ApiMapper.java`

```java
package com.example.api.mapper;

import com.example.api.dto.*;
import com.example.domain.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface {Resource}ApiMapper {

    // Request DTO → Domain
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "paymentId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    {Resource} toDomain(Create{Resource}Request request);

    {Resource}Item toDomain({Resource}ItemRequest request);
    Address toDomain(AddressRequest request);

    // Domain → Response DTO
    {Resource}Response toResponse({Resource} domain);
    {Resource}ItemResponse toResponse({Resource}Item item);
    AddressResponse toResponse(Address address);
}
```

**Checklist:**
- [ ] Use MapStruct for compile-time safety
- [ ] Ignore fields that service will set
- [ ] Map nested objects
- [ ] Spring component model for injection

---

## Step 8: Define DataService

**File:** `src/main/java/com/example/data/{Resource}DataService.java`

```java
package com.example.data;

import com.example.data.entity.{Resource}Entity;
import com.example.data.mapper.{Resource}DataMapper;
import com.example.data.repository.{Resource}Repository;
import com.example.domain.model.{Resource};
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class {Resource}DataService {

    private final {Resource}Repository repository;
    private final {Resource}DataMapper mapper;

    public {Resource} save({Resource} domain) {
        var entity = mapper.toEntity(domain);
        var saved = repository.save(entity);
        return mapper.toDomain(saved);
    }

    public Optional<{Resource}> findById(String id) {
        return repository.findById(id)
            .map(mapper::toDomain);
    }

    public boolean existsById(String id) {
        return repository.existsById(id);
    }

    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
```

**Checklist:**
- [ ] Wraps repository with domain mapping
- [ ] Domain objects in, domain objects out
- [ ] No JPA entities leak to service layer

---

## Step 9: Define DAO/Entity

**File:** `src/main/java/com/example/data/entity/{Resource}Entity.java`

```java
package com.example.data.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "{resources}")
@Data
public class {Resource}Entity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String customerId;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "{resource}_id")
    private List<{Resource}ItemEntity> items;

    @Embedded
    private AddressEmbeddable shippingAddress;

    @Enumerated(EnumType.STRING)
    private {Resource}StatusEntity status;

    @Column(precision = 12, scale = 2)
    private BigDecimal totalAmount;

    private String notes;
    private String paymentId;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}

@Entity
@Table(name = "{resource}_items")
@Data
public class {Resource}ItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String productId;
    private String productName;
    private int quantity;

    @Column(precision = 10, scale = 2)
    private BigDecimal unitPrice;
}

@Embeddable
@Data
public class AddressEmbeddable {
    private String street;
    private String city;
    private String postalCode;
    private String country;
}
```

---

## Step 10: Define Data Mapper (Domain ↔ DAO)

**File:** `src/main/java/com/example/data/mapper/{Resource}DataMapper.java`

```java
package com.example.data.mapper;

import com.example.data.entity.*;
import com.example.domain.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface {Resource}DataMapper {

    // Domain → Entity (for save)
    {Resource}Entity toEntity({Resource} domain);
    {Resource}ItemEntity toEntity({Resource}Item item);
    AddressEmbeddable toEmbeddable(Address address);
    {Resource}StatusEntity toEntity({Resource}Status status);

    // Entity → Domain (for read)
    {Resource} toDomain({Resource}Entity entity);
    {Resource}Item toDomain({Resource}ItemEntity entity);
    Address toDomain(AddressEmbeddable embeddable);
    {Resource}Status toDomain({Resource}StatusEntity status);
}
```

**Checklist:**
- [ ] Bidirectional mapping
- [ ] Handle enums explicitly if names differ
- [ ] Map embedded objects

---

## Deliverables Summary

| Layer | Files |
|-------|-------|
| **API** | `Create{Resource}Request.java`, `{Resource}Response.java`, `{Resource}Controller.java`, `{Resource}ApiMapper.java` |
| **Domain** | `{Resource}.java`, `{Resource}Service.java`, `{Resource}NotFoundException.java` |
| **Data** | `{Resource}Entity.java`, `{Resource}Repository.java`, `{Resource}DataService.java`, `{Resource}DataMapper.java` |
| **Integration** | `PaymentIntegrationService.java` |

---

## Example Prompt
```
Build a POST /api/v1/orders endpoint that:
- Accepts customer ID, list of items (productId, quantity), shipping address
- Calls payment service to process payment
- Returns order with status, total amount, payment ID
```

