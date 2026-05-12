// ===============================
// TextInput
// ===============================
export class TextInput {
  constructor(options = {}) {
    const {
      placeholder = "tutu",
      value = "toto",
      type = "text",
      autocomplete = "off",
      required = false,
      disabled = false,
      name = null
    } = options;

    this.el = document.createElement("input");
    this.el.type = "text";
    this.el.placeholder = placeholder;
    this.el.autocomplete = autocomplete;
    this.el.required = required;
    this.el.disabled = disabled;
    if (name) this.el.name = name;

    this._value = value;
    this.el.value = value;

    // DOM → internal state (safe, no recursion)
    this.el.addEventListener("input", () => {
      this._value = this.el.value;
      this._dispatch();
    });
  }

  get value() {
    return this._value;
  }

  set value(v) {
    if (v === this._value) return; // avoid redundant dispatch
    this._value = v;
    this.el.value = v;
    this._dispatch();
  }

  _dispatch() {
    this.el.dispatchEvent(new Event("input", { bubbles: true }));
  }
}



// ===============================
// ButtonInput
// ===============================
export class ButtonInput {
  constructor(options = {}) {
    const {
      label = "Button",
      value = "toto",
      disabled = false,
      name = null
    } = options;

    this.el = document.createElement("button");
    this.el.type = "button";
    this.el.textContent = label;
    this.el.disabled = disabled;
    if (name) this.el.name = name;

    // Canonical value (emitted on click)
    this._value = value ?? label;

    // DOM → event (safe, no recursion)
    this.el.addEventListener("click", () => {
      this._dispatch();
    });
  }

  get value() {
    return this._value;
  }

  set value(v) {
    this._value = v;
    // Buttons do not update DOM text automatically
  }

  _dispatch() {
    // Observable/Quarto expect "input" events for viewof
    this.el.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

// ===============================
// InputWithButton helper
// ===============================
export function inputWithButton(inputOptions = {}, buttonOptions = {}) {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.gap = "0.5rem";
  wrapper.classList.add("observablehq");

  const input = new bsTextInput(inputOptions);
  const button = new bsButton(buttonOptions);

  wrapper.append(input.el, button.el);
    console.log(wrapper);

  // Canonical value: always the input's value
  Object.defineProperty(wrapper, "value", {
    get() {
      return input.value;
    },
    set(v) {
      input.value = v;
    }
  });

  // Emit a single "input" event when button is clicked
  button.el.addEventListener("input", () => {
    wrapper.dispatchEvent(new Event("input", { bubbles: true }));
  });


  return wrapper;
}

// ===============================
// Helpers (optional Bootstrap)
// ===============================
export function bsTextInput(options = {}) {
  const input = new TextInput(options);
  input.el.classList.add("form-control");
  return input;
}

export function bsButton(options = {}) {
  const btn = new ButtonInput(options);
  btn.el.classList.add("btn", "btn-primary");
  return btn;
}

export function bsButtonSecondary(options = {}) {
  const btn = new ButtonInput(options);
  btn.el.classList.add("btn", "btn-secondary");
  return btn;
}



export function btnbar(){
  const wrapper = document.createElement("div");
    wrapper.setAttribute("role","toolbar");
    wrapper.setAttribute("aria-label","Toolbar with button groups");
    wrapper.classList.add("btn-toolbar", "ms-1", "m-2");

  const group = document.createElement("div");
    group.classList.add("input-group", "input-group-sm" ,"flex-grow-1" ,"me-1");

  const span = document.createElement("span");
    span.classList.add("input-group-text");
    span.setAttribute("id","btnGroupAddon");
    
  const icon =  document.createElement("i");
    icon.classList.add("bi","bi-search");

  const bsinput = bsTextInput();

  const bsbtn = bsButton();
    bsbtn.el.classList.add("btn", "btn-sm", "btn-primary", "rounded","flew-grow-1");

    span.append(icon);
    group.append(span);
    group.append(bsinput.el);
    group.append(bsbtn.el);
    wrapper.append(group);

    
  
/**  
  <div class="btn-toolbar ms-1 m-2" role="toolbar" aria-label="Toolbar with button groups">
  
  <div class="input-group input-group-sm flex-grow-1 me-1">
    <span class="input-group-text" id="btnGroupAddon">
      <i class="bi bi-search"></i>
    </span>
    <input 
      type="text" 
      class="form-control"
      style="flex-basis:40%; max-width:50%;"
      placeholder="UI.toolbar Search..." 
      aria-label="Input group example" 
      aria-describedby="btnGroupAddon"
      bind:value={inputValue}
    >
    <button type="button" 
            class="btn btn-sm btn-primary rounded flex-grow-1"
            on:click={() => addValue(wrapResult)}> 
            ADD
            </button>
*/
  return wrapper
}