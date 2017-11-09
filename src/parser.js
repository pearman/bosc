const P = require('parsimmon');
const _ = require('lodash');
const astUtils = require('./astUtils.js');
const tableUtils = require('./tableUtils.js');
const vm = require('./vm.js');

function interpretEscapes(str) {
  let escapes = {
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t'
  };
  return str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/, (_, escape) => {
    let type = escape.charAt(0);
    let hex = escape.slice(1);
    if (type === 'u') {
      return String.fromCharCode(parseInt(hex, 16));
    }
    if (escapes.hasOwnProperty(type)) {
      return escapes[type];
    }
    return type;
  });
}

let whitespace = P.regexp(/\s*/m);

function token(parser) {
  return parser.skip(whitespace);
}

function word(str) {
  return P.string(str).thru(token);
}

let local = vm.newLocal();
const PearScript = P.createLanguage({
  expression: r => {
    return P.alt(
      r.true,
      r.false,
      r.null,
      r.symbol,
      r.string,
      r.number,
      r.list,
      r.execute,
      r.method,
      r.map
    );
  },

  symbol: () =>
    P.regexp(/[+\-*/.,?:%a-zA-Z_-][a-zA-Z0-9_-]*/)
      .map(data => ({ type: 'symbol', data }))
      .map(astUtils.astToTable)
      .desc('symbol'),

  string: () =>
    token(P.regexp(/'((?:\\.|.)*?)'/, 1))
      .map(interpretEscapes)
      .map(data => ({ type: 'string', data }))
      .map(astUtils.astToTable)
      .desc('string'),

  number: () =>
    token(P.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/))
      .map(Number)
      .map(data => ({ type: 'number', data }))
      .map(astUtils.astToTable)
      .desc('number'),

  null: () => word('null').result({ type: 'null', _data: null }),

  true: () => word('true').result({ type: 'boolean', _data: true }),

  false: () => word('false').result({ type: 'boolean', _data: false }),

  execute: r =>
    r.expression
      .trim(P.optWhitespace)
      .many()
      .wrap(P.string('('), P.string(')'))
      .map(data => ({ type: 'execute', data }))
      .map(astUtils.astToTable)
      .map(table => {
        //console.log('EXECUTING', table);
        // try {
        return vm.tableEval(table, [local], false);
        // } catch (err) {
        //   //console.log('FAILURE', err);
        //   return table;
        // }
      }),

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
});

module.exports = PearScript.file;
