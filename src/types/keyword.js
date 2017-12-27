const _ = require('lodash');
const Table = require('./table');
const argUtils = require('./utils/argUtils');

let setMode = {
  args: argUtils.args('value'),
  _eval: (self, args, ns, tableEval, types, method) => {
    if (_.get(args[1], 'isKeyword', false))
      _.set(self, _.get(method, 'value'), _.get(args[0], 'value'));
    else _.set(self, _.get(method, 'value'), args[0]);
    return self;
  }
};

let getMode = {
  args: argUtils.args(),
  _eval: (self, args, ns, tableEval, types, method) => {
    return _.get(self, _.get(method, 'value'), null);
  }
};

let methods = {
  toSymbol: {
    args: argUtils.args(),
    _eval: (self, args, ns, tableEval, types) => {
      return self.value;
    }
  }
};

module.exports = {
  Get: Table(_.assign({}, methods, getMode)),
  Set: Table(_.assign({}, methods, setMode))
};
