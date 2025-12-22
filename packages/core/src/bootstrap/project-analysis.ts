/**
 * Project type and dependency analysis utilities
 * Analyzes projects to detect type, dependencies, and frameworks
 */

import fs from 'fs';
import path from 'path';
import {
  ProjectAnalysisResult,
  ProjectType,
  DependencyInfo,
  DetectedFramework,
  ProjectMarker,
} from './types';
import { detectProjectRoot } from './project-detection';

/**
 * Known framework patterns for detection
 */
const FRAMEWORK_PATTERNS = {
  frontend: {
    react: ['react', 'react-dom'],
    vue: ['vue'],
    angular: ['@angular/core'],
    svelte: ['svelte'],
    nextjs: ['next'],
    nuxt: ['nuxt'],
    gatsby: ['gatsby'],
    remix: ['@remix-run/react'],
    solid: ['solid-js'],
    preact: ['preact'],
  },
  backend: {
    express: ['express'],
    fastify: ['fastify'],
    nestjs: ['@nestjs/core'],
    koa: ['koa'],
    hapi: ['@hapi/hapi'],
    // Java frameworks detected via pom.xml/build.gradle
    springBoot: ['org.springframework.boot:spring-boot-starter'],
    springWebflux: ['org.springframework.boot:spring-boot-starter-webflux'],
    quarkus: ['io.quarkus:quarkus-core'],
    micronaut: ['io.micronaut:micronaut-core'],
  },
  testing: {
    jest: ['jest'],
    vitest: ['vitest'],
    mocha: ['mocha'],
    jasmine: ['jasmine'],
    cypress: ['cypress'],
    playwright: ['@playwright/test'],
    // Java testing frameworks
    junit: ['org.junit.jupiter:junit-jupiter', 'junit:junit'],
    testcontainers: ['org.testcontainers:testcontainers'],
    mockito: ['org.mockito:mockito-core'],
  },
  build: {
    webpack: ['webpack'],
    vite: ['vite'],
    esbuild: ['esbuild'],
    rollup: ['rollup'],
    parcel: ['parcel'],
    turbopack: ['turbopack'],
    tsup: ['tsup'],
  },
};

/**
 * Parse package.json and extract dependency information
 *
 * @param packageJsonPath - Path to package.json
 * @returns Parsed dependencies and metadata
 */
export function parsePackageJson(packageJsonPath: string): {
  name?: string;
  version?: string;
  dependencies: DependencyInfo[];
  frameworks: DetectedFramework[];
  buildTool?: 'npm' | 'yarn' | 'pnpm';
} {
  const result: {
    name?: string;
    version?: string;
    dependencies: DependencyInfo[];
    frameworks: DetectedFramework[];
    buildTool?: 'npm' | 'yarn' | 'pnpm';
  } = {
    dependencies: [],
    frameworks: [],
  };

  try {
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);

    result.name = pkg.name;
    result.version = pkg.version;

    // Extract dependencies
    const depTypes: Array<{ key: string; type: DependencyInfo['type'] }> = [
      { key: 'dependencies', type: 'dependency' },
      { key: 'devDependencies', type: 'devDependency' },
      { key: 'peerDependencies', type: 'peerDependency' },
      { key: 'optionalDependencies', type: 'optionalDependency' },
    ];

    for (const { key, type } of depTypes) {
      if (pkg[key] && typeof pkg[key] === 'object') {
        for (const [name, version] of Object.entries(pkg[key])) {
          result.dependencies.push({
            name,
            version: String(version),
            type,
          });
        }
      }
    }

    // Detect frameworks
    result.frameworks = detectFrameworksFromDeps(result.dependencies);

    // Detect package manager
    const dirPath = path.dirname(packageJsonPath);
    if (fs.existsSync(path.join(dirPath, 'pnpm-lock.yaml'))) {
      result.buildTool = 'pnpm';
    } else if (fs.existsSync(path.join(dirPath, 'yarn.lock'))) {
      result.buildTool = 'yarn';
    } else if (fs.existsSync(path.join(dirPath, 'package-lock.json'))) {
      result.buildTool = 'npm';
    }
  } catch {
    // Return empty result on error
  }

  return result;
}

/**
 * Parse pom.xml and extract dependency information using regex
 *
 * @param pomPath - Path to pom.xml
 * @returns Parsed dependencies and metadata
 */
export function parsePomXml(pomPath: string): {
  name?: string;
  version?: string;
  dependencies: DependencyInfo[];
  frameworks: DetectedFramework[];
} {
  const result: {
    name?: string;
    version?: string;
    dependencies: DependencyInfo[];
    frameworks: DetectedFramework[];
  } = {
    dependencies: [],
    frameworks: [],
  };

  try {
    const content = fs.readFileSync(pomPath, 'utf-8');

    // Extract artifactId as name
    const artifactIdMatch = content.match(/<artifactId>([^<]+)<\/artifactId>/);
    if (artifactIdMatch) {
      result.name = artifactIdMatch[1];
    }

    // Extract version
    const versionMatch = content.match(/<version>([^<]+)<\/version>/);
    if (versionMatch) {
      result.version = versionMatch[1];
    }

    // Extract dependencies
    const dependencyRegex =
      /<dependency>\s*<groupId>([^<]+)<\/groupId>\s*<artifactId>([^<]+)<\/artifactId>(?:\s*<version>([^<]*)<\/version>)?(?:\s*<scope>([^<]*)<\/scope>)?[^]*?<\/dependency>/g;

    let match;
    while ((match = dependencyRegex.exec(content)) !== null) {
      const [, groupId, artifactId, version = '', scope = ''] = match;
      const fullName = `${groupId}:${artifactId}`;

      let type: DependencyInfo['type'] = 'dependency';
      if (scope === 'test') {
        type = 'devDependency';
      } else if (scope === 'provided') {
        type = 'peerDependency';
      } else if (scope === 'optional') {
        type = 'optionalDependency';
      }

      result.dependencies.push({
        name: fullName,
        version: version || 'managed',
        type,
      });
    }

    // Detect frameworks from Java dependencies
    result.frameworks = detectJavaFrameworks(result.dependencies);
  } catch {
    // Return empty result on error
  }

  return result;
}

/**
 * Parse build.gradle and extract dependency information using regex
 *
 * @param gradlePath - Path to build.gradle or build.gradle.kts
 * @returns Parsed dependencies and metadata
 */
export function parseBuildGradle(gradlePath: string): {
  name?: string;
  version?: string;
  dependencies: DependencyInfo[];
  frameworks: DetectedFramework[];
} {
  const result: {
    name?: string;
    version?: string;
    dependencies: DependencyInfo[];
    frameworks: DetectedFramework[];
  } = {
    dependencies: [],
    frameworks: [],
  };

  try {
    const content = fs.readFileSync(gradlePath, 'utf-8');
    const isKotlinDsl = gradlePath.endsWith('.kts');

    // Extract project name from settings.gradle if exists
    const settingsPath = path.join(
      path.dirname(gradlePath),
      isKotlinDsl ? 'settings.gradle.kts' : 'settings.gradle'
    );
    if (fs.existsSync(settingsPath)) {
      const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
      const rootProjectMatch = settingsContent.match(
        isKotlinDsl
          ? /rootProject\.name\s*=\s*"([^"]+)"/
          : /rootProject\.name\s*=\s*['"]([^'"]+)['"]/
      );
      if (rootProjectMatch) {
        result.name = rootProjectMatch[1];
      }
    }

    // Extract version
    const versionMatch = content.match(
      isKotlinDsl ? /version\s*=\s*"([^"]+)"/ : /version\s*=\s*['"]([^'"]+)['"]/
    );
    if (versionMatch) {
      result.version = versionMatch[1];
    }

    // Dependency patterns for both Groovy and Kotlin DSL
    const depPatterns = isKotlinDsl
      ? [
          // Kotlin DSL: implementation("group:artifact:version")
          /(implementation|api|compileOnly|runtimeOnly|testImplementation|testRuntimeOnly)\s*\(\s*"([^"]+)"\s*\)/g,
        ]
      : [
          // Groovy DSL: implementation 'group:artifact:version'
          /(implementation|api|compileOnly|runtimeOnly|testImplementation|testRuntimeOnly)\s+['"]([^'"]+)['"]/g,
          // Groovy DSL: implementation "group:artifact:version"
          /(implementation|api|compileOnly|runtimeOnly|testImplementation|testRuntimeOnly)\s+["']([^"']+)["']/g,
        ];

    const configToType: Record<string, DependencyInfo['type']> = {
      implementation: 'dependency',
      api: 'dependency',
      compileOnly: 'peerDependency',
      runtimeOnly: 'dependency',
      testImplementation: 'devDependency',
      testRuntimeOnly: 'devDependency',
    };

    for (const pattern of depPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const [, config, depString] = match;
        const parts = depString.split(':');

        if (parts.length >= 2) {
          const name = `${parts[0]}:${parts[1]}`;
          const version = parts[2] || 'latest';

          result.dependencies.push({
            name,
            version,
            type: configToType[config] || 'dependency',
          });
        }
      }
    }

    // Detect frameworks from Java dependencies
    result.frameworks = detectJavaFrameworks(result.dependencies);
  } catch {
    // Return empty result on error
  }

  return result;
}

/**
 * Detect frameworks from Node.js/JavaScript dependencies
 */
function detectFrameworksFromDeps(dependencies: DependencyInfo[]): DetectedFramework[] {
  const detected: DetectedFramework[] = [];
  const depNames = new Set(dependencies.map((d) => d.name));
  const depMap = new Map(dependencies.map((d) => [d.name, d]));

  // Check frontend frameworks
  for (const [framework, packages] of Object.entries(FRAMEWORK_PATTERNS.frontend)) {
    for (const pkg of packages) {
      if (depNames.has(pkg)) {
        const dep = depMap.get(pkg);
        detected.push({
          name: framework,
          version: dep?.version,
          type: dep?.type === 'devDependency' ? 'devDependency' : 'runtime',
        });
        break;
      }
    }
  }

  // Check backend frameworks
  for (const [framework, packages] of Object.entries(FRAMEWORK_PATTERNS.backend)) {
    // Skip Java frameworks for Node.js detection
    if (['springBoot', 'springWebflux', 'quarkus', 'micronaut'].includes(framework)) {
      continue;
    }
    for (const pkg of packages) {
      if (depNames.has(pkg)) {
        const dep = depMap.get(pkg);
        detected.push({
          name: framework,
          version: dep?.version,
          type: dep?.type === 'devDependency' ? 'devDependency' : 'runtime',
        });
        break;
      }
    }
  }

  // Check testing frameworks
  for (const [framework, packages] of Object.entries(FRAMEWORK_PATTERNS.testing)) {
    // Skip Java testing frameworks
    if (['junit', 'testcontainers', 'mockito'].includes(framework)) {
      continue;
    }
    for (const pkg of packages) {
      if (depNames.has(pkg)) {
        const dep = depMap.get(pkg);
        detected.push({
          name: framework,
          version: dep?.version,
          type: 'test',
        });
        break;
      }
    }
  }

  // Check build tools
  for (const [framework, packages] of Object.entries(FRAMEWORK_PATTERNS.build)) {
    for (const pkg of packages) {
      if (depNames.has(pkg)) {
        const dep = depMap.get(pkg);
        detected.push({
          name: framework,
          version: dep?.version,
          type: 'build',
        });
        break;
      }
    }
  }

  return detected;
}

/**
 * Detect frameworks from Java dependencies (Maven/Gradle format)
 */
function detectJavaFrameworks(dependencies: DependencyInfo[]): DetectedFramework[] {
  const detected: DetectedFramework[] = [];

  const javaFrameworkPatterns: Record<string, { pattern: RegExp; type: DetectedFramework['type'] }> =
    {
      'Spring Boot': { pattern: /org\.springframework\.boot:spring-boot/, type: 'runtime' },
      'Spring WebFlux': {
        pattern: /org\.springframework\.boot:spring-boot-starter-webflux/,
        type: 'runtime',
      },
      'Spring Web': {
        pattern: /org\.springframework\.boot:spring-boot-starter-web(?!flux)/,
        type: 'runtime',
      },
      'Spring Data JPA': {
        pattern: /org\.springframework\.boot:spring-boot-starter-data-jpa/,
        type: 'runtime',
      },
      'Spring Security': {
        pattern: /org\.springframework\.boot:spring-boot-starter-security/,
        type: 'runtime',
      },
      Quarkus: { pattern: /io\.quarkus:quarkus/, type: 'runtime' },
      Micronaut: { pattern: /io\.micronaut:micronaut/, type: 'runtime' },
      JUnit: { pattern: /org\.junit\.jupiter:junit-jupiter|junit:junit/, type: 'test' },
      Mockito: { pattern: /org\.mockito:mockito/, type: 'test' },
      Testcontainers: { pattern: /org\.testcontainers:testcontainers/, type: 'test' },
      Lombok: { pattern: /org\.projectlombok:lombok/, type: 'devDependency' },
      MapStruct: { pattern: /org\.mapstruct:mapstruct/, type: 'devDependency' },
    };

  for (const dep of dependencies) {
    for (const [frameworkName, { pattern, type }] of Object.entries(javaFrameworkPatterns)) {
      if (pattern.test(dep.name)) {
        // Avoid duplicates
        if (!detected.some((d) => d.name === frameworkName)) {
          detected.push({
            name: frameworkName,
            version: dep.version,
            type,
          });
        }
      }
    }
  }

  return detected;
}

/**
 * Determine project type from detected markers and dependencies
 */
export function determineProjectType(
  markers: ProjectMarker[],
  dependencies: DependencyInfo[]
): ProjectType {
  const hasJava =
    markers.includes('pom.xml') ||
    markers.includes('build.gradle') ||
    markers.includes('build.gradle.kts');

  const hasTypeScript =
    markers.includes('tsconfig.json') || markers.includes('tsconfig.base.json');

  const hasPackageJson = markers.includes('package.json');

  // Check for TypeScript in dependencies
  const hasTypeScriptDep = dependencies.some(
    (d) => d.name === 'typescript' || d.name.startsWith('@types/')
  );

  if (hasJava && (hasTypeScript || hasTypeScriptDep)) {
    return 'hybrid';
  }

  if (hasJava) {
    return 'java';
  }

  if (hasTypeScript || hasTypeScriptDep) {
    return 'typescript';
  }

  if (hasPackageJson) {
    // JavaScript project without TypeScript
    return 'typescript'; // Treat JS as TypeScript for scaffolding purposes
  }

  return 'unknown';
}

/**
 * Detect source paths based on project structure
 */
function detectSourcePaths(projectPath: string, projectType: ProjectType): { main?: string; test?: string } {
  const result: { main?: string; test?: string } = {};

  if (projectType === 'java') {
    // Maven/Gradle standard layout
    if (fs.existsSync(path.join(projectPath, 'src', 'main', 'java'))) {
      result.main = 'src/main/java';
    }
    if (fs.existsSync(path.join(projectPath, 'src', 'test', 'java'))) {
      result.test = 'src/test/java';
    }
  } else {
    // TypeScript/JavaScript projects
    const srcCandidates = ['src', 'lib', 'app'];
    for (const candidate of srcCandidates) {
      if (fs.existsSync(path.join(projectPath, candidate))) {
        result.main = candidate;
        break;
      }
    }

    const testCandidates = ['tests', 'test', '__tests__', 'spec'];
    for (const candidate of testCandidates) {
      if (fs.existsSync(path.join(projectPath, candidate))) {
        result.test = candidate;
        break;
      }
    }
  }

  return result;
}

/**
 * Analyze a project to determine type, dependencies, and frameworks
 *
 * @param projectPath - Path to the project root
 * @returns Complete project analysis
 */
export async function analyzeProject(projectPath: string): Promise<ProjectAnalysisResult> {
  const absolutePath = path.resolve(projectPath);

  // Detect project markers
  const detection = detectProjectRoot(absolutePath);

  // Initialize result
  const result: ProjectAnalysisResult = {
    projectType: 'unknown',
    dependencies: [],
    frameworks: {
      frontend: [],
      backend: [],
      testing: [],
      build: [],
    },
    sourcePaths: {},
    manifests: {},
  };

  // Parse package.json if exists
  const packageJsonPath = path.join(absolutePath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const pkgResult = parsePackageJson(packageJsonPath);
    result.projectName = pkgResult.name;
    result.projectVersion = pkgResult.version;
    result.dependencies.push(...pkgResult.dependencies);
    result.buildTool = pkgResult.buildTool;

    try {
      result.manifests.packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    } catch {
      // Ignore parse errors
    }

    // Categorize frameworks
    for (const fw of pkgResult.frameworks) {
      if (Object.keys(FRAMEWORK_PATTERNS.frontend).includes(fw.name)) {
        result.frameworks.frontend.push(fw);
      } else if (
        Object.keys(FRAMEWORK_PATTERNS.backend).includes(fw.name) &&
        !['springBoot', 'springWebflux', 'quarkus', 'micronaut'].includes(fw.name)
      ) {
        result.frameworks.backend.push(fw);
      } else if (Object.keys(FRAMEWORK_PATTERNS.testing).includes(fw.name)) {
        result.frameworks.testing.push(fw);
      } else if (Object.keys(FRAMEWORK_PATTERNS.build).includes(fw.name)) {
        result.frameworks.build.push(fw);
      }
    }
  }

  // Parse pom.xml if exists
  const pomPath = path.join(absolutePath, 'pom.xml');
  if (fs.existsSync(pomPath)) {
    const pomResult = parsePomXml(pomPath);
    if (!result.projectName) {
      result.projectName = pomResult.name;
    }
    if (!result.projectVersion) {
      result.projectVersion = pomResult.version;
    }
    result.dependencies.push(...pomResult.dependencies);
    result.buildTool = 'maven';
    result.manifests.pomXml = { parsed: true };

    // Add Java frameworks
    for (const fw of pomResult.frameworks) {
      if (fw.type === 'test') {
        result.frameworks.testing.push(fw);
      } else {
        result.frameworks.backend.push(fw);
      }
    }
  }

  // Parse build.gradle if exists
  const gradlePath = path.join(absolutePath, 'build.gradle');
  const gradleKtsPath = path.join(absolutePath, 'build.gradle.kts');
  const actualGradlePath = fs.existsSync(gradleKtsPath) ? gradleKtsPath : gradlePath;

  if (fs.existsSync(actualGradlePath)) {
    const gradleResult = parseBuildGradle(actualGradlePath);
    if (!result.projectName) {
      result.projectName = gradleResult.name;
    }
    if (!result.projectVersion) {
      result.projectVersion = gradleResult.version;
    }
    result.dependencies.push(...gradleResult.dependencies);
    result.buildTool = 'gradle';
    result.manifests.buildGradle = { parsed: true };

    // Add Java frameworks
    for (const fw of gradleResult.frameworks) {
      if (fw.type === 'test') {
        result.frameworks.testing.push(fw);
      } else {
        result.frameworks.backend.push(fw);
      }
    }
  }

  // Determine project type
  result.projectType = determineProjectType(detection.detectedMarkers, result.dependencies);

  // Detect source paths
  result.sourcePaths = detectSourcePaths(absolutePath, result.projectType);

  return result;
}
