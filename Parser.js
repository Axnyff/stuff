class Parser {
  constructor(program, input) {
    this.program = program.replace(/\S/g, "");
    this.position = 0;
    this.stack = [];
    this.heap = {};
    this.output = "";
    this.input = input;
    this.labels = {};
    this.calls = [];
  }

  forceStack(stack) {
    this.stack = stack;
  }


  forceHeap(heap) {
    this.heap = heap;
  }

  getOutput() {
    return this.output;
  }

  getStack() {
    return this.stack;
  }

  getHeap() {
    return this.heap;
  }

  peek() {
    return this.program[this.position];
  }

  peekNext() {
    return this.program[this.position + 1];
  }

  consume() {
    return this.program[this.position++];
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
    this.consume();
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
      this.consume();
      this.stack.push(this.parseNumber());
      return;
    }
    if (this.peek() === "\t" && this.peekNext() === " ") {
      this.consume();
      this.consume();
      let nth = this.parseNumber();
      this.stack.push(this.stack[this.stack.length - 1 - nth]);
      return;
    }
    if (this.peek() === "\t" && this.peekNext() === "\n") {
      this.consume();
      this.consume();
      let count = this.parseNumber();
      if (count < 0 || count >= this.stack.length) {
        this.stack = [this.stack[this.stack.length - 1]];
      }
      const last = this.stack.pop();
      for (let i = 0; i < count; i++) {
        this.stack.pop();
      }
      this.stack.push(last);
      return;
    }
    if (this.peek() === "\n" && this.peekNext() === " ") {
      this.consume();
      this.consume();
      this.stack.push(this.stack[this.stack.length - 1]);
      return;
    }
    if (this.peek() === "\n" && this.peekNext() === "\t") {
      this.consume();
      this.consume();
      const top = this.stack.pop();
      const buttop = this.stack.pop();
      if (buttop === undefined) {
        throw new Error();
      }
      this.stack.push(top);
      this.stack.push(buttop);
      return;
    }
    if (this.peek() === "\n" && this.peekNext() === "\n") {
      this.consume();
      this.consume();
      const popped = this.stack.pop();
      if (popped === undefined) {
        throw new Error();
      }
      return;
    }
  }

  parseArithmeticCommand() {
    this.consume();
    this.consume();
    if (this.peek() === " " && this.peekNext() === " ") {
      this.consume();
      this.consume();
      const a = this.stack.pop();
      const b = this.stack.pop();
      this.stack.push(a + b);
      return;
    }
    if (this.peek() === " " && this.peekNext() === "\t") {
      this.consume();
      this.consume();
      const a = this.stack.pop();
      const b = this.stack.pop();
      this.stack.push(b-a);
      return;
    }
    if (this.peek() === " " && this.peekNext() === "\n") {
      this.consume();
      this.consume();
      const a = this.stack.pop();
      const b = this.stack.pop();
      this.stack.push(b*a);
      return;
    }
    if (this.peek() === "\t" && this.peekNext() === " ") {
      this.consume();
      this.consume();
      const a = this.stack.pop();
      const b = this.stack.pop();
      if (a === 0) {
        throw new Error("Division par zero")
      }
      this.stack.push(Math.floor(b/a));
      return;
    }
    if (this.peek() === "\t" && this.peekNext() === "\t") {
      this.consume();
      this.consume();
      const a = this.stack.pop();
      const b = this.stack.pop();
      if (a === 0) {
        throw new Error("Modulo par zero")
      }
      this.stack.push(Math.floor(b%a));
      return;
    }
  }

  parseHeapCommand() {
    this.consume();
    this.consume();
    if (this.peek() === " ") {
      this.consume();
      const a = this.stack.pop();
      const b = this.stack.pop();

      this.heap[b] = a;
      return;
    }
    if (this.peek() === "\t") {
      this.consume();
      const a = this.stack.pop();
      this.stack.push(this.heap[a]);
      return;
    }
  }

  parseIOCommand() {
    this.consume();
    this.consume();

    if (this.peek() === " " && this.peekNext() === " ") {
      this.consume();
      this.consume();

      this.output += String.fromCharCode(this.stack.pop());
      return;
    }
    if (this.peek() === " " && this.peekNext() === "\t") {
      this.consume();
      this.consume();

      this.output += this.stack.pop();
      return;
    }
    if (this.peek() === "\t" && this.peekNext() === " ") {
      this.consume();
      this.consume();

      const a = this.input.charCodeAt(0);
      this.input = this.input.slice(1);
      const b = this.stack.pop();
      this.heap[b] = a;
      return;
    }
    if (this.peek() === "\t" && this.peekNext() === "\t") {
      this.consume();
      this.consume();

      let i = 0;
      while (this.input[i] !== "\n") {
        i++;
        if (!this.input[i]) {
          throw new Error("Can't read number");
        }
      }
      const b = this.stack.pop();
      if (this.input.startsWith("0x")) {
        const a = parseInt(this.input.slice(2), 16);
        this.heap[b] = a;
      } else {
        const a = parseInt(this.input, 10);
        this.heap[b] = a;
      }
      this.input = this.input.slice(i);
      return;
    }
  }

  parseFlow() {
    this.consume();
    if (this.peek() === " " && this.peekNext() === " ") {
      this.consume();
      this.consume();
      const label = this.parseLabel();
      this.labels[label] = this.position;
      return;
    }
    if (this.peek() === " " && this.peekNext() === "\t") {
      this.consume();
      this.consume();
      const label = this.parseLabel();
      this.calls.push(this.position);
      this.position = this.labels[label];
      return;
    }
    if (this.peek() === " " && this.peekNext() === "\n") {
      this.consume();
      this.consume();
      const label = this.parseLabel();
      this.position = this.labels[label];
      return;
    }
    if (this.peek() === "\t" && this.peekNext() === " ") {
      this.consume();
      this.consume();
      const label = this.parseLabel();
      if (this.stack.pop() === 0) {
        this.position = this.labels[label];
      }
      return;
    }
    if (this.peek() === "\t" && this.peekNext() === "\t") {
      this.consume();
      this.consume();
      const label = this.parseLabel();
      if (this.stack.pop() < 0) {
        this.position = this.labels[label];
      }
      return;
    }
    if (this.peek() === "\t" && this.peekNext() === "\n") {
      this.consume();
      this.consume();
      this.position = this.calls.pop();
      return;
    }
    if (this.peek() === "\n" && this.peekNext() === "\n") {
      this.consume();
      this.consume();
      this.exit = true;
      return;
    }
  }


  parseCommand() {
    if (this.peek() === " ") {
      return this.parseStackCommand();
    }
    if (this.peek() === "\t" && this.peekNext() === " ") {
      return this.parseArithmeticCommand();
    }
    if (this.peek() === "\t" && this.peekNext() === "\t") {
      return this.parseHeapCommand();
    }
    if (this.peek() === "\t" && this.peekNext() === "\n") {
      return this.parseIOCommand();
    }
    if (this.peek() === "\n") {
      return this.parseFlow();
    }
  }

  parseProgram() {
    while (!this.exit && this.peek()) {
      this.parseCommand();
    }
    if (!this.peek() && !this.exit) {
      throw new Error("oo");
    }
    return this.output;
  }
}

const whitespace = (code, input) => {
  const true_code = code.replace(/\S/g, "");
  return new Parser(true_code, input).parseProgram();
};

module.exports = Parser;
module.exports.whitespace = whitespace;
