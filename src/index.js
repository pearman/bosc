const interpreter = require('./interpreter');

// interpreter.eval(`
//   (5 times |[x] x + 1| aPrint)
// `);

tests();

function tests() {
  // Recursion
  interpreter.eval(`
    (local : fun |[x]
      x < 5 ? 
        $(fun (x + 1))
        x
    |)
    
    ($(fun -5) = 5 ? 'PASS' 'FAIL----')
  `);
  // Map
  interpreter.eval(`
    ([1 2 3 4] 
      map |[x] x * 4 / 2| 
      isSameArrayAs [2 4 6 8]
      ? 'PASS' 'FAIL----'
      print)
  `);
  // Numerical Comparison
  interpreter.eval(`
    (1 < 2 ? 'PASS' 'FAIL' print)
    (1 > 2 ? 'FAIL----' 'PASS' print)
    (2 <= 2 ? 'PASS' 'FAIL----' print)
    (3 <= 2 ? 'FAIL----' 'PASS' print)
    (2 >= 2 ? 'PASS' 'FAIL----' print)
    (2 >= 3 ? 'FAIL----' 'PASS' print)
  `);
  // Simple iteration
  interpreter.eval(`
    (5 times |[x] x + 1| 
      isSameArrayAs [1 2 3 4 5]
      ? 'PASS' 'FAIL----'
      print)
  `);
}
