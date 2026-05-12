export class TextInput {
  constructor(options = {}) {
    const {
      placeholder = "",
      value = "",
      type = "text"
    } = options;

    this.el = document.createElement("input");
    this.el.type = type;
    this.el.placeholder = placeholder;
    this._value = value;
    this.el.value = value;

    // Bind event
    this.el.addEventListener("input", () => {
      this._value = this.el.value;
      this.dispatch();
    });
  }

  dispatch() {
    this.el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  get value() {
    return this._value;
  }

  set value(v) {
    this._value = v;
    this.el.value = v;
    this.dispatch();
  }
}


export class ButtonInput {
  constructor(options = {}) {
    const {
      label = "Submit",
      value = label
    } = options;

    this._value = value;

    this.el = document.createElement("button");
    this.el.type = "button";
    this.el.textContent = label;

    this.el.addEventListener("click", () => {
      this._value = value;
      this.dispatch();
    });
  }

  dispatch() {
    this.el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  get value() {
    return this._value;
  }

  set value(v) {
    this._value = v;
    this.dispatch();
  }
}

export function text(options = {}) {
  const inst = new TextInput(options);
  return inst.el;
}

export function button(options = {}) {
  const inst = new ButtonInput(options);
  return inst.el;
}





