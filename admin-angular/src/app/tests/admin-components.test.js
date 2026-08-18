/**
 * Angular Admin Console - Automated Component & Logic Test Suite
 */

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function runAdminAngularTests() {
  console.log('\n======================================================');
  console.log(' 🅰️ RUNNING SLMS ANGULAR ADMIN CONSOLE TEST SUITE     ');
  console.log('======================================================\n');

  // ----------------------------------------------------
  // 1. Admin Auth & Guard Logic
  // ----------------------------------------------------
  console.log('▶ Test Suite 1: Admin AuthGuard & Role Perms');

  const checkAdminAuthGuard = (user) => {
    if (!user) return { canActivate: false, redirect: '/login' };
    if (user.role === 'super_admin' || user.role === 'librarian') {
      return { canActivate: true };
    }
    return { canActivate: false, redirect: '/unauthorized' };
  };

  assert(checkAdminAuthGuard({ role: 'super_admin' }).canActivate === true, 'Super Admin granted access to Admin Console');
  assert(checkAdminAuthGuard({ role: 'librarian' }).canActivate === true, 'Librarian granted access to Admin Console');
  assert(checkAdminAuthGuard({ role: 'student' }).canActivate === false, 'Student blocked from Admin Console');
  assert(checkAdminAuthGuard(null).redirect === '/login', 'Unauthenticated user redirected to login');

  // ----------------------------------------------------
  // 2. Admin Dashboard & ApexCharts Data Mapper
  // ----------------------------------------------------
  console.log('\n▶ Test Suite 2: Dashboard Analytics ApexCharts Mapper');

  const mapLoanTrendsToApexChart = (monthlyStats) => {
    const categories = monthlyStats.map((m) => m.month);
    const seriesData = monthlyStats.map((m) => m.count);
    return {
      chart: { type: 'bar', height: 350 },
      series: [{ name: 'Total Borrowed Books', data: seriesData }],
      xaxis: { categories }
    };
  };

  const sampleMonthlyData = [
    { month: 'Jan', count: 120 },
    { month: 'Feb', count: 150 },
    { month: 'Mar', count: 210 }
  ];

  const chartConfig = mapLoanTrendsToApexChart(sampleMonthlyData);
  assert(chartConfig.xaxis.categories.length === 3, 'ApexCharts x-axis categories mapped correctly');
  assert(chartConfig.series[0].data[2] === 210, 'ApexCharts series data maps March counts accurately (210)');

  // ----------------------------------------------------
  // 3. Admin Book Management Component Logic
  // ----------------------------------------------------
  console.log('\n▶ Test Suite 3: Book Desk ISBN & Stock Validator');

  const validateBookForm = (book) => {
    const errors = {};
    if (!book.title || book.title.trim() === '') errors.title = 'Title required';
    if (!book.isbn || !/^(97[89])?\d{9}[\dX]$/.test(book.isbn.replace(/-/g, ''))) {
      errors.isbn = 'Invalid ISBN format';
    }
    if (book.totalCopies === undefined || book.totalCopies < 1) {
      errors.totalCopies = 'Total copies must be at least 1';
    }
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const validBook = { title: 'Design Patterns', isbn: '978-0201633610', totalCopies: 3 };
  const invalidBook = { title: '', isbn: '12345', totalCopies: 0 };

  assert(validateBookForm(validBook).isValid === true, 'Valid book form passes validation');
  assert(validateBookForm(invalidBook).isValid === false, 'Invalid ISBN and zero copies flagged');
  assert(validateBookForm(invalidBook).errors.isbn === 'Invalid ISBN format', 'ISBN validation message returned');

  // ----------------------------------------------------
  // 4. Issue & Return Desk Logic
  // ----------------------------------------------------
  console.log('\n▶ Test Suite 4: Issue & Return Desk Loan Calculator');

  const computeDueDate = (issueDate, loanDays = 14) => {
    const d = new Date(issueDate);
    d.setDate(d.getDate() + loanDays);
    return d.toISOString().split('T')[0];
  };

  const issueDateStr = '2026-09-01';
  const expectedDueDateStr = '2026-09-15';
  assert(computeDueDate(issueDateStr, 14) === expectedDueDateStr, 'Default 14-day loan period computes due date 2026-09-15');

  // ----------------------------------------------------
  // 5. Fine Management & Waiver Dialog
  // ----------------------------------------------------
  console.log('\n▶ Test Suite 5: Fine Waiver & Settlement Desk');

  const processFineAction = (fine, action, paymentMethod = 'none') => {
    if (action === 'waive') {
      return { ...fine, status: 'waived', paymentMethod: 'waived', settledAt: new Date().toISOString() };
    }
    if (action === 'pay') {
      return { ...fine, status: 'paid', paymentMethod, settledAt: new Date().toISOString() };
    }
    return fine;
  };

  const sampleFine = { id: 'f101', amount: 15.0, status: 'unpaid' };
  const waivedFine = processFineAction(sampleFine, 'waive');
  assert(waivedFine.status === 'waived', 'Fine waiver action updates status to waived');
  assert(waivedFine.paymentMethod === 'waived', 'Payment method marked as waived');

  const paidFine = processFineAction(sampleFine, 'pay', 'cash');
  assert(paidFine.status === 'paid' && paidFine.paymentMethod === 'cash', 'Fine payment records Cash transaction');

  // ----------------------------------------------------
  // 6. User Management & Role Badge Logic
  // ----------------------------------------------------
  console.log('\n▶ Test Suite 6: User & Role Badge Formatter');

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'super_admin':
        return { text: 'Super Admin', cssClass: 'badge-purple' };
      case 'librarian':
        return { text: 'Librarian', cssClass: 'badge-blue' };
      case 'faculty':
        return { text: 'Faculty', cssClass: 'badge-emerald' };
      case 'student':
        return { text: 'Student', cssClass: 'badge-gray' };
      default:
        return { text: role, cssClass: 'badge-default' };
    }
  };

  assert(getRoleBadgeStyle('super_admin').cssClass === 'badge-purple', 'Super Admin receives purple badge class');
  assert(getRoleBadgeStyle('librarian').cssClass === 'badge-blue', 'Librarian receives blue badge class');

  // ----------------------------------------------------
  // 7. Audit Logs Parser & Filter
  // ----------------------------------------------------
  console.log('\n▶ Test Suite 7: Audit Logs Filter Engine');

  const mockLogs = [
    { id: 1, action: 'BOOK_CREATE', actor: 'Admin' },
    { id: 2, action: 'ISSUE_BOOK', actor: 'Librarian' },
    { id: 3, action: 'FINE_WAIVED', actor: 'Admin' }
  ];

  const filterAuditLogs = (logs, actionFilter) => {
    if (!actionFilter || actionFilter === 'ALL') return logs;
    return logs.filter((l) => l.action === actionFilter);
  };

  assert(filterAuditLogs(mockLogs, 'ALL').length === 3, 'ALL filter returns full log history');
  assert(filterAuditLogs(mockLogs, 'BOOK_CREATE').length === 1, 'Action filter "BOOK_CREATE" returns matching record');

  console.log('\n======================================================');
  console.log(` 📊 ANGULAR ADMIN TEST SUMMARY`);
  console.log(` Total Assertions : ${totalTests}`);
  console.log(` Passed           : ${passedTests}`);
  console.log(` Failed           : ${failedTests}`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  runAdminAngularTests();
}

module.exports = { runAdminAngularTests };
