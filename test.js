const Parser = require("./Parser");

describe("Parser.parseNumber", () => {
  it("should parse 0", () => {
    expect(new Parser(`\t\n'`).parseNumber()).toBe(0);
  });
  it("should parse 2", () => {
    expect(new Parser(` \t \n'`).parseNumber()).toBe(2);
  });
  it("should parse -5", () => {
    expect(new Parser(`\t\t \t\n'`).parseNumber()).toBe(-5);
  });
  it("should throw if terminal", () => {
    expect(() => new Parser(`\n'`).parseNumber()).toThrow();
  });
});
describe("Parser.parseLabel", () => {
  it("should parse labels", () => {
    expect(new Parser(`\t\n'`).parseLabel()).toBe("\t");
    expect(new Parser(`\n'`).parseLabel()).toBe("");
    expect(new Parser(`\t\t\t  \n'`).parseLabel()).toBe("\t\t\t  ");
  });
});

describe("Parser.parseCommand (stack)", () => {
  it("should handle a single stack command", () => {
    const parser = new Parser(`   \t\t\n`);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([3]);
  });
  it("should handle multiple stack commands", () => {
    const parser = new Parser(`   \t\t\n   \t \t\n`);
    parser.parseCommand();
    parser.parseCommand();
    expect(parser.getStack()).toEqual([3, 5]);
  });
  it("should handle duplicating the last item", () => {
    const parser = new Parser(` \t \t\n`);
    parser.forceStack([1, 2, 3, 4, 5, 6, 7]);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([1, 2, 3, 4, 5, 6, 7, 7]);
  });
  it("should handle popping everything", () => {
    const parser = new Parser(` \t\n\t\t\n`);
    parser.forceStack([1, 2, 3, 4, 5, 6, 7]);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([7]);
  });
  it("should handle popping some items", () => {
    const parser = new Parser(` \t\n \t \n`);
    parser.forceStack([1, 2, 3, 4, 5, 6, 7]);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([1, 2, 3, 4, 7]);
  });
  it("should handle duplicating top value", () => {
    const parser = new Parser(` \n `);
    parser.forceStack([1, 2, 3, 4, 5, 6, 7]);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([1, 2, 3, 4, 5, 6, 7, 7]);
  });
  it("should handle swapping the top values", () => {
    const parser = new Parser(` \n\t`);
    parser.forceStack([1, 2, 3, 4, 5, 6, 7]);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([1, 2, 3, 4, 5, 7, 6]);
  });
  it("should handle popping the top value", () => {
    const parser = new Parser(` \n\n`);
    parser.forceStack([1, 2, 3, 4, 5, 6, 7]);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
describe("Parser.parseCommand (arithmetic)", () => {
  it("should handle an addition", () => {
    const parser = new Parser(`\t   `);
    parser.forceStack([1, 2, 3, 4, 5, 6, 7]);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([1, 2, 3, 4, 5, 13]);
  });
  it("should handle a addition", () => {
    const parser = new Parser(`\t  \t`);
    parser.forceStack([1, 2, 3, 4, 5, 6, 7]);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([1, 2, 3, 4, 5, -1]);
  });
  it("should handle a multiplication", () => {
    const parser = new Parser(`\t  \n`);
    parser.forceStack([1, 2, 3, 4, 5, 6, 7]);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([1, 2, 3, 4, 5, 42]);
  });
  it("should handle a division (rounded)", () => {
    const parser = new Parser(`\t \t `);
    parser.forceStack([1, 2, 3, 4, 5, 27, 4]);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it("should throw if zero division", () => {
    const parser = new Parser(`\t \t `);
    parser.forceStack([1, 2, 3, 4, 5, 5, 0]);
    expect(() => parser.parseCommand()).toThrow();
  });
  it("should handle a modulo", () => {
    const parser = new Parser(`\t \t\t`);
    parser.forceStack([1, 2, 3, 4, 5, 27, 4]);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([1, 2, 3, 4, 5, 3]);
  });
  it("should throw if zero division", () => {
    const parser = new Parser(`\t \t\t`);
    parser.forceStack([1, 2, 3, 4, 5, 5, 0]);
    expect(() => parser.parseCommand()).toThrow();
  });
});

describe("Parser.parseCommand (head)", () => {
  it("should handle adding to the heap from the stack", () => {
    const parser = new Parser(`\t\t `);
    parser.forceStack([1, 2]);
    parser.parseCommand();
    expect(parser.getHeap()).toEqual({ 1: 2 });
  });
  it("should handle adding to the stack from the heap", () => {
    const parser = new Parser(`\t\t\t`);
    parser.forceStack([1, 2]);
    parser.forceHeap({ 2: 3 });
    parser.parseCommand();
    expect(parser.getStack()).toEqual([1, 3]);
  });
});

describe("Parser.parseCommand (i/o)", () => {
  it("should handle adding a char to the output", () => {
    const parser = new Parser(`\t\n  `);
    parser.forceStack([97]);
    parser.parseCommand();
    expect(parser.getOutput()).toEqual("a");
  });
  it("should handle adding a number to the output", () => {
    const parser = new Parser(`\t\n \t`);
    parser.forceStack([97]);
    parser.parseCommand();
    expect(parser.getOutput()).toEqual("97");
  });
  it("should handle adding a value to the stack from the input", () => {
    const parser = new Parser(`\t\n\t `, "a");
    parser.forceStack([97]);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([]);
    expect(parser.getHeap()).toEqual({ 97: 97 });
  });
  it("should handle adding a number to the stack from the input", () => {
    const parser = new Parser(`\t\n\t\t`, "10\n");
    parser.forceStack([97]);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([]);
    expect(parser.getHeap()).toEqual({ 97: 10 });
  });
  it("should handle adding a number (hexa) to the stack from the input", () => {
    const parser = new Parser(`\t\n\t\t`, "0x10\n");
    parser.forceStack([97]);
    parser.parseCommand();
    expect(parser.getStack()).toEqual([]);
    expect(parser.getHeap()).toEqual({ 97: 16 });
  });
});

describe("Parser.parseCommand (flow control)", () => {
  it("should handle creating a label", () => {
    const parser = new Parser(`\n  \t\t\n`);
    parser.parseCommand();
    expect(parser.labels).toEqual({ "\t\t": 6 });
  });
  it("should handle going to a subroutine", () => {
    const parser = new Parser(`\n \t\t\t\n`);
    parser.labels = { "\t\t": 130 };

    parser.parseCommand();
    expect(parser.position).toBe(130);
    expect(parser.calls).toEqual([6]);
  });
  it("should handle going to a label", () => {
    const parser = new Parser(`\n \n\t\t\n`);
    parser.labels = { "\t\t": 130 };

    parser.parseCommand();
    expect(parser.position).toBe(130);
    expect(parser.calls).toEqual([]);
  });
  it("should handle going to a label if zero", () => {
    let parser = new Parser(`\n\t \t\t\n`);
    parser.stack = [4];
    parser.labels = { "\t\t": 130 };

    parser.parseCommand();
    expect(parser.position).toBe(6);
    expect(parser.calls).toEqual([]);
    expect(parser.stack).toEqual([]);

    parser = new Parser(`\n\t \t\t\n`);
    parser.stack = [0];
    parser.labels = { "\t\t": 130 };

    parser.parseCommand();
    expect(parser.position).toBe(130);
    expect(parser.calls).toEqual([]);
    expect(parser.stack).toEqual([]);
  });
  it("should handle going to a label if less than zero", () => {
    let parser = new Parser(`\n\t\t\t\t\n`);
    parser.stack = [4];
    parser.labels = { "\t\t": 130 };

    parser.parseCommand();
    expect(parser.position).toBe(6);
    expect(parser.calls).toEqual([]);
    expect(parser.stack).toEqual([]);

    parser = new Parser(`\n\t\t\t\t\n`);
    parser.stack = [-3];
    parser.labels = { "\t\t": 130 };

    parser.parseCommand();
    expect(parser.position).toBe(130);
    expect(parser.calls).toEqual([]);
    expect(parser.stack).toEqual([]);
  });
  it("should handle leaving a subroutine", () => {
    let parser = new Parser(`\n\t\n`);
    parser.calls = [1000];

    parser.parseCommand();
    expect(parser.position).toBe(1000);
    expect(parser.calls).toEqual([]);
    expect(parser.stack).toEqual([]);
  });
  it("should handle leaving the program", () => {
    let parser = new Parser(`\n\n\n`);
    parser.calls = [1000];

    parser.parseCommand();
    expect(parser.exit).toBe(true);
  });
});

describe.only("whitespace", () => {
  it("should correctly outpu", () => {
    var outputA = "   \t     \t\n\t\n  \n\n\n";

    expect(Parser.whitespace(outputA)).toBe("A");
  });
  it("should work", () => {
    var pushTwice = "   \t\t\n   \t\t\n\t\n \t\t\n \t\n\n\n";
    var duplicate = "   \t\t\n \n \t\n \t\t\n \t\n\n\n";
    var duplicateN1 = "   \t\n   \t \n   \t\t\n \t  \t \n\t\n \t\n\n\n";
    var duplicateN2 = "   \t\n   \t \n   \t\t\n \t  \t\n\t\n \t\n\n\n";
    var duplicateN3 = "   \t\n   \t \n   \t\t\n \t   \n\t\n \t\n\n\n";
    var swap = "   \t\t\n   \t \n \n\t\t\n \t\t\n \t\n\n\n";
    var discard = "   \t\t\n   \t \n \n\t \n\n\t\n \t\n\n\n";
    var slide =
      "   \t\t\n   \t \n   \t\n   \t  \n   \t\t \n   \t \t\n   \t\t\t\n \n\t \t\n \t\t\n\t\n \t\t\n \t\t\n \t\t\n \t\n\n\n";

    expect(Parser.whitespace(pushTwice)).toEqual("33");
    expect(Parser.whitespace(duplicate)).toEqual("33");
    expect(Parser.whitespace(duplicateN1)).toEqual("1");
    expect(Parser.whitespace(duplicateN2)).toEqual("2");
    expect(Parser.whitespace(duplicateN3)).toEqual("3");
    expect(Parser.whitespace(swap)).toEqual("32");
    expect(Parser.whitespace(discard)).toEqual("2");
    expect(Parser.whitespace(slide)).toEqual("5123");
  });
});
