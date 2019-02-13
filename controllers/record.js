var fs = require('fs')


/**
 * Record main page
 */
exports.getRecord = (req, res) => {
  res.render('record/record', {
    title: 'Record'
  });
};

/**
 * Save Record
 */

exports.setRecord = (req, res) => {

  // console.log('New fact for ');
  
  res.json({status: 'ok' });
};