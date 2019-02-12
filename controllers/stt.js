var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var request = require('request');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

exports.postStt = (req, res) => {
  var fileName = req.body.fileName;
  var filePath = path.join(__dirname, '/../uploads/', fileName);

  fs.readFile(filePath, function(err, data) {
    if(err) {
      console.log('ERROR: cannot read file in post /stt');
      console.log('file: ' + filePath);
      res.send('error');
    } else {

      var header = {
        'timestamps': true,
        'word_alternatives_threshold': 0.9,
        'keywords': '%22colorado%22%2C%22tornado%22%2C%22tornadoes%22',
        'keywords_threshold': 0.5,
        'Content-Type': 'audio/wav'
      };

      var options = {
        url: 'https://stream.aibril-watson.kr/speech-to-text/api/v1/recognize?model=ko-KR_BroadbandModel',
        method: 'POST',
        headers: header,
        auth: {
          'user': process.env.STT_USERNAME,
          'pass': process.env.STT_PASSWORD
        },
        body: data
      };

      request(options, function(error, response, body) {
        if(error) {
          console.log('ERROR: cannot get response in post /stt');
          console.log(body);

          res.send('error');
        } else {
          console.log('stt api response success');
          console.log(body);

          var sttResults = body;

          res.send(sttResults);
        }
      });
    }
  });
};
