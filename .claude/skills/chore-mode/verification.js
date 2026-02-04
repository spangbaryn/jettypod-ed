/**
 * Type-specific verification runner for chore-mode skill
 * Runs verification checklist from chore taxonomy based on chore type
 */

const { getGuidance, CHORE_TYPES } = require('../../../lib/chore-taxonomy');

/**
 * Create a verification check result
 *
 * @param {string} description - What is being verified
 * @param {boolean} passed - Whether the check passed
 * @param {string} [details] - Additional details or failure reason
 * @returns {{description: string, passed: boolean, details?: string}}
 */
function createCheck(description, passed, details = null) {
  const check = { description, passed };
  if (details) check.details = details;
  return check;
}

/**
 * Run all verification checks for a chore type
 *
 * @param {string} type - Chore type (refactor, dependency, cleanup, tooling)
 * @param {object} context - Context about the chore execution
 * @param {object} context.testResult - Test execution result
 * @param {boolean} context.testResult.passed - Whether tests passed
 * @param {number} context.testResult.total - Total tests run
 * @param {boolean} [context.testsModified] - Whether test assertions were changed
 * @param {boolean} [context.newFunctionalityAdded] - Whether new features were added
 * @param {string[]} [context.deprecationWarnings] - Any deprecation warnings found
 * @param {boolean} [context.unusedCodeVerified] - Whether code was verified unused
 * @param {boolean} [context.ciPassed] - Whether CI pipeline passed
 * @returns {{passed: boolean, checks: Array<{description: string, passed: boolean, details?: string}>}}
 */
function runVerificationChecklist(type, context = {}) {
  const guidance = getGuidance(type);
  const checks = [];
  let allPassed = true;

  // Run type-specific verification based on taxonomy criteria
  switch (type) {
    case CHORE_TYPES.REFACTOR:
      checks.push(...runRefactorChecks(guidance, context));
      break;

    case CHORE_TYPES.DEPENDENCY:
      checks.push(...runDependencyChecks(guidance, context));
      break;

    case CHORE_TYPES.CLEANUP:
      checks.push(...runCleanupChecks(guidance, context));
      break;

    case CHORE_TYPES.TOOLING:
      checks.push(...runToolingChecks(guidance, context));
      break;

    default:
      checks.push(createCheck(
        'Valid chore type',
        false,
        `Unknown type: ${type}`
      ));
  }

  // Calculate overall pass/fail
  allPassed = checks.every(check => check.passed);

  return {
    passed: allPassed,
    checks
  };
}

/**
 * Run refactor-specific verification checks
 */
function runRefactorChecks(guidance, context) {
  const checks = [];

  // "All existing tests pass without modification"
  checks.push(createCheck(
    'All existing tests pass without modification',
    context.testResult?.passed === true,
    context.testResult?.passed ? null : 'Tests failed - refactor may have broken behavior'
  ));

  // Check if tests were modified (should NOT be)
  checks.push(createCheck(
    'No test assertions modified',
    context.testsModified !== true,
    context.testsModified ? 'Test assertions were changed - this violates refactor rules' : null
  ));

  // "No new functionality added"
  checks.push(createCheck(
    'No new functionality added',
    context.newFunctionalityAdded !== true,
    context.newFunctionalityAdded ? 'New functionality detected - this should be a feature, not a refactor' : null
  ));

  // "Performance is not degraded" - assumed pass unless context indicates otherwise
  checks.push(createCheck(
    'Performance not degraded',
    context.performanceDegraded !== true,
    context.performanceDegraded ? 'Performance regression detected' : null
  ));

  return checks;
}

/**
 * Run dependency-specific verification checks
 */
function runDependencyChecks(guidance, context) {
  const checks = [];

  // "All tests pass after update"
  checks.push(createCheck(
    'All tests pass after update',
    context.testResult?.passed === true,
    context.testResult?.passed ? null : 'Tests failed after dependency update'
  ));

  // "Application builds successfully" - assumed from test pass
  checks.push(createCheck(
    'Application builds successfully',
    context.buildPassed !== false,
    context.buildPassed === false ? 'Build failed' : null
  ));

  // "No new deprecation warnings"
  const hasDeprecations = context.deprecationWarnings && context.deprecationWarnings.length > 0;
  checks.push(createCheck(
    'No new deprecation warnings (or documented)',
    !hasDeprecations || context.deprecationsDocumented === true,
    hasDeprecations && !context.deprecationsDocumented
      ? `Found ${context.deprecationWarnings.length} deprecation warnings`
      : null
  ));

  return checks;
}

/**
 * Run cleanup-specific verification checks
 */
function runCleanupChecks(guidance, context) {
  const checks = [];

  // "All tests still pass"
  checks.push(createCheck(
    'All tests still pass',
    context.testResult?.passed === true,
    context.testResult?.passed ? null : 'Tests failed after cleanup'
  ));

  // "No broken imports or references"
  checks.push(createCheck(
    'No broken imports or references',
    context.brokenReferences !== true,
    context.brokenReferences ? 'Broken references found' : null
  ));

  // "Removed code was actually unused"
  checks.push(createCheck(
    'Removed code was verified unused',
    context.unusedCodeVerified === true,
    context.unusedCodeVerified ? null : 'Code usage was not verified before removal'
  ));

  return checks;
}

/**
 * Run tooling-specific verification checks
 */
function runToolingChecks(guidance, context) {
  const checks = [];

  // "CI pipeline passes"
  checks.push(createCheck(
    'CI pipeline passes',
    context.ciPassed === true,
    context.ciPassed ? null : 'CI not verified or failed'
  ));

  // "Build completes successfully"
  checks.push(createCheck(
    'Build completes successfully',
    context.buildPassed !== false,
    context.buildPassed === false ? 'Build failed' : null
  ));

  // "No regression in build times or developer experience"
  checks.push(createCheck(
    'No regression in build times/DX',
    context.dxRegression !== true,
    context.dxRegression ? 'Developer experience regression detected' : null
  ));

  return checks;
}

/**
 * Format verification results for display
 *
 * @param {{passed: boolean, checks: Array}} result - Verification result
 * @returns {string} Formatted string for display
 */
function formatVerificationResult(result) {
  const lines = [];
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('🔍 Verification Checklist');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');

  for (const check of result.checks) {
    const icon = check.passed ? '✅' : '❌';
    lines.push(`${icon} ${check.description}`);
    if (check.details) {
      lines.push(`   └─ ${check.details}`);
    }
  }

  lines.push('');
  if (result.passed) {
    lines.push('✅ All verification checks passed');
  } else {
    const failedCount = result.checks.filter(c => !c.passed).length;
    lines.push(`❌ ${failedCount} verification check(s) failed`);
  }

  return lines.join('\n');
}

/**
 * Get verification criteria from taxonomy for display
 *
 * @param {string} type - Chore type
 * @returns {string[]} Array of verification criteria strings
 */
function getVerificationCriteria(type) {
  const guidance = getGuidance(type);
  return guidance.verification || [];
}

module.exports = {
  runVerificationChecklist,
  formatVerificationResult,
  getVerificationCriteria,
  createCheck
};
