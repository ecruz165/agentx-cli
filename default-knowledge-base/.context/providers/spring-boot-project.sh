#!/bin/bash
# Context provider: Detect Spring Boot project info
# Outputs JSON with project details for use in intentions

set -e

WORKSPACE="${1:-.}"

# Initialize result
result='{}'

# Check for Maven project
if [[ -f "$WORKSPACE/pom.xml" ]]; then
  BUILD_TOOL="maven"

  # Extract Spring Boot version from pom.xml
  # Try parent version first (spring-boot-starter-parent)
  SPRING_BOOT_VERSION=$(grep -A2 '<parent>' "$WORKSPACE/pom.xml" 2>/dev/null | \
    grep -oP '(?<=<version>)[^<]+' | head -1 || echo "")

  # If not found in parent, try spring-boot.version property
  if [[ -z "$SPRING_BOOT_VERSION" ]] || [[ ! "$SPRING_BOOT_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
    SPRING_BOOT_VERSION=$(grep -oP '(?<=<spring-boot.version>)[^<]+' "$WORKSPACE/pom.xml" 2>/dev/null || echo "")
  fi

  # Detect Java version
  JAVA_VERSION=$(grep -oP '(?<=<java.version>)[^<]+' "$WORKSPACE/pom.xml" 2>/dev/null || \
    grep -oP '(?<=<maven.compiler.source>)[^<]+' "$WORKSPACE/pom.xml" 2>/dev/null || echo "")

  # Detect Spring features from dependencies
  FEATURES=""
  [[ $(grep -c 'spring-boot-starter-security' "$WORKSPACE/pom.xml" 2>/dev/null) -gt 0 ]] && FEATURES="$FEATURES,security"
  [[ $(grep -c 'spring-boot-starter-data-jpa' "$WORKSPACE/pom.xml" 2>/dev/null) -gt 0 ]] && FEATURES="$FEATURES,data-jpa"
  [[ $(grep -c 'spring-boot-starter-data-mongodb' "$WORKSPACE/pom.xml" 2>/dev/null) -gt 0 ]] && FEATURES="$FEATURES,data-mongodb"
  [[ $(grep -c 'spring-boot-starter-actuator' "$WORKSPACE/pom.xml" 2>/dev/null) -gt 0 ]] && FEATURES="$FEATURES,actuator"
  [[ $(grep -c 'spring-cloud' "$WORKSPACE/pom.xml" 2>/dev/null) -gt 0 ]] && FEATURES="$FEATURES,cloud"
  [[ $(grep -c 'spring-boot-starter-batch' "$WORKSPACE/pom.xml" 2>/dev/null) -gt 0 ]] && FEATURES="$FEATURES,batch"
  [[ $(grep -c 'spring-kafka' "$WORKSPACE/pom.xml" 2>/dev/null) -gt 0 ]] && FEATURES="$FEATURES,kafka"
  [[ $(grep -c 'spring-boot-starter-amqp' "$WORKSPACE/pom.xml" 2>/dev/null) -gt 0 ]] && FEATURES="$FEATURES,amqp"
  [[ $(grep -c 'spring-boot-starter-graphql' "$WORKSPACE/pom.xml" 2>/dev/null) -gt 0 ]] && FEATURES="$FEATURES,graphql"
  [[ $(grep -c 'spring-boot-starter-oauth2' "$WORKSPACE/pom.xml" 2>/dev/null) -gt 0 ]] && FEATURES="$FEATURES,oauth2"
  [[ $(grep -c 'spring-boot-starter-webflux' "$WORKSPACE/pom.xml" 2>/dev/null) -gt 0 ]] && FEATURES="$FEATURES,webflux"
  FEATURES="${FEATURES#,}"  # Remove leading comma

  # Detect project type
  if [[ $(grep -c 'spring-boot-starter-webflux' "$WORKSPACE/pom.xml" 2>/dev/null) -gt 0 ]]; then
    PROJECT_TYPE="webflux"
  elif [[ $(grep -c 'spring-boot-starter-web' "$WORKSPACE/pom.xml" 2>/dev/null) -gt 0 ]]; then
    PROJECT_TYPE="web-mvc"
  elif [[ $(grep -c 'spring-boot-starter-batch' "$WORKSPACE/pom.xml" 2>/dev/null) -gt 0 ]]; then
    PROJECT_TYPE="batch"
  else
    PROJECT_TYPE="cli"
  fi

# Check for Gradle project
elif [[ -f "$WORKSPACE/build.gradle" ]] || [[ -f "$WORKSPACE/build.gradle.kts" ]]; then
  BUILD_TOOL="gradle"
  GRADLE_FILE="$WORKSPACE/build.gradle"
  [[ -f "$WORKSPACE/build.gradle.kts" ]] && BUILD_TOOL="gradle-kotlin" && GRADLE_FILE="$WORKSPACE/build.gradle.kts"
  [[ "$BUILD_TOOL" == "gradle" ]] && BUILD_TOOL="gradle-groovy"

  # Extract Spring Boot version
  SPRING_BOOT_VERSION=$(grep -oP "springBootVersion\s*=\s*['\"]?\K[0-9]+\.[0-9]+\.[0-9]+[^'\"]*" "$GRADLE_FILE" 2>/dev/null || \
    grep -oP "org\.springframework\.boot.*version\s*['\"]?\K[0-9]+\.[0-9]+\.[0-9]+[^'\"]*" "$GRADLE_FILE" 2>/dev/null || echo "")

  # Try gradle.properties
  if [[ -z "$SPRING_BOOT_VERSION" ]] && [[ -f "$WORKSPACE/gradle.properties" ]]; then
    SPRING_BOOT_VERSION=$(grep -oP "springBootVersion\s*=\s*\K[0-9]+\.[0-9]+\.[0-9]+.*" "$WORKSPACE/gradle.properties" 2>/dev/null || echo "")
  fi

  # Detect Java version
  JAVA_VERSION=$(grep -oP "sourceCompatibility\s*=\s*['\"]?\K[0-9]+" "$GRADLE_FILE" 2>/dev/null || \
    grep -oP "JavaVersion\.VERSION_\K[0-9]+" "$GRADLE_FILE" 2>/dev/null || echo "")

  # Detect features
  FEATURES=""
  [[ $(grep -c 'spring-boot-starter-security' "$GRADLE_FILE" 2>/dev/null) -gt 0 ]] && FEATURES="$FEATURES,security"
  [[ $(grep -c 'spring-boot-starter-data-jpa' "$GRADLE_FILE" 2>/dev/null) -gt 0 ]] && FEATURES="$FEATURES,data-jpa"
  [[ $(grep -c 'spring-boot-starter-actuator' "$GRADLE_FILE" 2>/dev/null) -gt 0 ]] && FEATURES="$FEATURES,actuator"
  FEATURES="${FEATURES#,}"

  PROJECT_TYPE="web-mvc"
else
  # Not a Java project
  echo '{"isSpringBootProject": false, "error": "No pom.xml or build.gradle found"}'
  exit 0
fi

# Check if Spring Boot is present
if [[ -z "$SPRING_BOOT_VERSION" ]]; then
  echo '{"isSpringBootProject": false, "error": "Spring Boot dependency not found"}'
  exit 0
fi

# Get latest Spring Boot version (3.5.x line)
LATEST_VERSION="3.5.8"

# Output JSON
cat <<EOF
{
  "isSpringBootProject": true,
  "buildTool": "$BUILD_TOOL",
  "currentVersion": "$SPRING_BOOT_VERSION",
  "latestVersion": "$LATEST_VERSION",
  "javaVersion": "$JAVA_VERSION",
  "projectType": "$PROJECT_TYPE",
  "features": [$(echo "$FEATURES" | sed 's/,/","/g' | sed 's/^/"/' | sed 's/$/"/' | sed 's/""//')],
  "buildFile": "$(basename "$GRADLE_FILE" 2>/dev/null || echo "pom.xml")"
}
EOF
