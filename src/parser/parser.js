const P = require('parsimmon');
const _ = require('lodash');

const astUtils = require('./astUtils');
const tableUtils = require('../types/utils/tableUtils');
const parserUtils = require('./parserUtils');
const vm = require('../vm');

let local = vm.newLocal();
const PearScript = P.createLanguage({
  expression: r => {
    return P.alt(
      r.true,
      r.false,
      r.null,
      r.number,
      r.symbol,
      r.string,
      r.list,
      r.execute,
      r.executeFunction,
      r.method,
      r.map
    );
  },

  symbol: () =>
    P.regexp(/[+\-*/.,<>=?:%a-zA-Z_-][a-zA-Z0-9_-]*/)
      .map(data => ({ type: 'symbol', data }))
      .map(astUtils.astToTable)
      .desc('symbol'),

  string: () =>
    parserUtils
      .token(P.regexp(/'((?:\\.|.)*?)'/, 1))
      .map(parserUtils.interpretEscapes)
      .map(data => ({ type: 'string', data }))
      .map(astUtils.astToTable)
      .desc('string'),

  number: () =>
    parserUtils
      .token(P.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/))
      .map(Number)
      .map(data => ({ type: 'number', data }))
      .map(astUtils.astToTable)
      .desc('number'),

  null: () => parserUtils.word('null').result({ type: 'null', _data: null }),

  true: () => parserUtils.word('true').result({ type: 'boolean', _data: true }),

  false: () =>
    parserUtils.word('false').result({ type: 'boolean', _data: false }),

  execute: r =>
    r.expression
      .trim(P.optWhitespace)
      .many()
      .wrap(P.string('('), P.string(')'))
      .map(data => ({ type: 'execute', data }))
      .map(astUtils.astToTable),

  executeFunction: r =>
    r.expression
      .trim(P.optWhitespace)
      .many()
      .wrap(P.string('$('), P.string(')'))
      .map(data => ({ type: 'executeFunction', data }))
      .map(astUtils.astToTable),
  // .map(table => {
  //   return vm.tableEval(table, [local], false);
  // }),

  list: r =>
    r.expression
      .trim(P.optWhitespace)
      .many()
      .wrap(P.string('['), P.string(']'))
      .map(data => ({ type: 'list', data }))
      .map(astUtils.astToTable),

  map: r =>
    r.expression
      .trim(P.optWhitespace)
      .many()
      .wrap(P.string('{'), P.string('}'))
      .map(data => ({ type: 'map', data }))
      .map(astUtils.astToTable),

  method: r =>
    r.expression
      .trim(P.optWhitespace)
      .many()
      .wrap(P.string('|'), P.string('|'))
      .map(data => ({ type: 'method', data }))
      .map(astUtils.astToTable),

  file: r =>
    r.expression
      .trim(P.optWhitespace)
      .many()
      .map(tableUtils.arrayToTable)
      .map(data => {
        data._context = 'root';
        return data;
      })
});

module.exports = PearScript.file;
