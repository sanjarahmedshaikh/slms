const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      index: true
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      index: true
    },
    authors: [
      {
        type: String,
        required: true,
        trim: true
      }
    ],
    publisher: {
      type: String,
      default: 'Unknown Publisher'
    },
    publicationYear: {
      type: Number,
      default: new Date().getFullYear()
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false
    },
    genres: [{ type: String }],
    totalCopies: {
      type: Number,
      required: [true, 'Total copies count is required'],
      min: [1, 'Total copies must be at least 1'],
      default: 1
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    },
    shelfLocation: {
      type: String,
      default: 'Section A - Shelf 1'
    },
    coverImageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['available', 'low_stock', 'out_of_stock', 'maintenance'],
      default: 'available'
    }
  },
  { timestamps: true }
);

bookSchema.index({ category: 1, status: 1 });
bookSchema.index({ title: 'text', description: 'text' });

bookSchema.pre('save', function (next) {
  if (this.availableCopies === 0) {
    this.status = 'out_of_stock';
  } else if (this.availableCopies <= 2) {
    this.status = 'low_stock';
  } else {
    this.status = 'available';
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
