# Technology Stack Reference

## Backend

### Core Framework
- **Spring Boot 3.2+** - Application framework
- **Java 21** - LTS version with virtual threads
- **Gradle** - Build tool

### Web & API
- **Spring WebFlux** - Reactive web framework
- **WebClient** - HTTP client for downstream calls
- **OpenAPI 3.0** - API documentation

### Data
- **Spring Data JPA** - Data access
- **PostgreSQL** - Primary database
- **Flyway** - Database migrations
- **Redis** - Caching

### Resilience
- **Resilience4j** - Circuit breaker, retry, rate limiting
- **Spring Retry** - Retry support

### Security
- **Spring Security** - Authentication/Authorization
- **JWT** - Token-based auth
- **OAuth2** - External auth integration

### Observability
- **Micrometer** - Metrics
- **Spring Actuator** - Health checks
- **Sleuth/Brave** - Distributed tracing
- **Logback** - Logging with JSON format

### Testing
- **JUnit 5** - Unit testing
- **Mockito** - Mocking
- **WireMock** - HTTP mocking
- **Testcontainers** - Integration testing

## Dependencies (build.gradle.kts)
```kotlin
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("io.github.resilience4j:resilience4j-spring-boot3")
    implementation("io.github.resilience4j:resilience4j-reactor")
    
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    
    runtimeOnly("org.postgresql:postgresql")
    
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("io.projectreactor:reactor-test")
    testImplementation("org.testcontainers:postgresql")
    testImplementation("com.github.tomakehurst:wiremock-jre8-standalone")
}
```

## Version Constraints
- Spring Boot: 3.2.x
- Java: 21
- Resilience4j: 2.x
- PostgreSQL: 15+

