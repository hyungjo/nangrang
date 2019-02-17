const request = require('request');
var difflib = require('difflib');

/**
 * GET /book
 * Book page.
 */
exports.getRecord = (req, res) => {
  res.render('record/record', {
    title: 'Record'
  });
};

exports.setRecord = (req, res) => {
  res.status(200);
  res.json({});
};

exports.finishRecord = (req, res) => {
  console.log(req.body.str1);
  console.log(req.body.str2);

  const s = new difflib.SequenceMatcher(null, req.body.str1, req.body.str2);

  console.log(s.ratio());
  res.status(200);
  res.json({score: s.ratio() * 100});
};
