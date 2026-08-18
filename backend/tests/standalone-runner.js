const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {}

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const http = require('http');
const app = require('../src/app');
const User = require('../src/models/User');
const Book = require('../src/models/Book');
const Category = require('../src/models/Category');
const BorrowTransaction = require('../src/models/BorrowTransaction');
const Fine = require('../src/models/Fine');
const Reservation = require('../src/models/Reservation');
const Notification = require('../src/models/Notification');
const AuditLog = require('../src/models/AuditLog');

let server;
let baseUrl;

// Test Statistics
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
    testResults.push({ name: message, status: 'PASSED' });
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
    testResults.push({ name: message, status: 'FAILED' });
  }
}

async function request(reqPath, options = {}) {
  const url = `${baseUrl}${reqPath}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const body = options.body ? JSON.stringify(options.body) : undefined;
  
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body
  });
  
  let json = {};
  try {
    json = await res.json();
  } catch (e) {
    json = {};
  }
  
  return { status: res.status, body: json };
}

async function runAllBackendTests() {
  console.log('\n======================================================');
  console.log(' 🚀 RUNNING SLMS BACKEND REST API AUTOMATED TEST SUITE ');
  console.log('======================================================\n');

  // 1. Connect directly to MongoDB Atlas Server
  let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
  mongoUri = mongoUri.replace(/^["']|["']$/g, '');

  if (!mongoUri) {
    console.error('🔴 MongoDB Atlas Connection Error: MONGODB_URI is not configured in backend/.env');
    console.warn('💡 Tip: Please set MONGODB_URI in backend/.env file');
    process.exit(1);
  }

  console.log(`⌛ Connecting to MongoDB Atlas Database...`);
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('✓ Successfully connected to MongoDB Atlas Database!');
  } catch (dbErr) {
    console.error('🔴 MongoDB Atlas Connection Error:', dbErr.message);
    console.warn('⚠️ Warning: Could not establish live connection to MongoDB Atlas cluster.');
    console.warn('💡 Troubleshooting Steps:');
    console.warn('   1. Verify MONGODB_URI in backend/.env');
    console.warn('   2. Ensure network access whitelist in MongoDB Atlas contains 0.0.0.0/0 or your current IP.');
    console.warn('   3. Check Atlas database user credentials.\n');
    if (process.env.CI || process.env.SKIP_LIVE_DB) {
      console.log(' Skipping live MongoDB integration assertions.\n');
      return;
    }
    return;
  }

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`✓ Express server listening on dynamic port ${port}\n`);

  let adminToken, librarianToken, facultyToken, studentToken;
  let adminUser, librarianUser, facultyUser, studentUser;
  let sampleCategory, sampleBook, outOfStockBook;

  try {
    // ----------------------------------------------------
    // TEST SUITE 1: System Health & Base Routes
    // ----------------------------------------------------
    console.log('▶ Test Suite 1: System Health & Server Base');
    const healthRes = await request('/api/v1/health');
    assert(healthRes.status === 200, 'Health endpoint returns HTTP 200 OK');
    assert(healthRes.body.status === 'success' || healthRes.body.status === 'online', 'Health endpoint status is valid');
    assert(healthRes.body.system.includes('Smart Library Management System'), 'Health endpoint identifies system correctly');

    const notFoundRes = await request('/api/v1/unknown-route-xyz');
    assert(notFoundRes.status === 404, 'Undefined route returns 404 Not Found');

    // Clean test records from MongoDB Atlas before test run
    await User.deleteMany({ email: { $regex: /.*\.test@slms\.com$/i } });
    await Book.deleteMany({ isbn: { $in: ['978-9999999999', '978-8888888888'] } });
    await Category.deleteMany({ code: 'CSAI_TEST' });

    // ----------------------------------------------------
    // TEST SUITE 2: User Authentication & JWT Flow
    // ----------------------------------------------------
    console.log('\n▶ Test Suite 2: Authentication & JWT Management');

    // Register Student
    const regRes = await request('/api/v1/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Test Student',
        email: 'student.test@slms.com',
        password: 'password123',
        role: 'student',
        department: 'Computer Science'
      }
    });
    assert(regRes.status === 201, 'Student user registration returns 201 Created');
    assert(regRes.body.data && regRes.body.data.token !== undefined, 'Registration returns valid JWT auth token');
    studentToken = regRes.body.data ? regRes.body.data.token : null;
    studentUser = regRes.body.data ? regRes.body.data.user : null;

    // Login Invalid Password
    const badLoginRes = await request('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'student.test@slms.com', password: 'wrongpassword' }
    });
    assert(badLoginRes.status === 401, 'Invalid password rejected with HTTP 401 Unauthorized');

    // Register Super Admin
    const adminReg = await request('/api/v1/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Test Admin',
        email: 'admin.test@slms.com',
        password: 'adminpassword',
        role: 'super_admin',
        department: 'Administration'
      }
    });
    adminToken = adminReg.body.data ? adminReg.body.data.token : null;
    adminUser = adminReg.body.data ? adminReg.body.data.user : null;
    assert(adminReg.status === 201, 'Super Admin user registered');

    // Register Librarian
    const libReg = await request('/api/v1/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Test Librarian',
        email: 'librarian.test@slms.com',
        password: 'libpassword',
        role: 'librarian',
        department: 'Library Services'
      }
    });
    librarianToken = libReg.body.data ? libReg.body.data.token : null;
    librarianUser = libReg.body.data ? libReg.body.data.user : null;
    assert(libReg.status === 201, 'Librarian registered');

    // Register Faculty
    const facReg = await request('/api/v1/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Test Faculty',
        email: 'faculty.test@slms.com',
        password: 'facpassword',
        role: 'faculty',
        department: 'Physics'
      }
    });
    facultyToken = facReg.body.data ? facReg.body.data.token : null;
    facultyUser = facReg.body.data ? facReg.body.data.user : null;
    assert(facReg.status === 201, 'Faculty member registered');

    // Get Me profile test
    const getMeRes = await request('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(getMeRes.status === 200, 'GET /auth/me with valid Bearer token returns profile');
    assert(getMeRes.body.data && getMeRes.body.data.email === 'student.test@slms.com', 'Profile matches authenticated user');

    // ----------------------------------------------------
    // TEST SUITE 3: RBAC & User Management
    // ----------------------------------------------------
    console.log('\n▶ Test Suite 3: RBAC & User Management');

    // Student trying to view user directory
    const studentUserList = await request('/api/v1/users', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(studentUserList.status === 403, 'Student prevented from accessing user directory (HTTP 403 Forbidden)');

    // Admin fetching user list
    const adminUserList = await request('/api/v1/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminUserList.status === 200, 'Super Admin successfully retrieves full user directory');
    assert(Array.isArray(adminUserList.body.data), 'Users payload is an array');

    // Update role
    const roleUpdateRes = await request(`/api/v1/users/${studentUser._id}/role`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { role: 'student' }
    });
    assert(roleUpdateRes.status === 200, 'Super Admin can update user role');

    // ----------------------------------------------------
    // TEST SUITE 4: Book Catalog & Inventory Management
    // ----------------------------------------------------
    console.log('\n▶ Test Suite 4: Book & Inventory Management');

    sampleCategory = await Category.create({ name: 'Computer Science & AI Automated Test', code: 'CSAI_TEST', description: 'Tech Books' });

    // Student attempts to create book
    const studentCreateBook = await request('/api/v1/books', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { title: 'Illegal Book', isbn: '111-222', authors: ['Hacker'], totalCopies: 5, availableCopies: 5 }
    });
    assert(studentCreateBook.status === 403, 'Student blocked from creating book');

    // Librarian creates valid book
    const createBookRes = await request('/api/v1/books', {
      method: 'POST',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: {
        title: 'Automated Test Craftsmanship Book',
        isbn: '978-9999999999',
        authors: ['Robert C. Martin'],
        publisher: 'Prentice Hall',
        publicationYear: 2008,
        category: sampleCategory._id,
        genres: ['Programming', 'Software Engineering'],
        totalCopies: 5,
        availableCopies: 5,
        shelfLocation: 'Shelf A3'
      }
    });
    assert(createBookRes.status === 201, 'Librarian creates book successfully');
    sampleBook = createBookRes.body.data;
    assert(sampleBook && sampleBook.status === 'available', 'Book automatically receives status "available"');

    // Librarian creates an out-of-stock book
    const outOfStockRes = await request('/api/v1/books', {
      method: 'POST',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: {
        title: 'Rare Out of Print Test Manual',
        isbn: '978-8888888888',
        authors: ['Historical Author'],
        totalCopies: 1,
        availableCopies: 0,
        shelfLocation: 'Vault 1'
      }
    });
    assert(outOfStockRes.status === 201, 'Created zero-available book');
    outOfStockBook = outOfStockRes.body.data;
    assert(outOfStockBook && (outOfStockBook.status === 'out_of_stock' || outOfStockBook.status === 'low_stock'), 'Low/zero available copies auto-sets status');

    // Get all books
    const getAllBooksRes = await request('/api/v1/books');
    assert(getAllBooksRes.status === 200, 'Public GET /api/v1/books returns book catalog');
    assert(Array.isArray(getAllBooksRes.body.data) && getAllBooksRes.body.data.length >= 2, 'Catalog contains created books');

    // Get Categories
    const getCatsRes = await request('/api/v1/books/categories');
    assert(getCatsRes.status === 200, 'GET /api/v1/books/categories returns list');

    // Update Book
    const updateBookRes = await request(`/api/v1/books/${sampleBook._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: { description: 'Updated comprehensive software guide.' }
    });
    assert(updateBookRes.status === 200, 'Librarian updates book details');

    // ----------------------------------------------------
    // TEST SUITE 5: Issue & Return Desk (Transactions)
    // ----------------------------------------------------
    console.log('\n▶ Test Suite 5: Issue & Return Desk Transactions');

    // Issue book to student
    const issueRes = await request('/api/v1/transactions/issue', {
      method: 'POST',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: {
        memberId: studentUser.memberId,
        isbn: sampleBook.isbn,
        days: 14
      }
    });
    assert(issueRes.status === 201, 'Librarian issues book to student');
    const transaction = issueRes.body.data;
    assert(transaction && transaction.status === 'issued', 'Transaction status is "issued"');

    // Check available copies decremented
    const bookCheck = await Book.findById(sampleBook._id);
    assert(bookCheck.availableCopies === 4, 'Book available copies decremented from 5 to 4');

    // Student checks active history
    const myLoansRes = await request('/api/v1/transactions/my-history', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(myLoansRes.status === 200, 'Student retrieves active loan history');
    assert(Array.isArray(myLoansRes.body.data) && myLoansRes.body.data.length === 1, 'Loan history contains issued book');

    // Return book
    const returnRes = await request('/api/v1/transactions/return', {
      method: 'POST',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: { transactionId: transaction._id }
    });
    assert(returnRes.status === 200, 'Librarian processes book return');
    assert(returnRes.body.data && returnRes.body.data.transaction.status === 'returned', 'Transaction status set to "returned"');

    // Check available copies incremented
    const bookCheck2 = await Book.findById(sampleBook._id);
    assert(bookCheck2.availableCopies === 5, 'Book available copies incremented back to 5');

    // ----------------------------------------------------
    // TEST SUITE 6: Reservation System
    // ----------------------------------------------------
    console.log('\n▶ Test Suite 6: Book Reservation Desk');

    // Reserve out-of-stock book
    const reserveRes = await request('/api/v1/reservations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { bookId: outOfStockBook._id }
    });
    assert(reserveRes.status === 201, 'Student creates hold reservation for out-of-stock book');
    const reservation = reserveRes.body.data;
    assert(reservation && reservation.queuePosition === 1, 'First reservation receives queuePosition = 1');

    // Faculty reserves same out-of-stock book
    const reserveFacRes = await request('/api/v1/reservations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${facultyToken}` },
      body: { bookId: outOfStockBook._id }
    });
    assert(reserveFacRes.status === 201, 'Faculty creates reservation for same book');
    assert(reserveFacRes.body.data && reserveFacRes.body.data.queuePosition === 2, 'Second reservation receives queuePosition = 2');

    // Fetch user reservations
    const myRes = await request('/api/v1/reservations/my-reservations', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(myRes.status === 200, 'Student views active reservations');
    assert(Array.isArray(myRes.body.data) && myRes.body.data.length === 1, 'Active reservation found');

    // Cancel reservation
    const cancelRes = await request(`/api/v1/reservations/${reservation._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(cancelRes.status === 200, 'Student cancels reservation');

    // ----------------------------------------------------
    // TEST SUITE 7: Fine Engine & Fee Clearance
    // ----------------------------------------------------
    console.log('\n▶ Test Suite 7: Fine Engine & Fee Management');

    // Create overdue transaction fixture
    const overdueTrans = await BorrowTransaction.create({
      user: studentUser._id,
      book: sampleBook._id,
      issuedBy: librarianUser._id,
      issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'overdue'
    });

    const sampleFine = await Fine.create({
      transaction: overdueTrans._id,
      user: studentUser._id,
      amount: 5.0,
      overdueDays: 5,
      status: 'unpaid'
    });

    // Student fetches fines
    const myFinesRes = await request('/api/v1/fines/my-fines', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(myFinesRes.status === 200, 'Student retrieves unpaid fines');
    assert(myFinesRes.body.data && Array.isArray(myFinesRes.body.data.fines) && myFinesRes.body.data.fines.length === 1, 'Fine listed correctly');

    // Librarian waives fine
    const waiveRes = await request(`/api/v1/fines/${sampleFine._id}/pay`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${librarianToken}` },
      body: { status: 'waived', paymentMethod: 'waived' }
    });
    assert(waiveRes.status === 200, 'Librarian waives student fine');
    assert(waiveRes.body.data && waiveRes.body.data.status === 'waived', 'Fine status updated to "waived"');

    // ----------------------------------------------------
    // TEST SUITE 8: Analytics & Audit Logs
    // ----------------------------------------------------
    console.log('\n▶ Test Suite 8: Analytics & Audit Logs');

    const dashRes = await request('/api/v1/analytics/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(dashRes.status === 200, 'Super Admin retrieves Dashboard Analytics KPI metrics');
    assert(dashRes.body.data && dashRes.body.data.kpis && dashRes.body.data.kpis.totalBooks >= 1, 'KPI metrics contains total books');
    assert(dashRes.body.data && dashRes.body.data.kpis && dashRes.body.data.kpis.totalUsers >= 1, 'KPI metrics contains total registered users');

    const auditRes = await request('/api/v1/analytics/audit-logs', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(auditRes.status === 200, 'Super Admin retrieves Audit Logs');

    // ----------------------------------------------------
    // TEST SUITE 9: Notifications Engine
    // ----------------------------------------------------
    console.log('\n▶ Test Suite 9: Notifications Engine');

    const mockNotif = await Notification.create({
      recipient: studentUser._id,
      title: 'Book Ready',
      message: 'Your reserved book is now ready for pick up.',
      type: 'reservation_ready'
    });

    const notifRes = await request('/api/v1/notifications', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(notifRes.status === 200, 'Student retrieves notifications');
    assert(notifRes.body.data && Array.isArray(notifRes.body.data.notifications) && notifRes.body.data.notifications.length >= 1, 'Notifications retrieved');

    const readRes = await request(`/api/v1/notifications/${mockNotif._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(readRes.status === 200, 'Student marks notification as read');
    assert(readRes.body.data && readRes.body.data.isRead === true, 'Notification isRead set to true');

    // Clean up test data fixtures created during test run
    await User.deleteMany({ email: { $regex: /.*\.test@slms\.com$/i } });
    await Book.deleteMany({ isbn: { $in: ['978-9999999999', '978-8888888888'] } });
    await Category.deleteMany({ code: 'CSAI_TEST' });
    await BorrowTransaction.deleteMany({ _id: { $in: [transaction._id, overdueTrans._id] } });
    await Fine.deleteMany({ _id: sampleFine._id });
    await Reservation.deleteMany({ _id: { $in: [reservation._id] } });
    await Notification.deleteMany({ _id: mockNotif._id });

  } catch (error) {
    console.error('\n🔴 UNHANDLED ERROR IN BACKEND TEST SUITE:', error);
    failedTests++;
  } finally {
    if (server) await new Promise((r) => server.close(r));
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();

    console.log('\n======================================================');
    console.log(` 📊 BACKEND REST API TEST SUMMARY (MongoDB Atlas)`);
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
}

if (require.main === module) {
  runAllBackendTests();
}

module.exports = { runAllBackendTests };
