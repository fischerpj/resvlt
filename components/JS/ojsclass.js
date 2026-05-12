// input-group.js
// Class-based Bootstrap input-group with dual reactive channels:
// - current: real-time text
// - value: accumulated array on button click

// input-group.js
// Reactive Bootstrap input-group with:
// - real-time text (group.current)
// - accumulated array (group.value)

export function InputGroup({
  placeholder = "Type…",
  button = "Add",
  buttonClass = "btn btn-primary"
} = {}) {

  // --- DOM elements ---
  const input = document.createElement("input");
  input.type = "text";
  input.className = "form-control";
  input.placeholder = placeholder;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = buttonClass;
  btn.textContent = button;

  const group = document.createElement("div");
  group.className = "input-group";
  group.append(input, btn);

  // --- Reactive channels ---
  group.current = "";   // real-time text
  group.value = [];     // accumulated array

  // --- Real-time updates ---
  input.addEventListener("input", () => {
    group.current = input.value;
    group.dispatchEvent(new CustomEvent("input"));   // OJS reactive
  });

  // --- Accumulation on button click ---
  btn.addEventListener("click", () => {
    const text = input.value.trim();
    if (text !== "") {
      group.value = [...group.value, text];
      group.dispatchEvent(new CustomEvent("change")); // OJS reactive
    }
  });

  // --- Remove Quarto auto-styling ---
  queueMicrotask(() => {
    btn.classList.remove("btn-quarto");
  });

  return group;
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

////



////

export class InputGroupControl2 {
  constructor({
    placeholder = "Type…",
    button = "Add",
    buttonClass = "btn btn-primary"
  } = {}) {

    // --- State ---
    this.current = "";   // real-time text
    this.value = [];     // accumulated array

    // --- DOM elements ---
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.className = "form-control";
    this.input.placeholder = placeholder;

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.className = buttonClass;
    this.button.textContent = button;

    this.el = document.createElement("div");
    this.el.className = "input-group";
    this.el.append(this.input, this.button);

    // --- Bind events ---
    this.#bindEvents();

    // --- Remove Quarto auto-styling ---
    queueMicrotask(() => {
      this.button.classList.remove("btn-quarto");
    });
  }

  // --- Private method: event wiring ---
  #bindEvents() {
    // Real-time updates
    this.input.addEventListener("input", () => {
      this.current = this.input.value;
      this.el.dispatchEvent(new CustomEvent("input"));
    });

    // Accumulation on click
    this.button.addEventListener("click", () => {
      const text = this.input.value.trim();
      if (text !== "") {
        this.value = [...this.value, text];
        this.el.dispatchEvent(new CustomEvent("change"));
      }
    });
  }

  // --- Required by OJS: the DOM node is the control ---
  get node() {
    return this.el;
  }
}

