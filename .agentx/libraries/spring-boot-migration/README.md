# Spring Boot Migration Library

Migration guides, release notes, and configuration changelogs for Spring Boot version upgrades.

## Contents

| File | Version | Description |
|------|---------|-------------|
| `3.3-release-notes.adoc` | 3.2.x → 3.3.x | Breaking changes, deprecations, new features |
| `3.3-config-changelog.adoc` | 3.2.x → 3.3.x | Property changes and renames |
| `3.4-release-notes.adoc` | 3.3.x → 3.4.x | Breaking changes, deprecations, new features |
| `3.4-config-changelog.adoc` | 3.3.x → 3.4.x | Property changes and renames |
| `3.5-release-notes.adoc` | 3.4.x → 3.5.x | Breaking changes, deprecations, new features |
| `3.5-config-changelog.adoc` | 3.4.x → 3.5.x | Property changes and renames |

## Usage

### CLI

```bash
# Full upgrade analysis
agentx exec be-service --intention upgrade "3.2.12 to 3.5.8"

# Interactive mode (prompts for details)
agentx exec be-service -i upgrade

# Quick breaking changes check
agentx exec be-service "What breaks when upgrading from 3.2 to 3.5?"
```

### VS Code

```
@agentx /exec be-service --intention upgrade "3.2.12 to 3.5.8"
@agentx-backend /exec be-service "Analyze upgrade from 3.2.12 to 3.5.8 for a web-mvc project with Security and JPA"
```

## Upgrade Path: 3.2.12 → 3.5.8

This upgrade spans **3 minor versions**:

```
3.2.12 → 3.3.x → 3.4.x → 3.5.8
```

### Key Changes Per Version

#### 3.2 → 3.3
- Observability improvements
- SSL bundle enhancements
- Service connection updates
- Virtual threads support improvements

#### 3.3 → 3.4
- Structured logging
- RestClient improvements
- MockMvcTester
- Significant dependency updates

#### 3.4 → 3.5
- TBD (check 3.5-release-notes.adoc)

## Source

- **Repository**: https://github.com/spring-projects/spring-boot.wiki.git
- **Path**: releasenotes/
- **Last Updated**: 2025-12-23
