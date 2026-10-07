/**
 * Minimal assertion helpers shared by the unit test scripts.
 */

let failures = 0;

/** Compare two values by their JSON form and log the result. */
function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`   ✅ ${name}`);
  } else {
    console.log(`   ❌ ${name}\n      expected: ${e}\n      actual:   ${a}`);
    failures++;
  }
}

/** Exit non-zero if any check failed, otherwise log `successMessage`. */
function finish(successMessage) {
  if (failures > 0) {
    console.log(`❌ ${failures} test(s) failed`);
    process.exit(1);
  }
  console.log(successMessage);
}

module.exports = { check, finish };
