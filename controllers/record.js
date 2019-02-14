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
