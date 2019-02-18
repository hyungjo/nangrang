/**
 * GET /
 * Home page.
 */

const request = require('request');
const xml2js = require('xml2js');
const Book = require('../models/Book.js');
const User = require('../models/User');
const Favorite = require('../models/Favorite');

exports.getMypage = (req, res) => {
  res.render('mypage/mypage0', {
    title: 'Mypage'
  });
};

exports.getMyEBookList = (req, res) =>{
  console.log('userId: ' + req.user.id);

  if(err) {
    return next(err);
  } else {
    User.findById(req.user.id, (err, eBooks) => {
      if(error) {
        return next(error);
      } else {
        console.log('getMyEbookList success');
        // console.log(eBooks);

        res.status(200);
        res.send('success1');
      }
    });
  }
}

exports.getMypage2 = (req, res) =>{
  if(err) {
    return next(err);
  } else {
    res.status(200);
    res.send('success2');
  }
}

exports.getMypage3 = (req, res) =>{
  console.log('userId: ' + req.user.id);

  if(err) {
    return next(err);
  } else {
    User.findById(req.user.id, (err, eBooks) => {
      if(error) {
        return next(error);
      } else {
        console.log('success');

        res.status(200);
        res.send('success1');
      }
    });
  }
}
