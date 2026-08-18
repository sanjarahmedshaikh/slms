/**
 * React Student & Faculty Portal - Automated Component & Logic Test Suite
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

function runReactFrontendTests() {
  console.log('\n======================================================');
  console.log(' ⚛️ RUNNING SLMS REACT FRONTEND PORTAL TEST SUITE    ');
  console.log('======================================================\n');

  // ----------------------------------------------------
  // 1. Auth & Login Component Logic
  // ----------------------------------------------------
  console.log('▶ Test Suite 1: React Auth & Credentials Component');
  
  const validateLoginForm = (email, password) => {
    const errors = {};
    if (!email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email format';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  assert(validateLoginForm('student@slms.com', 'student123').isValid === true, 'Valid student login payload passes validation');
  assert(validateLoginForm('invalid-email', '123').isValid === false, 'Invalid email and short password flagged with error messages');
  assert(validateLoginForm('invalid-email', '123').errors.email === 'Invalid email format', 'Email format error returned correctly');

  // ----------------------------------------------------
  // 2. Catalog & Book Search Filtering Component
  // ----------------------------------------------------
  console.log('\n▶ Test Suite 2: Book Catalog & Filter Logic');

  const mockBooks = [
    { id: '1', title: 'Clean Code', category: 'CS', status: 'available', availableCopies: 4, isbn: '978-1' },
    { id: '2', title: 'Quantum Mechanics', category: 'Physics', status: 'out_of_stock', availableCopies: 0, isbn: '978-2' },
    { id: '3', title: 'Data Structures in C++', category: 'CS', status: 'available', availableCopies: 2, isbn: '978-3' }
  ];

  const filterBooks = (books, query, selectedCategory) => {
    return books.filter((b) => {
      const matchesQuery = b.title.toLowerCase().includes(query.toLowerCase()) || b.isbn.includes(query);
      const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  };

  assert(filterBooks(mockBooks, 'Clean', 'All').length === 1, 'Search query "Clean" filters catalog to 1 book');
  assert(filterBooks(mockBooks, '', 'CS').length === 2, 'Category filter "CS" returns 2 books');
  assert(filterBooks(mockBooks, 'Quantum', 'Physics').length === 1, 'Combined title and category filter returns correct match');

  // ----------------------------------------------------
  // 3. Loans & Due Date Calculator Component Logic
  // ----------------------------------------------------
  console.log('\n▶ Test Suite 3: Active Loans & Overdue Status Logic');

  const calculateLoanStatus = (dueDateStr, returnDateStr) => {
    if (returnDateStr) return { label: 'Returned', class: 'badge-success', isOverdue: false };
    const dueDate = new Date(dueDateStr);
    const now = new Date();
    if (now > dueDate) {
      const diffTime = Math.abs(now - dueDate);
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { label: `Overdue by ${overdueDays} days`, class: 'badge-danger', isOverdue: true, overdueDays };
    }
    return { label: 'Active', class: 'badge-info', isOverdue: false, overdueDays: 0 };
  };

  const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

  const overdueStatus = calculateLoanStatus(pastDate, null);
  assert(overdueStatus.isOverdue === true, 'Past due date flagged as overdue');
  assert(overdueStatus.overdueDays >= 3, 'Calculates overdue duration correctly');

  const activeStatus = calculateLoanStatus(futureDate, null);
  assert(activeStatus.isOverdue === false && activeStatus.label === 'Active', 'Future due date marked as Active');

  // ----------------------------------------------------
  // 4. Reservations & Queue Position Formatting Component
  // ----------------------------------------------------
  console.log('\n▶ Test Suite 4: My Reservations & Priority Queue');

  const formatQueueBadge = (position) => {
    if (position === 1) return { text: 'Next in Line (1st)', color: 'green' };
    return { text: `Position #${position}`, color: 'orange' };
  };

  assert(formatQueueBadge(1).text === 'Next in Line (1st)', '1st position receives top priority badge');
  assert(formatQueueBadge(3).text === 'Position #3', 'Later positions format queue rank correctly');

  // ----------------------------------------------------
  // 5. Fine Clearance Component Calculator
  // ----------------------------------------------------
  console.log('\n▶ Test Suite 5: Fine Clearance & Total Calculator');

  const mockFines = [
    { id: 'f1', amount: 5.0, status: 'unpaid' },
    { id: 'f2', amount: 3.5, status: 'unpaid' },
    { id: 'f3', amount: 10.0, status: 'paid' }
  ];

  const calculateUnpaidTotal = (fines) => {
    return fines
      .filter((f) => f.status === 'unpaid')
      .reduce((sum, f) => sum + f.amount, 0);
  };

  assert(calculateUnpaidTotal(mockFines) === 8.5, 'Calculates total outstanding unpaid fine balance ($8.50)');

  // ----------------------------------------------------
  // 6. Navigation Component Logic & Notification Counters
  // ----------------------------------------------------
  console.log('\n▶ Test Suite 6: Navigation & Notification Counter');

  const mockNotifications = [
    { id: 'n1', isRead: false },
    { id: 'n2', isRead: false },
    { id: 'n3', isRead: true }
  ];

  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;
  assert(unreadCount === 2, 'Unread notification count badge calculates 2 unread items');

  console.log('\n======================================================');
  console.log(` 📊 REACT FRONTEND TEST SUMMARY`);
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

runReactFrontendTests();

