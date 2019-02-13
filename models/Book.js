const mongoose = require('mongoose');

const bookScheme = new mongoose.Schema({
  title: String,
  author: String,
  publisher: String,
  pubdate: String,
  isbn: { type: String, unique: true },
  link: String,
  image: String,
  description: String
});

module.exports = mongoose.model('book', bookScheme);
