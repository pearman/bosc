const interpreter = require('../src/interpreter.1');

// Recursion
// interpreter.eval(`
//     ; Starting comment
//     local set :fun #([x] ; Comment test
//       x < 5 ?
//         $(fun (x + 1)) ; another comment
//         x ; Check my comment yo
//     ) ,

//     $(fun -5) = 5 ? 'PASS' 'FAIL----'
//   `);
// Map
interpreter
  .eval(
    `
    ; Starting comment
    [1 2 3 4]
      map #([x] x * 4 / 2)
      isSameArrayAs [2 4 6 8] ; comment
      ? 'PASS' 'FAIL----'
      print

    ; Ending comment
  `
  )
  .subscribe();
// Numerical Comparison
// interpreter
//   .eval(
//     `
//     1 < 2 ? 'PASS' 'FAIL' print ,
//     1 > 2 ? 'FAIL----' 'PASS' print ,
//     2 <= 2 ? 'PASS' 'FAIL----' print ,
//     3 <= 2 ? 'FAIL----' 'PASS' print ,
//     2 >= 2 ? 'PASS' 'FAIL----' print ,
//     2 >= 3 ? 'FAIL----' 'PASS' print
//   `
//   )
//   .subscribe();
// Simple iteration
interpreter
  .eval(
    `
    5 times #([x] x + 1)
      isSameArrayAs [1 2 3 4 5]
      ? 'PASS' 'FAIL----'
      print
  `
  )
  .subscribe();

// // Getters and setters
// interpreter.eval(`
//   local : x [1 2 3 4] ,
//   x . 1 = 2
//     ? 'PASS' 'FAIL----'
//     print
// `);

// // Metaprogramming
// interpreter.eval(`
//   local : fun #([x] x + 5) ,
//   $(fun 5) = 10 ;comment
//     ? 'PASS' 'FAIL---' print,
//   local . fun :symbol 1 ('*' toSymbol) ,
//   $(fun 5) = 25
//     ? 'PASS' 'FAIL---' print
// `);

// // Nested function
// interpreter.eval(`
//     local : countdown #([x] ;comment
//       x times #([y] x - y)
//       push 'BOOM'
//     ) ,

//     $(countdown 3)
//       isSameArrayAs [3 2 1 'BOOM']
//       ? 'PASS' 'FAIL---' print
// `);

// // Class
// interpreter.eval(`
//   local : Person #([name age] {
//     name name
//     age age
//     checkAge #([] this . age >= 18)
//   }) ,

//   local : gabe $(Person 'Gabe ; will break?' 23) ,
//   local : larry $(Person 'Larry' 15) ,

//   gabe . name = 'Gabe ; will break?' ? 'PASS' 'FAIL---' ,
//   gabe checkAge = true ? 'PASS' 'FAIL---' ,

//   larry . name = 'Larry' ? 'PASS' 'FAIL---' ,
//   larry checkAge = false ? 'PASS' 'FAIL---'
// `);
