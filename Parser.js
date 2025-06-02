const parseNumber = (input) => {
  const sign = input[0] === "	" ? -1 : 1;

};

class Parser {
  constructor(input) {
    this.input = input.replace(/\S/g, "");
    this.position = 0;
    this.stack = [];
  }

  peek() {
    return this.input[this.position];
  }

  peekNext() {
    return this.input[this.position + 1];
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
    return sign * parseInt(s, 2);
  }

  parseLabel() {
    let s = "";
    while (this.peek() !== "\n") {
      s += this.consume();
    }
    this.consume();
    return s;
  }

  parseStackCommand() {
    this.consume();
    if (this.peek() === " ") {
      console.log("PUSH");
      this.consume();
      this.stack.push(this.parseNumber());
    }
    if (this.peek() === "\t" && this.peekNext() === " ") {
      console.log("DUP");
      this.consume();
      this.consume();
      let nth = this.parseNumber();
      this.stack.push(this.stack.at(-nth));
    }

  }

  parseCommand() {
    if (this.peek() === " ") {
      return this.parseStackCommand();
    }
  }

  parseProgram() {
    this.parseCommand();
  }

  printStack() {
    console.log("STACK:")
    console.log(this.stack.join("\n"));
  }

}

const runWhitespace = (raw_input) => {
  const input = raw_input.replace(/\S/g, "");
};

module.exports = Parser;
