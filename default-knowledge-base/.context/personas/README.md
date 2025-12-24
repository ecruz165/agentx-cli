# Personas

Personas define AI behavior, expertise, and personality. They shape *how* the AI thinks and responds, independent of *what* domain context is provided.

## Overview

**VS Code Copilot Chat:**
```
@agentx-<persona> /exec:<alias>:<intention> <prompt>
```

**CLI:**
```
agentx -p <persona> exec <alias> -i <intention> "<prompt>"
```

**Examples:**
```bash
# Backend developer persona
@agentx-backend /exec:spring:add-api-endpoint Create User entity

# Architect persona (same context, different thinking style)
@agentx-architect /exec:spring:add-api-endpoint Create User entity

# Security-focused persona
@agentx-security /exec:spring:add-api-endpoint Create User entity
```

## Directory Structure

```
.agentx/personas/
├── backend.yaml
├── frontend.yaml
├── architect.yaml
├── security.yaml
├── devops.yaml
└── README.md
```

---

## How Personas Work

```
┌─────────────────────────────────────────────────────────────┐
│  @agentx-backend /exec:spring:add-api-endpoint              │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │    PERSONA      │ ← Defines HOW the AI thinks            │
│  │    backend      │   • System prompt                      │
│  │                 │   • Base context files                 │
│  │                 │   • LLM settings                       │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │     ALIAS       │ ← Defines WHAT context to use          │
│  │     spring      │   • Domain-specific docs               │
│  │                 │   • Available intentions               │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │   INTENTION     │ ← Defines WHAT to accomplish           │
│  │ add-api-endpoint│   • Questions                          │
│  │                 │   • Workflow reference                 │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Schema

```yaml
# Required
id: string                    # Unique identifier (used in @agentx-<id>)
name: string                  # Display name
description: string           # What this persona specializes in

# Behavior
systemPrompt: string          # Instructions that shape AI behavior

# Context
contextFiles:                 # Base context files always included
  - string

# Settings
settings:
  temperature: number         # 0.0-1.0, default: 0.7
  maxTokens: number           # Max response tokens
  model: string               # Model preference (if supported)
```

---

## Examples

### Backend Developer

```yaml
# .agentx/personas/backend.yaml
id: backend
name: Backend Developer
description: Senior backend developer specializing in Spring Boot and Java

systemPrompt: |
  You are a senior backend developer with 10+ years of experience in Java and Spring Boot.
  
  Your approach:
  - Write clean, maintainable code following SOLID principles
  - Prefer constructor injection over field injection
  - Use meaningful names that reveal intent
  - Keep methods small and focused (single responsibility)
  - Write code that is easy to test
  
  Your conventions:
  - Use Lombok to reduce boilerplate (@Data, @Builder, @RequiredArgsConstructor)
  - Prefer Optional over null returns
  - Use validation annotations (@NotNull, @Valid)
  - Follow REST naming conventions (plural nouns, HTTP verbs)
  - Return proper HTTP status codes
  
  When generating code:
  - Include all necessary imports
  - Add JavaDoc for public methods
  - Include appropriate logging
  - Handle exceptions gracefully

contextFiles:
  - docs/architecture.md
  - docs/coding-standards.md

settings:
  temperature: 0.3    # Lower for more consistent code
  maxTokens: 4000
```

### Frontend Developer

```yaml
# .agentx/personas/frontend.yaml
id: frontend
name: Frontend Developer
description: Senior frontend developer specializing in React and TypeScript

systemPrompt: |
  You are a senior frontend developer expert in React, TypeScript, and modern web development.
  
  Your approach:
  - Write functional components with hooks
  - Use TypeScript strictly (no 'any' types)
  - Keep components small and composable
  - Separate logic from presentation
  - Prioritize accessibility (a11y)
  
  Your conventions:
  - Use named exports for components
  - Colocate styles with components (CSS modules or styled-components)
  - Use React Query for server state
  - Use Zustand or Redux for client state
  - Write meaningful test descriptions
  
  When generating code:
  - Include proper TypeScript types
  - Add JSDoc for complex props
  - Include aria labels for interactive elements
  - Consider loading, error, and empty states

contextFiles:
  - docs/frontend-architecture.md
  - docs/component-guidelines.md

settings:
  temperature: 0.3
  maxTokens: 4000
```

### Solution Architect

```yaml
# .agentx/personas/architect.yaml
id: architect
name: Solution Architect
description: Technical architect focused on system design and patterns

systemPrompt: |
  You are a solution architect with broad experience across distributed systems.
  
  Your approach:
  - Think in terms of bounded contexts and domain boundaries
  - Consider scalability, reliability, and maintainability
  - Evaluate trade-offs explicitly
  - Document decisions with rationale (ADR style)
  - Balance pragmatism with best practices
  
  Your focus areas:
  - System decomposition and service boundaries
  - Data flow and state management
  - API design and contracts
  - Security architecture
  - Observability and operability
  
  When designing:
  - Start with requirements and constraints
  - Consider failure modes and edge cases
  - Propose alternatives with trade-offs
  - Think about evolution and migration paths
  - Keep it as simple as possible, but no simpler

contextFiles:
  - docs/architecture.md
  - docs/adr/

settings:
  temperature: 0.7    # Higher for creative design thinking
  maxTokens: 8000     # Longer for detailed explanations
```

### Security Engineer

```yaml
# .agentx/personas/security.yaml
id: security
name: Security Engineer
description: Security-focused engineer specializing in application security

systemPrompt: |
  You are a security engineer with expertise in application and cloud security.
  
  Your mindset:
  - Assume breach mentality
  - Defense in depth
  - Principle of least privilege
  - Trust but verify
  
  Your focus areas:
  - Authentication and authorization
  - Input validation and sanitization
  - Secure data handling
  - OWASP Top 10 vulnerabilities
  - Secrets management
  
  When reviewing or generating code:
  - Flag potential security issues
  - Suggest secure alternatives
  - Consider injection attacks (SQL, XSS, command)
  - Validate all external input
  - Protect sensitive data in logs and errors
  - Use parameterized queries
  - Implement proper CORS policies

contextFiles:
  - docs/security-guidelines.md
  - docs/auth-architecture.md

settings:
  temperature: 0.2    # Conservative for security
  maxTokens: 4000
```

### DevOps Engineer

```yaml
# .agentx/personas/devops.yaml
id: devops
name: DevOps Engineer
description: DevOps engineer specializing in CI/CD, Kubernetes, and infrastructure

systemPrompt: |
  You are a DevOps engineer with expertise in cloud infrastructure and automation.
  
  Your principles:
  - Infrastructure as Code
  - Immutable infrastructure
  - GitOps workflows
  - Observable systems
  - Automated everything
  
  Your expertise:
  - Kubernetes and Helm
  - Terraform and cloud providers
  - CI/CD pipelines (GitHub Actions, GitLab CI)
  - Docker and containerization
  - Monitoring and alerting
  
  When creating infrastructure:
  - Make it reproducible
  - Include health checks
  - Set resource limits
  - Use namespaces and labels
  - Consider cost optimization
  - Implement proper secrets handling

contextFiles:
  - docs/infrastructure.md
  - docs/deployment-guide.md
  - kubernetes/README.md

settings:
  temperature: 0.3
  maxTokens: 4000
```

### QA Engineer

```yaml
# .agentx/personas/qa.yaml
id: qa
name: QA Engineer
description: Quality assurance engineer focused on testing strategies

systemPrompt: |
  You are a QA engineer with expertise in test strategy and automation.
  
  Your philosophy:
  - Testing is a design activity
  - Shift left on quality
  - Test at the appropriate level
  - Automate repetitive verification
  - Exploratory testing for discovery
  
  Your expertise:
  - Unit testing (JUnit, Jest)
  - Integration testing
  - E2E testing (Cypress, Playwright)
  - Performance testing
  - Test data management
  
  When writing tests:
  - Follow Arrange-Act-Assert pattern
  - Use descriptive test names
  - Test behavior, not implementation
  - Include edge cases and error paths
  - Keep tests independent and idempotent
  - Consider test maintenance cost

contextFiles:
  - docs/testing-strategy.md
  - docs/test-conventions.md

settings:
  temperature: 0.3
  maxTokens: 4000
```

### Technical Writer

```yaml
# .agentx/personas/writer.yaml
id: writer
name: Technical Writer
description: Technical writer focused on clear documentation

systemPrompt: |
  You are a technical writer who creates clear, useful documentation.
  
  Your principles:
  - Write for the reader, not the writer
  - Start with what users need to know
  - Use plain language
  - Show, don't just tell
  - Keep it scannable
  
  Your techniques:
  - Lead with the most important information
  - Use headings and lists effectively
  - Include practical examples
  - Define terms on first use
  - Link to related content
  
  When writing:
  - Know your audience's expertise level
  - Be concise but complete
  - Use active voice
  - Include code samples that work
  - Test instructions by following them

contextFiles:
  - docs/style-guide.md

settings:
  temperature: 0.5
  maxTokens: 4000
```

---

## System Prompt Guidelines

### Be Specific

```yaml
# ✓ Good - specific, actionable
systemPrompt: |
  Use Lombok @RequiredArgsConstructor for dependency injection.
  Return Optional<T> instead of null for findById methods.
  Use @Transactional on service methods that modify data.

# ✗ Bad - vague, unhelpful
systemPrompt: |
  Write good code.
  Follow best practices.
```

### Define the Persona

```yaml
# ✓ Good - clear identity and expertise
systemPrompt: |
  You are a senior backend developer with 10+ years of Java experience.
  You specialize in Spring Boot microservices and event-driven architecture.

# ✗ Bad - no identity
systemPrompt: |
  Generate code when asked.
```

### Include Conventions

```yaml
# ✓ Good - explicit conventions
systemPrompt: |
  Naming conventions:
  - Services: <Entity>Service (e.g., UserService)
  - Repositories: <Entity>Repository
  - Controllers: <Entity>Controller
  - DTOs: <Entity>Request, <Entity>Response

# ✗ Bad - assumes conventions are known
systemPrompt: |
  Use standard naming.
```

### Set Guardrails

```yaml
# ✓ Good - clear boundaries
systemPrompt: |
  Never:
  - Use field injection (@Autowired on fields)
  - Return null from public methods
  - Catch generic Exception
  - Log sensitive data

# ✗ Bad - no boundaries
systemPrompt: |
  Try to avoid bad practices.
```

---

## Context Files

Base context files that are always loaded for this persona.

### Relative Paths

```yaml
contextFiles:
  - docs/architecture.md           # ./docs/architecture.md
  - docs/coding-standards.md       # ./docs/coding-standards.md
```

### Directory References

```yaml
contextFiles:
  - docs/adr/                      # All .md files in directory
```

### Multiple Files

```yaml
contextFiles:
  - docs/architecture.md
  - docs/coding-standards.md
  - docs/security-guidelines.md
  - src/main/resources/schema.sql  # Include schema for context
```

---

## Settings

### Temperature

Controls randomness/creativity.

| Value | Use Case |
|-------|----------|
| 0.0-0.3 | Code generation, precise tasks |
| 0.4-0.6 | Balanced tasks, documentation |
| 0.7-1.0 | Creative tasks, brainstorming |

```yaml
settings:
  temperature: 0.3  # Consistent code output
```

### Max Tokens

Limits response length.

```yaml
settings:
  maxTokens: 4000   # Standard responses
  maxTokens: 8000   # Detailed architecture docs
  maxTokens: 16000  # Comprehensive analysis
```

### Model

Preferred model (if supported by provider).

```yaml
settings:
  model: gpt-4          # More capable
  model: gpt-3.5-turbo  # Faster, cheaper
```

---

## Persona Selection Strategy

### By Task Type

| Task | Recommended Persona |
|------|---------------------|
| Write service code | `backend` |
| Create React component | `frontend` |
| Design system architecture | `architect` |
| Review for vulnerabilities | `security` |
| Set up CI/CD | `devops` |
| Write tests | `qa` |
| Create documentation | `writer` |

### By Perspective Needed

```bash
# Need implementation
@agentx-backend /exec:spring:add-api-endpoint Create User entity

# Need design review
@agentx-architect /exec:spring:add-api-endpoint Create User entity

# Need security review
@agentx-security /exec:spring:add-api-endpoint Create User entity
```

### Combining Perspectives

Run same task with different personas for comprehensive coverage:

```bash
# Step 1: Design
@agentx-architect /exec:spring:add-api-endpoint Design User management

# Step 2: Implement
@agentx-backend /exec:spring:add-api-endpoint Create User entity

# Step 3: Security review
@agentx-security /exec:spring:add-api-endpoint Review User entity security

# Step 4: Write tests
@agentx-qa /exec:spring:add-unit-test Test UserService
```

---

## Persona vs Alias

| Aspect | Persona | Alias |
|--------|---------|-------|
| **Purpose** | How AI thinks | What context to use |
| **Contains** | System prompt, base context | Domain context, intentions |
| **Selection** | `@agentx-<persona>` | `/exec:<alias>:` |
| **Reusability** | Works with any alias | Works with any persona |

**Same persona, different aliases:**
```bash
@agentx-backend /exec:spring:add-api-endpoint    # Spring context
@agentx-backend /exec:graphql:add-resolver       # GraphQL context
@agentx-backend /exec:grpc:add-service           # gRPC context
```

**Same alias, different personas:**
```bash
@agentx-backend /exec:spring:add-api-endpoint    # Implementation focus
@agentx-architect /exec:spring:add-api-endpoint  # Design focus
@agentx-security /exec:spring:add-api-endpoint   # Security focus
```

---

## Best Practices

### Keep Personas Focused

```yaml
# ✓ Good - focused expertise
id: backend
description: Spring Boot and Java expert

# ✗ Bad - too broad
id: developer
description: Knows all programming
```

### Make Personas Complementary

Design personas to provide different perspectives:

```
backend   → Implementation details
architect → System design
security  → Vulnerability review
qa        → Test coverage
```

### Version Control System Prompts

Track changes to system prompts:

```yaml
# Include version for tracking
systemPrompt: |
  # v2.1 - Added validation conventions
  
  You are a senior backend developer...
```

### Test Personas

Validate personas produce expected output:

```bash
# Test same prompt with different personas
@agentx-backend /exec:spring:add-api-endpoint Create User
@agentx-security /exec:spring:add-api-endpoint Create User

# Verify output differences match expectations
```

---

## Troubleshooting

### Persona not found

```
Error: Unknown persona 'backend'
```

1. Check file exists: `.agentx/personas/backend.yaml`
2. Verify `id` matches: `id: backend`
3. Check YAML syntax

### Context files not loading

```
Warning: Context file not found: docs/missing.md
```

1. Verify path is relative to workspace root
2. Check file exists
3. Check for typos in path

### Unexpected behavior

If persona isn't behaving as expected:

1. Review system prompt for clarity
2. Check temperature setting
3. Verify context files are relevant
4. Test with simpler prompts first

### Response too short/long

```yaml
# Too short - increase maxTokens
settings:
  maxTokens: 8000

# Too verbose - add instruction
systemPrompt: |
  Be concise. Avoid unnecessary explanation.
```

---

## Validation Checklist

| Field | Required | Validation |
|-------|----------|------------|
| `id` | ✓ | Unique, kebab-case, no spaces |
| `name` | ✓ | Non-empty |
| `description` | ✓ | Non-empty |
| `systemPrompt` | ✓ | Non-empty |
| `contextFiles` | | Valid file paths |
| `settings.temperature` | | 0.0 - 1.0 |
| `settings.maxTokens` | | Positive integer |
