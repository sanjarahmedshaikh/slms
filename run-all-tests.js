/**
 * SLMS (Smart Library Management System) Master Automation Test Runner
 * Executes backend REST API tests, React frontend portal tests, and Angular admin console tests.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('  📚 SMART LIBRARY MANAGEMENT SYSTEM (SLMS) TEST AUTOMATION  ');
console.log('================================================================');

let hasFailed = false;

function runModuleTests(moduleName, command, cwd) {
  console.log(`\n----------------------------------------------------------------`);
  console.log(` 🚀 RUNNING TESTS: ${moduleName}`);
  console.log(`----------------------------------------------------------------`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    console.log(`\n✅ ${moduleName} TESTS PASSED SUCCESSFULLY!`);
  } catch (error) {
    console.error(`\n❌ ${moduleName} TESTS FAILED!`);
    hasFailed = true;
  }
}

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const reactDir = path.join(rootDir, 'frontend-react');
const angularDir = path.join(rootDir, 'admin-angular');

// 1. Run Backend REST API Tests
runModuleTests('BACKEND REST API & MONGO SERVICES', 'node tests/standalone-runner.js', backendDir);

// 2. Run React Frontend Portal Tests
runModuleTests('REACT STUDENT & FACULTY PORTAL', 'node src/tests/react-components.test.js', reactDir);

// 3. Run Angular Admin Console Tests
runModuleTests('ANGULAR ADMIN CONSOLE', 'node src/app/tests/admin-components.test.js', angularDir);

console.log('\n================================================================');
if (hasFailed) {
  console.log(' 🔴 MASTER AUTOMATION RUN COMPLETE: SOME SUITES FAILED!');
  console.log('================================================================\n');
  process.exit(1);
} else {
  console.log(' 🎉 MASTER AUTOMATION RUN COMPLETE: ALL COMPONENT SUITES PASSED! ');
  console.log('================================================================\n');
  process.exit(0);
}
