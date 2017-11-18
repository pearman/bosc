const _ = require('lodash');
const Table = require('./table');
const argUtils = require('./utils/argUtils');

let String = {
  '+': {
    args: argUtils.args('value'),
    _eval: (self, args, ns, tableEval, types) => {
      return types.toType(self.value + args[0].value, types.String);
    }
  }
};

module.exports = _.merge({}, Table, String);
