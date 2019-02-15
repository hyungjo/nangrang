/**
 * GET /book
 * Book page.
 */

const request = require('request');
const xml2js = require('xml2js');
const Book = require('../models/Book.js');
const User = require('../models/User');
const Favorite = require('../models/Favorite');

exports.getBook = (req, res) => {
  Book.find({}, (err, bookList) => {
    if (err) { console.log(err); } else {
      res.render('book/book', {
        title: 'Book',
        books: bookList
      });
    }
  });


};

exports.insertJson = (req, res) => {
  var jsondata = [];

  var eee =     [{ user: 'sk01@sk.com', isbn: '9788950979300', stars: '5' },
    { user: 'sk01@sk.com', isbn: '9788952795090', stars: '4' },
    { user: 'sk01@sk.com', isbn: '9788950971441', stars: '4' },
    { user: 'sk01@sk.com', isbn: '9788936447014', stars: '5' },
    { user: 'sk01@sk.com', isbn: '9791156397267', stars: '4' },
    { user: 'sk01@sk.com', isbn: '9788966350957', stars: '5' },
    { user: 'sk01@sk.com', isbn: '9791130620459', stars: '1' },
    { user: 'sk01@sk.com', isbn: '9788935212484', stars: '1' },
    { user: 'sk01@sk.com', isbn: '9788950979430', stars: '1' },
    { user: 'sk01@sk.com', isbn: '9791195522125', stars: '2' },
    { user: 'sk02@sk.com', isbn: '9788966350957', stars: '5' },
    { user: 'sk02@sk.com', isbn: '9791156397267', stars: '4' },
    { user: 'sk02@sk.com', isbn: '9788950971441', stars: '5' },
    { user: 'sk02@sk.com', isbn: '9788952795090', stars: '4' },
    { user: 'sk02@sk.com', isbn: '9788950979300', stars: '5' },
    { user: 'sk02@sk.com', isbn: '9791162339466', stars: '3' },
    { user: 'sk02@sk.com', isbn: '9791158681531', stars: '5' },
    { user: 'sk02@sk.com', isbn: '9791188874262', stars: '4' },
    { user: 'sk03@sk.com', isbn: '9788935212484', stars: '5' },
    { user: 'sk03@sk.com', isbn: '9791158510244', stars: '5' },
    { user: 'sk03@sk.com', isbn: '9791186757093', stars: '3' },
    { user: 'sk03@sk.com', isbn: '9788997092772', stars: '5' },
    { user: 'sk03@sk.com', isbn: '9788965707561', stars: '4' },
    { user: 'sk03@sk.com', isbn: '9788957369937', stars: '5' },
    { user: 'sk03@sk.com', isbn: '9788937461033', stars: '5' },
    { user: 'sk03@sk.com', isbn: '8949190028', stars: '4' },
    { user: 'sk03@sk.com', isbn: '9788932903187', stars: '5' },
    { user: 'sk03@sk.com', isbn: '8973374931', stars: '5' },
    { user: 'sk03@sk.com', isbn: '9791130620459', stars: '1' },
    { user: 'sk03@sk.com', isbn: '9791187498384', stars: '2' },
    { user: 'sk03@sk.com', isbn: '9788950979300', stars: '1' },
    { user: 'sk04@sk.com', isbn: '9788937461033', stars: '5' },
    { user: 'sk04@sk.com', isbn: '8949190028', stars: '5' },
    { user: 'sk04@sk.com', isbn: '9788937460470', stars: '5' },
    { user: 'sk04@sk.com', isbn: '9788932903187', stars: '5' },
    { user: 'sk04@sk.com', isbn: '8973374931', stars: '5' },
    { user: 'sk04@sk.com', isbn: '9791196067694', stars: '4' },
    { user: 'sk04@sk.com', isbn: '9791160560640', stars: '3' },
    { user: 'sk04@sk.com', isbn: '9788934982975', stars: '5' },
    { user: 'sk04@sk.com', isbn: '9788965707561', stars: '5' },
    { user: 'sk04@sk.com', isbn: '9788997092772', stars: '5' },
    { user: 'sk04@sk.com', isbn: '9791158510244', stars: '5' },
    { user: 'sk04@sk.com', isbn: '9788950979300', stars: '1' },
    { user: 'sk04@sk.com', isbn: '9788952795090', stars: '1' },
    { user: 'sk04@sk.com', isbn: '9791162339466', stars: '1' },
    { user: 'sk04@sk.com', isbn: '9788934982975', stars: '1' },
    { user: 'sk04@sk.com', isbn: '9791187345268', stars: '1' },
    { user: 'sk04@sk.com', isbn: '9791160560640', stars: '1' },
    { user: 'sk04@sk.com', isbn: '9791187498384', stars: '1' },
    { user: 'sk05@sk.com', isbn: '8973374931', stars: '5' },
    { user: 'sk05@sk.com', isbn: '9788935212484', stars: '5' },
    { user: 'sk05@sk.com', isbn: '9791186560860', stars: '5' },
    { user: 'sk05@sk.com', isbn: '9791158510244', stars: '5' },
    { user: 'sk05@sk.com', isbn: '9788997396870', stars: '5' },
    { user: 'sk05@sk.com', isbn: '9791186757093', stars: '4' },
    { user: 'sk05@sk.com', isbn: '9791160560640', stars: '3' },
    { user: 'sk05@sk.com', isbn: '9788934982975', stars: '5' },
    { user: 'sk05@sk.com', isbn: '9791189709440', stars: '5' },
    { user: 'sk05@sk.com', isbn: '9791187498384', stars: '1' },
    { user: 'sk05@sk.com', isbn: '9791188874262', stars: '1' },
    { user: 'sk05@sk.com', isbn: '9788950979317', stars: '2' },
    { user: 'sk05@sk.com', isbn: '9791187119845', stars: '1' },
    { user: 'ke01@sk.com', isbn: '9788937461033', stars: '5  ' },
    { user: 'ke01@sk.com', isbn: '8949190028', stars: '4 ' },
    { user: 'ke01@sk.com', isbn: '9788952795090', stars: '1  ' },
    { user: 'ke01@sk.com', isbn: '9788937460470', stars: '5' },
    { user: 'ke01@sk.com', isbn: '9788932903187', stars: '5' },
    { user: 'ke01@sk.com', isbn: '9791130620459', stars: '5' },
    { user: 'ke01@sk.com', isbn: '9791196067694', stars: '4' },
    { user: 'ke01@sk.com', isbn: '9788965746669', stars: '5' },
    { user: 'ke01@sk.com', isbn: '9791160560640', stars: '5' },
    { user: 'ke01@sk.com', isbn: '9788965707561', stars: '1' },
    { user: 'ke02@sk.com', isbn: '8949190028', stars: '5 ' },
    { user: 'ke02@sk.com', isbn: '9788937460470', stars: '5 ' },
    { user: 'ke02@sk.com', isbn: '9788932903187', stars: '4 ' },
    { user: 'ke02@sk.com', isbn: '8973374931', stars: '5 ' },
    { user: 'ke02@sk.com', isbn: '9788934972464', stars: '5 ' },
    { user: 'ke02@sk.com', isbn: '9791160560510', stars: '5 ' },
    { user: 'ke02@sk.com', isbn: '9788934982975', stars: '5 ' },
    { user: 'ke02@sk.com', isbn: '9788954637756', stars: '5 ' },
    { user: 'ke02@sk.com', isbn: '9791186560860', stars: '1 ' },
    { user: 'ke02@sk.com', isbn: '9791157280292', stars: '1' },
    { user: 'ke03@sk.com', isbn: '9788935212484', stars: '5' },
    { user: 'ke03@sk.com', isbn: '9791186560860', stars: '4' },
    { user: 'ke03@sk.com', isbn: '9791158510244', stars: '5' },
    { user: 'ke03@sk.com', isbn: '9788997396870', stars: '5' },
    { user: 'ke03@sk.com', isbn: '9791187498384', stars: '4' },
    { user: 'ke03@sk.com', isbn: '9791157280292', stars: '5' },
    { user: 'ke03@sk.com', isbn: '9788932034942', stars: '5' },
    { user: 'ke03@sk.com', isbn: '9791187119845', stars: '5' },
    { user: 'ke03@sk.com', isbn: '8949190028', stars: '1' },
    { user: 'ke03@sk.com', isbn: '9788950979317', stars: '1' },
    { user: 'ke04@sk.com', isbn: '9791186757093', stars: '5' },
    { user: 'ke04@sk.com', isbn: '9791189709440', stars: '5' },
    { user: 'ke04@sk.com', isbn: '9791196588502', stars: '5' },
    { user: 'ke04@sk.com', isbn: '9788957369937', stars: '4' },
    { user: 'ke04@sk.com', isbn: '9788934994862', stars: '5' },
    { user: 'ke04@sk.com', isbn: '9788950979430', stars: '5' },
    { user: 'ke04@sk.com', isbn: '9788954653817', stars: '4' },
    { user: 'ke04@sk.com', isbn: '9788998046682', stars: '5' },
    { user: 'ke04@sk.com', isbn: '9788965746669', stars: '1' },
    { user: 'ke04@sk.com', isbn: '9791188874262', stars: '1' },
    { user: 'ke05@sk.com', isbn: '9788965707561', stars: '4' },
    { user: 'ke05@sk.com', isbn: '9788997092772', stars: '4' },
    { user: 'ke05@sk.com', isbn: '9788957369937', stars: '5' },
    { user: 'ke05@sk.com', isbn: '9791196588502', stars: '5' },
    { user: 'ke05@sk.com', isbn: '9788954619578', stars: '4' },
    { user: 'ke05@sk.com', isbn: '9791195522125', stars: '3' },
    { user: 'ke05@sk.com', isbn: '9788998046682', stars: '5' },
    { user: 'ke05@sk.com', isbn: '9788954653817', stars: '5' },
    { user: 'ke05@sk.com', isbn: '9788937460470', stars: '2' },
    { user: 'ke05@sk.com', isbn: '9788934972464', stars: '1' }];

  eee.forEach((n) => {
    jsondata.push(n);
  });

  jsondata.forEach((fav) => {
    const favo = new Favorite(fav);
    favo.save((err) => {
      if(err)
        console.log(err);
    });
  });
};

exports.getPythonFunction = (req, res) => {
  // Use child_process.spawn method from
  // child_process module and assign it
  // to variable spawn

  const spawn = require('child_process').spawn;

  // Parameters passed in spawn -
  // 1. type_of_script
  // 2. list containing Path of the script
  //    and arguments for the script

  // E.g : http://localhost:3000/name?firstname=Mike&lastname=Will
  // so, first name = Mike and last name = Will
  const process = spawn('python3', [`${__dirname}/collaborativefilltering.py`, 1, 2]);
  console.log('pypypy');
  // Takes stdout data from script which executed
  // with arguments and send this data to res object
  process.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  process.stderr.on('data', (data) => {
    console.log(`stderr: ${data.toString()}`);
  });

  process.on('exit', (code) => {
    console.log(`child process exited with code ${code.toString()}`);
  });
};

// /book/setfavoritebook
// 도서 평점 등록
// Params: ISBN, stars
exports.regFavoriteBook = (req, res) => {
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    console.log(req.user.id);
    console.log(user.email);
    const favorite = new Favorite({
      user: req.user.id,
      isbn: req.body.isbn,
      stars: req.body.stars
    });
    favorite.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: '이미 등록된 도서입니다.' });
          return res.redirect('/book');
        }
        console.log(err);
      } else {
        res.status(200);
        res.send('SUCCESS');
      }
    });
  });
};

// /book/getfavoritebook
// 내가 평가한 도서 목록 열람
exports.getFavoriteBook = (req, res) => {
  Favorite.findById(req.user.id, (err, favorite) => {
    if (err) { return next(err); }
    res.status(200);
    res.json(favorite);
  });
};

// /book/reg
// 도서 등록
// Params: ISBN
exports.regBook = (req, res) => {
  const options = {
    url: `https://openapi.naver.com/v1/search/book_adv.xml?d_isbn=${req.body.isbn}`,
    headers: {
      'X-Naver-Client-Id': 'O2oE1113zyse0UqLI6js',
      'X-Naver-Client-Secret': 'WAnjerzG5b'
    }
  };

  User.findById(req.user.id, (err, user) => {
    request(options, (error, response, body) => {
      if (error) console.log(error);
      xml2js.parseString(body, (err, result) => {
        if (err) console.log(err);
        const book = new Book({
          title: result.rss.channel[0].item[0].title,
          author: result.rss.channel[0].item[0].author,
          publisher: result.rss.channel[0].item[0].publisher,
          pubdate: result.rss.channel[0].item[0].pubdate,
          isbn: result.rss.channel[0].item[0].isbn,
          link: result.rss.channel[0].item[0].link,
          image: result.rss.channel[0].item[0].image,
          description: result.rss.channel[0].item[0].description
        });
        book.save((err) => {
          if (err) { console.log(err); } else {
            res.status(200);
            console.log(book);
            res.json(book);
          }
        });
      });
    });
  });
};

// /book/get
// 전체 도서 목록 열람
exports.getBookList = (req, res) => {
  Book.find({}, (err, books) => {
    if (err) { console.log(err); } else {
      res.status(200);
      res.json(books);
    }
  });
};

// /book/info
// ISBN에 대한 도서 정보 열람
// Params: ISBN
exports.getBookInfo = (req, res) => {
  Book.findOne({ isbn: req.body.isbn }, (err, info) => {
    if (err) { console.log(err); } else {
      console.log(info);
      res.status(200);
      res.json(info);
    }
  });
};

// /book/best
exports.getBestBook = (req, res) => {
  const bestBookList = [];
  const bestBookIsbn = [];

  // Best Seller List
  // 소설
  bestBookIsbn.push('9788937461033'); // 인간실격 다자이 오사무
  bestBookIsbn.push('8949190028'); // 모모
  bestBookIsbn.push('9788937460470'); // 호밀밭의 파수꾼
  bestBookIsbn.push('9788932903187'); // 향수
  bestBookIsbn.push('8973374931'); // 눈먼자들의도시

  // // 어린이
  // bestBookIsbn.push('9788950979300');
  // bestBookIsbn.push('9788952795090');
  // bestBookIsbn.push('9788950979317');
  // bestBookIsbn.push('9791188874262');
  // bestBookIsbn.push('9791162339466');
  // bestBookIsbn.push('9788936447014');
  // bestBookIsbn.push('9788950971441');
  // bestBookIsbn.push('9791158681531');
  // bestBookIsbn.push('9788966350957');
  // bestBookIsbn.push('9791156397267');
  //
  // // 인문
  // bestBookIsbn.push('9791130620459');
  // bestBookIsbn.push('9791196067694');
  // bestBookIsbn.push('9788965746669');
  // bestBookIsbn.push('9791160560640');
  // bestBookIsbn.push('9788934972464');
  // bestBookIsbn.push('9791160560510');
  // bestBookIsbn.push('9788934982975');
  // bestBookIsbn.push('9788954637756');
  // bestBookIsbn.push('9788994120966');
  // bestBookIsbn.push('9791187345268');
  //
  // // 자기계발
  // bestBookIsbn.push('9788935212484');
  // bestBookIsbn.push('9791186560860');
  // bestBookIsbn.push('9791158510244');
  // bestBookIsbn.push('9788997396870');
  // bestBookIsbn.push('9791186757093');
  // bestBookIsbn.push('9791189709440');
  // bestBookIsbn.push('9791196588502');
  // bestBookIsbn.push('9788957369937');
  // bestBookIsbn.push('9788997092772');
  // bestBookIsbn.push('9788965707561');
  //
  // // 시/에세이
  // bestBookIsbn.push('9791187498384');
  // bestBookIsbn.push('9791157280292');
  // bestBookIsbn.push('9788932034942');
  // bestBookIsbn.push('9791187119845');
  // bestBookIsbn.push('9788934994862');
  // bestBookIsbn.push('9788950979430');
  // bestBookIsbn.push('9788954653817');
  // bestBookIsbn.push('9788998046682');
  // bestBookIsbn.push('9791195522125');
  // bestBookIsbn.push('9788954619578');

  let completedRequestCount = 0;

  bestBookIsbn.forEach((isbn) => {
    const options = {
      url: `https://openapi.naver.com/v1/search/book_adv.xml?d_isbn=${isbn}`,
      headers: {
        'X-Naver-Client-Id': 'O2oE1113zyse0UqLI6js',
        'X-Naver-Client-Secret': 'WAnjerzG5b'
      }
    };

    request(options, (error, response, body) => {
      if (error) console.log(error);
      xml2js.parseString(body, (err, result) => {
        if (err) console.log(err);
        console.log(result);
        bestBookList.push(new Book({
          title: result.rss.channel[0].item[0].title,
          author: result.rss.channel[0].item[0].author,
          publisher: result.rss.channel[0].item[0].publisher,
          pubdate: result.rss.channel[0].item[0].pubdate,
          isbn: result.rss.channel[0].item[0].isbn,
          link: result.rss.channel[0].item[0].link,
          image: result.rss.channel[0].item[0].image,
          description: result.rss.channel[0].item[0].description
        }));
        completedRequestCount++;
        if (completedRequestCount === bestBookIsbn.length) {
          res.json(bestBookList);
        }
      });
    });
  });
};

// http://localhost:8000/recommend?user_id=254
// http://localhost:8000/match?str1=abc&str2=bbd

