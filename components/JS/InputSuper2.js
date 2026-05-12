// ===============================
// TextInput (safe, standalone)
// ===============================
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
    this.el.type = type;
    this.el.placeholder = placeholder;
    this.el.autocomplete = autocomplete;
    this.el.required = required;
    this.el.disabled = disabled;
    if (name) this.el.name = name;

    this._value = value;
    this.el.value = value;

    // DOM value binding
    Object.defineProperty(this.el, "value", {
      get: () => this._value,
      set: v => {
        this._value = v;
        this.el.value = v;
        this._dispatch();
      }
    });

    // Child → root dispatch only
    this.el.addEventListener("input", () => {
      this._value = this.el.value;
      this._dispatch();
    });
  }

  _dispatch() {
    this.el.dispatchEvent(new Event("input", { bubbles: false }));
  }
}



// ===============================
// ButtonInput (safe, standalone)
// ===============================
export class ButtonInput {
  constructor(options = {}) {
    const {
      label = "Submit",
      value = label,
      disabled = false,
      name = null
    } = options;

    this.el = document.createElement("button");
    this.el.type = "button";
    this.el.textContent = label;
    this.el.disabled = disabled;
    if (name) this.el.name = name;

    this._value = value;

    // DOM value binding
    Object.defineProperty(this.el, "value", {
      get: () => this._value,
      set: v => {
        this._value = v;
        this._dispatch();
      }
    });

    this.el.addEventListener("click", () => {
      this._value = value;
      this._dispatch();
    });
  }

  _dispatch() {
    this.el.dispatchEvent(new Event("input", { bubbles: false }));
  }
}



// ===============================
// InputWithButton (safe composite)
// ===============================
export class InputWithButton {
  constructor(textOptions = {}, buttonOptions = {}) {
    this.el = document.createElement("div");
    this.el.style.display = "inline-flex";
    this.el.style.gap = "0.5rem";

    this.input = new TextInput(textOptions);
    this.button = new ButtonInput(buttonOptions);

    this.el.appendChild(this.input.el);
    this.el.appendChild(this.button.el);

    this._value = this.input.el.value;

    // DOM value binding — NO dispatch here
    Object.defineProperty(this.el, "value", {
      get: () => this._value,
      set: v => {
        this._value = v;
        this.input.el.value = v; // safe: child dispatches once
      }
    });

    // Child → root dispatch only
    this.input.el.addEventListener("input", () => {
      this._value = this.input.el.value;
      this._dispatch();
    });

    this.button.el.addEventListener("input", () => {
      this._value = this.input.el.value;
      this._dispatch();
    });
  }

  _dispatch() {
    // Root dispatches ONCE, never listens to itself
    this.el.dispatchEvent(new Event("input", { bubbles: true }));
  }
}



// ===============================
//



// ===============================
// Factory functions (Observable-style)
// ===============================
export function text(options = {}) {
  return new TextInput(options).el;
}

export function button(options = {}) {
  return new ButtonInput(options).el;
}

export function inputWithButton(textOptions = {}, buttonOptions = {}) {
  return new InputWithButton(textOptions, buttonOptions).el;
}


// ===============================
// Optional Bootstrap helpers
// ===============================
export function bsText(options = {}) {
  const el = text(options);
  el.classList.add("form-control");
  return el;
}

export function bsButton(options = {}) {
  const el = button(options);
  el.classList.add("btn", "btn-primary");
  return el;
}