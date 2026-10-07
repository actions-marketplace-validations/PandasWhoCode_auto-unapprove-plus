#!/bin/bash

# Test runner script for pagination implementation
# Usage: ./tests/run-tests.sh

echo "🧪 PAGINATION TEST SUITE"
echo "========================"
echo ""

# Change to tests directory
cd "$(dirname "$0")" || exit 1

echo "1. Running logic tests..."
echo "   Testing pagination logic with simulated data..."
node test-pagination.js || exit 1
echo ""

echo "2. Running mock API tests..."
echo "   Testing with mock GitHub API responses..."
node test-mock-pagination.js || exit 1
echo ""

echo "3. Running org placeholder tests..."
echo "   Testing %-to-organization expansion in CODEOWNERS..."
node test-codeowners-percent.js || exit 1
echo ""

echo "4. Running CODEOWNERS matching tests..."
echo "   Testing glob matching and owner rule precedence..."
node test-codeowners-matching.js || exit 1
echo ""

echo "5. Checking for real data test setup..."
echo "   To test with real GitHub data, run:"
echo "   export GITHUB_TOKEN='your_token'"
echo "   export GITHUB_REPOSITORY='owner/repo'"
echo "   export PR_NUMBER='123'"
echo "   export DRY_RUN='true'"
echo "   ./test-real-pagination.sh"
echo ""

echo "✅ Test suite completed!"
echo ""
echo "📖 For detailed testing instructions, see: TESTING.md"
