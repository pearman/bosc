const _ = require('lodash');
const Table = require('./table');
const argUtils = require('./utils/argUtils');

let methods = {
  require: {
    args: argUtils.args('symbol', 'lib'),
    _eval: (self, args, ns, tableEval, types) => {}
  }
};

module.exports = Table(methods);
