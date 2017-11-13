const interpreter = require('./interpreter');

interpreter.eval(`

(local : fun |[x]
  x print ,
  x < 5 ? 
    $(fun (x + 1))
    x
|)
$(fun -5)
([1 2 3 4] map |[x] x + 1| aPrint)

`);
