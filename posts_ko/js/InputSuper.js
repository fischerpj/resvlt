export class BaseComponent {
  constructor() {
    this.el = null;     // must be set by subclass
    this._value = null; // internal state
  }

  dispatch() {
    this.el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  mount(parent) {
    parent.appendChild(this.el);
    return this;
  }

  destroy() {
    this.el.remove();
  }

  setAttributes(attrs = {}) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined) continue;
      this.el[k] = v;
    }
  }

  get value() {
    return this._value;
  }

  set value(v) {
    this._value = v;
    this.dispatch();
  }
}


export class TextInput extends BaseComponent {
  constructor(options = {}) {
    super();

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

    this.setAttributes({
      type,
      placeholder,
      autocomplete,
      required,
      disabled,
      name
    });

    this._value = value;
    this.el.value = value;

    this.el.addEventListener("input", () => {
      this._value = this.el.value;
      this.dispatch();
    });
  }

  set value(v) {
    this._value = v;
    this.el.value = v;
    this.dispatch();
  }
}


export class ButtonInput extends BaseComponent {
  constructor(options = {}) {
    super();

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

    this.setAttributes({ disabled, name });

    this.el.addEventListener("click", () => {
      this._value = value;
      this.dispatch();
    });
  }
}

export function bsText(options = {}) {
  const inst = new TextInput(options);
  inst.el.classList.add("form-control");
  return inst.el;
}

export function bsButton(options = {}) {
  const inst = new ButtonInput(options);
  inst.el.classList.add("btn", "btn-primary");
  return inst.el;
}

export function bsInputGroup(textOptions = {}, buttonOptions = {}) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("input-group");

  const input = new TextInput(textOptions);
  input.el.classList.add("form-control");

  const btn = new ButtonInput(buttonOptions);
  btn.el.classList.add("btn", "btn-outline-secondary");

  wrapper.appendChild(input.el);
  wrapper.appendChild(btn.el);

  return { wrapper, input, btn };
}


export class InputWithButton_legacy extends BaseComponent {
  constructor(textOptions = {}, buttonOptions = {}) {
    super();

    this.el = document.createElement("div");
    this.el.style.display = "inline-flex";
    this.el.style.gap = "0.5rem";

    this.input = new TextInput(textOptions);
    this.button = new ButtonInput(buttonOptions);

    this.el.appendChild(this.input.el);
    this.el.appendChild(this.button.el);

    // Relay events
    this.input.el.addEventListener("input", () => {
      this._value = this.input.value;
      this.dispatch();
    });

    this.button.el.addEventListener("input", () => {
      this._value = this.input.value;
      this.dispatch();
    });

    this._value = this.input.value;
  }

  set value(v) {
    this.input.value = v;
    this._value = v;
    this.dispatch();
  }

  get value() {
    return this.input.value;
  }
}


export function inputWithButton_legacy(textOptions = {}, buttonOptions = {}) {
  return new InputWithButton(textOptions, buttonOptions).el;
}

////
export class InputWithButton extends BaseComponent {
  constructor(textOptions = {}, buttonOptions = {}) {
    super();

    // Root element
    this.el = document.createElement("div");
    this.el.style.display = "inline-flex";
    this.el.style.gap = "0.5rem";

    // Bind DOM .value to component .value
    Object.defineProperty(this.el, "value", {
      get: () => this.value,
      set: v => { this.value = v }
    });

    // Subcomponents
    this.input = new TextInput(textOptions);
    this.button = new ButtonInput(buttonOptions);

    this.el.appendChild(this.input.el);
    this.el.appendChild(this.button.el);

    // IMPORTANT: Only listen to CHILD events, never root events
    this.input.el.addEventListener("input", () => {
      this._value = this.input.value;
      this.dispatch(); // dispatch ONCE
    });

    this.button.el.addEventListener("input", () => {
      this._value = this.input.value;
      this.dispatch(); // dispatch ONCE
    });

    this._value = this.input.value;
  }

  set value(v) {
    this.input.value = v;
    this._value = v;
    this.dispatch();
  }

  get value() {
    return this.input.value;
  }
}

export function inputWithButton(textOptions = {}, buttonOptions = {}) {
  return new InputWithButton(textOptions, buttonOptions).el;
}





