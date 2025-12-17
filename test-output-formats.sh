#!/usr/bin/env bash

#############################################
# Test script for output format feature
#############################################

set -e

echo "Testing AgentX output format feature..."
echo ""

# Create test output directory
TEST_DIR="./test-output"
mkdir -p "$TEST_DIR"

echo "1. Testing markdown format (default)..."
node dist/index.js exec mock "Test prompt for markdown" --file "$TEST_DIR/test-markdown.md" --dry-run

echo ""
echo "2. Testing JSON format..."
node dist/index.js exec mock "Test prompt for JSON" --file "$TEST_DIR/test-json.json" --output-format json --dry-run

echo ""
echo "3. Testing TOON format (Token-Oriented Object Notation)..."
node dist/index.js exec mock "Test prompt for TOON" --file "$TEST_DIR/test-toon.toon" --output-format toon --dry-run

echo ""
echo "4. Testing raw format..."
node dist/index.js exec mock "Test prompt for raw" --file "$TEST_DIR/test-raw.txt" --output-format raw --dry-run

echo ""
echo "5. Testing with just filename (should use default output location)..."
node dist/index.js exec mock "Test prompt" --file test-default --dry-run

echo ""
echo "6. Testing invalid format (should error)..."
node dist/index.js exec mock "Test prompt" --file test.txt --output-format invalid --dry-run || echo "Expected error occurred"

echo ""
echo "✓ All tests completed!"
echo ""
echo "Note: These were dry-run tests. To test actual file writing, remove --dry-run flag"

