const _ = require('lodash');
const argUtils = require('./utils/argUtils');
const tableUtils = require('./utils/tableUtils');
//const Boolean = require('./boolean');

let Table = {
  '=': {
    args: argUtils.args('object'),
    _eval: (self, args, ns, tableEval, types) => {
      return _.merge({}, types.Boolean, { value: _.isEqual(self, args[0]) });
    }
  },
  isSameArrayAs: {
    args: argUtils.args('object'),
    _eval: (self, args, ns, tableEval, types) => {
      let index = 0;
      let left = true;
      let right = true;
      let value = true;
      while (left && right) {
        left = self[index];
        right = args[0][index];
        if (!_.isEqual(left, right)) {
          value = false;
          break;
        }
        index++;
      }
      return _.merge({}, types.Boolean, { value });
    }
  },
  ':': {
    args: argUtils.args('key', 'value'),
    _doNotResolveArgs: true,
    _eval: (self, args, ns) => {
      _.set(self, [args[0]], argUtils.resolveArg(args[1], ns));
      return self;
    }
  },
  '.': {
    args: argUtils.args('key'),
    _doNotResolveArgs: true,
    _eval: (self, args, ns) => {
      return _.get(self, _.get(args[0], 'value', args[0]), null);
    }
  },
  ',': {
    args: argUtils.args('object'),
    _eval: (self, args, ns) => args[0]
  },
  print: {
    args: argUtils.args(),
    _eval: (self, args, ns) => {
      if (!_.isNil(self.value)) console.log(self.value);
      else console.log(self);
      return self;
    }
  },
  deepPrint: {
    args: argUtils.args(),
    _eval: (self, args, ns) => {
      console.log(self);
      return self;
    }
  },
  aPrint: {
    args: argUtils.args(),
    _eval: (self, args, ns) => {
      let index = 0;
      let curr;
      let items = [];
      while ((curr = self[index++])) {
        items.push(_.get(curr, 'value', '[Table]'));
      }
      let output = items.join(',');
      if (output.length > 80) output = output.replace(/[,]/g, '\n');
      else output = output.replace(/[,]/g, ' ');
      console.log(`[${output}]`);
      return self;
    }
  },
  map: {
    args: argUtils.args('function'),
    _eval: (self, args, ns, tableEval) => {
      let index = 0;
      let curr;
      let newArr = _.merge({}, Table);
      while ((curr = self[index++])) {
        newArr[index - 1] = tableEval(
          args[0],
          ns.concat([{ [args[0].args[0]]: curr }])
        );
      }
      return newArr;
    }
  },
  reduce: {
    args: argUtils.args('function', 'accumulator'),
    _eval: (self, args, ns, tableEval) => {
      let index = 0;
      let curr;
      let newArr = args[1];
      while ((curr = self[index++])) {
        newArr = tableEval(
          args[0],
          ns.concat([{ [args[0].args[0]]: newArr, [args[0].args[1]]: curr }])
        );
      }
      return newArr;
    }
  }
};

module.exports = Table;
