const mongoose = require('mongoose');

const favoriteScheme = new mongoose.Schema({
  user: String,
  isbn: String,
  stars: String
});

module.exports = mongoose.model('favorite', favoriteScheme);
