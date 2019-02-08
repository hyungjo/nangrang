const mongoose = require('mongoose');

const bookScheme = new mongoose.Schema({
  title: String,
  author: String,
  contents: String,
  published_date: { type: Date, default: Date.now  }
});

module.exports = mongoose.model('book', bookScheme);
