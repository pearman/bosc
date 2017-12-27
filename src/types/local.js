const _ = require('lodash');
const Table = require('./table');
const argUtils = require('./utils/argUtils');

let methods = {
  require: {
    args: argUtils.args('lib'),
    _eval: (self, args, ns, tableEval, types) => {
      return require(process.cwd() + '/' + _.get(args[0], 'value'));
    }
  }
};

module.exports = Table(methods);
