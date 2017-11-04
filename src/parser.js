const P = require('parsimmon');

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
    P.regexp(/[+\-*/?:%a-zA-Z_-][a-zA-Z0-9_-]*/)
      .map(data => ({ type: 'symbol', data }))
      .desc('symbol'),

  string: () =>
    token(P.regexp(/'((?:\\.|.)*?)'/, 1))
      .map(interpretEscapes)
      .map(data => ({ type: 'string', data }))
      .desc('string'),

  number: () =>
    token(P.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/))
      .map(Number)
      .map(data => ({ type: 'number', data }))
      .desc('number'),

  null: () => word('null').result({ type: 'null', _data: null }),

  true: () => word('true').result({ type: 'boolean', _data: true }),

  false: () => word('false').result({ type: 'boolean', _data: false }),

  execute: r =>
    r.expression
      .trim(P.optWhitespace)
      .many()
      .wrap(P.string('('), P.string(')'))
      .map(data => ({ type: 'execute', data })),

  list: r =>
    r.expression
      .trim(P.optWhitespace)
      .many()
      .wrap(P.string('['), P.string(']'))
      .map(data => ({ type: 'list', data })),

  map: r =>
    r.expression
      .trim(P.optWhitespace)
      .many()
      .wrap(P.string('{'), P.string('}'))
      .map(data => ({ type: 'map', data })),

  method: r =>
    r.expression
      .trim(P.optWhitespace)
      .many()
      .wrap(P.string('|'), P.string('|'))
      .map(data => ({ type: 'method', data })),

  file: r => r.expression.trim(P.optWhitespace).many()
});

module.exports = PearScript.file;
