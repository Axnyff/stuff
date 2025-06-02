const parseNumber = (input) => {
  const sign = input[0] === "	" ? -1 : 1;

};

class Parser {
  constructor(input) {
    this.input = input.replace(/\S/g, "");
    this.position = 0;
  }

  peek() {
    return this.input[this.position];
  }

  consume() {
    return this.input[this.position++];
  }

  parseNumber() {
    if (this.peek() === "\n") {
      throw new Error("Invalid number");
    }

    const sign = this.consume() === "\t" ? -1 : 1;
    let s = "";
    while (this.peek() !== "\n") {
      s += this.consume() === " " ? "0" : "1";
    }
    if (!s) {
      return 0;
    }
    return parseInt(s, 2);
  }

  parseProgram() {

  }

}

const runWhitespace = (raw_input) => {
  const input = raw_input.replace(/\S/g, "");
};

module.exports = Parser;
