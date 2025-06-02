const Parser = require("./Parser");


console.assert(new Parser(`\t\n'`).parseNumber() === 0, "Should parse number 0");
console.assert(new Parser(`\t\t \n'`).parseNumber() === 2, "Should parse number");

const parser = new Parser(`   \t\n  \t\n`)
parser.parseProgram();
parser.parseProgram();
parser.printStack();
