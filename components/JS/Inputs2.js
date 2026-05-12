export class TextInput {
  constructor(options = {}) {
    const {
      placeholder = "",
      value = "",
      type = "text",
      autocomplete = "off",
      required = false,
      disabled = false,
      name = null
    } = options;

    this.el = document.createElement("input");

    // Apply all attributes
    this.el.type = type;
    this.el.placeholder = placeholder;
    this.el.autocomplete = autocomplete;
    this.el.required = required;
    this.el.disabled = disabled;
    if (name) this.el.name = name;

    // Internal state
    this._value = value;
    this.el.value = value;

    // Event binding
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
      value = label,
      disabled = false,
      name = null
    } = options;

    this._value = value;

    this.el = document.createElement("button");
    this.el.type = "button";
    this.el.textContent = label;
    this.el.disabled = disabled;
    if (name) this.el.name = name;

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
  return new TextInput(options).el;
}

export function button(options = {}) {
  return new ButtonInput(options).el;
}



