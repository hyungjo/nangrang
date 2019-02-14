/**
 * GET /book
 * Book page.
 */
exports.getRecord = (req, res) => {
  res.render('record/record', {
    title: 'Record'
  });
};
