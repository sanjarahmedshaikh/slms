const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Ignore
}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Category = require('../models/Category');
const Book = require('../models/Book');
const BorrowTransaction = require('../models/BorrowTransaction');
const Fine = require('../models/Fine');
const Reservation = require('../models/Reservation');
const AuditLog = require('../models/AuditLog');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedData = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || '';
    mongoUri = mongoUri.replace(/^["']|["']$/g, '');

    console.log(`Connecting directly to MongoDB Atlas...`);
    await mongoose.connect(mongoUri);
    console.log('Successfully connected to MongoDB Atlas database!');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Book.deleteMany({}),
      BorrowTransaction.deleteMany({}),
      Fine.deleteMany({}),
      Reservation.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('Cleared existing database collections on MongoDB Atlas.');

    // Seed Categories
    const categories = await Category.insertMany([
      { name: 'Computer Science', code: 'CS', description: 'Software engineering, AI, and systems' },
      { name: 'Artificial Intelligence', code: 'AI', description: 'Machine learning, deep learning, LLMs' },
      { name: 'Business & Finance', code: 'BUS', description: 'Economics, leadership, startup guide' },
      { name: 'Physics & Mathematics', code: 'PHY', description: 'Quantum mechanics, calculus, statistics' },
      { name: 'Literature & Fiction', code: 'LIT', description: 'Classics, modern fiction, drama' }
    ]);

    const csCat = categories.find((c) => c.code === 'CS')._id;
    const aiCat = categories.find((c) => c.code === 'AI')._id;
    const busCat = categories.find((c) => c.code === 'BUS')._id;

    // Seed Users
    const users = await User.create([
      {
        fullName: 'Dr. Sarah Connor (Super Admin)',
        email: 'admin@slms.com',
        password: 'admin123',
        role: 'super_admin',
        memberId: 'ADM-001001',
        department: 'Information Technology',
        phone: '+91 98765 43210'
      },
      {
        fullName: 'Marcus Vance (Chief Librarian)',
        email: 'librarian@slms.com',
        password: 'librarian123',
        role: 'librarian',
        memberId: 'LIB-002002',
        department: 'Library Operations',
        phone: '+91 98123 45678'
      },
      {
        fullName: 'Alex Mercer (Student)',
        email: 'student@slms.com',
        password: 'student123',
        role: 'student',
        memberId: 'STU-2026-042',
        department: 'Computer Science',
        phone: '+91 97654 32109'
      },
      {
        fullName: 'Prof. Jonathan Reed (Faculty)',
        email: 'faculty@slms.com',
        password: 'faculty123',
        role: 'faculty',
        memberId: 'FAC-2026-007',
        department: 'Artificial Intelligence',
        phone: '+91 99887 76655'
      }
    ]);

    const admin = users[0];
    const librarian = users[1];
    const student = users[2];

    // Seed Books
    const books = await Book.create([
      {
        title: 'Designing Data-Intensive Applications',
        isbn: '978-1449373320',
        authors: ['Martin Kleppmann'],
        publisher: "O'Reilly Media",
        publicationYear: 2017,
        category: csCat,
        genres: ['System Architecture', 'Distributed Systems'],
        totalCopies: 5,
        availableCopies: 3,
        shelfLocation: 'Rack A - Shelf 3',
        coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        description: 'The definitive guide to the architecture of storage engines, stream processing, and fault tolerance.'
      },
      {
        title: 'Deep Learning with Python (2nd Edition)',
        isbn: '978-1617296864',
        authors: ['François Chollet'],
        publisher: 'Manning Publications',
        publicationYear: 2021,
        category: aiCat,
        genres: ['Machine Learning', 'Python'],
        totalCopies: 4,
        availableCopies: 2,
        shelfLocation: 'Rack B - Shelf 1',
        coverImageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400',
        description: 'Comprehensive introduction to deep learning written by the creator of Keras.'
      },
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        isbn: '978-0132350884',
        authors: ['Robert C. Martin'],
        publisher: 'Prentice Hall',
        publicationYear: 2008,
        category: csCat,
        genres: ['Software Engineering', 'Best Practices'],
        totalCopies: 6,
        availableCopies: 5,
        shelfLocation: 'Rack A - Shelf 1',
        coverImageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400',
        description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.'
      },
      {
        title: 'The Lean Startup',
        isbn: '978-0307887894',
        authors: ['Eric Ries'],
        publisher: 'Crown Business',
        publicationYear: 2011,
        category: busCat,
        genres: ['Entrepreneurship', 'Management'],
        totalCopies: 3,
        availableCopies: 1,
        shelfLocation: 'Rack C - Shelf 2',
        coverImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
        description: 'How Today’s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses.'
      }
    ]);

    // Seed Active Transactions & Fines
    const dueDate1 = new Date();
    dueDate1.setDate(dueDate1.getDate() + 10);

    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - 5);

    await BorrowTransaction.create({
      user: student._id,
      book: books[0]._id,
      issuedBy: librarian._id,
      issueDate: new Date(),
      dueDate: dueDate1,
      status: 'issued'
    });

    const trans2 = await BorrowTransaction.create({
      user: student._id,
      book: books[1]._id,
      issuedBy: librarian._id,
      issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      dueDate: overdueDate,
      status: 'overdue'
    });

    await Fine.create({
      transaction: trans2._id,
      user: student._id,
      amount: 5.0,
      overdueDays: 5,
      status: 'unpaid'
    });

    await AuditLog.create({
      performedBy: admin._id,
      action: 'SYSTEM_SEED',
      module: 'DATABASE',
      details: { message: 'Database populated with initial demo records on MongoDB Atlas.' }
    });

    console.log('----------------------------------------------------');
    console.log('✅ SEEDING TO MONGODB ATLAS COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('Demo Account Credentials:');
    console.log(' - Admin:     admin@slms.com / admin123');
    console.log(' - Librarian: librarian@slms.com / librarian123');
    console.log(' - Student:   student@slms.com / student123');
    console.log(' - Faculty:   faculty@slms.com / faculty123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB Atlas Seeding Failed:', err);
    process.exit(1);
  }
};

seedData();
