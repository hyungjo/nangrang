/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('book/SpeechCatch', {
    title: 'Home'
  });
};
