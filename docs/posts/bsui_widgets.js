// bsui_widgets.js inspired by bsui_debounce.js
// and EchoInput

//=========================================================================

// as in bsui_debounce
// bsInputBar is Input + Button(s)
export class bsInputBar {
  constructor(options = {}) {
    this.options = {
      placeholder: "",
      prefixHTML: null,
      addLabel: "Add",
      resetLabel: "Reset",
      clipLabel: "Clip",
      variant: "primary",
      size: undefined,
      transform: x => x,     // must return cleaned OSIS or null
      fetcher: null,         // async (cleanedOsis) => passage_html
      ...options
    };

    // Internal state
    this._current = "";
    this._accum = [];
    this._content = null;     // <---- NEW: fetched passage_html

    // Root node
    this.root = document.createElement("div");
    this.root.className = "input-group";

    // ---- Prefix HTML ----
    if (this.options.prefixHTML) {
      this.prefix = document.createElement("span");
      this.prefix.className = "input-group-text";
      this.prefix.innerHTML = this.options.prefixHTML;
      this.root.appendChild(this.prefix);
    }

    // ---- Input ----
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.className = "form-control";
    this.input.placeholder = this.options.placeholder;

    if (this.options.size === "sm") this.input.classList.add("form-control-sm");
    if (this.options.size === "lg") this.input.classList.add("form-control-lg");

    this.input.addEventListener("input", async () => {
      const raw = this.input.value;
      const cleaned = this.options.transform(raw);   // OSIS or null
      this._current = cleaned;

//      this._content = 'toto';
//      this._content = await this.options.fetcher();   // OSIS or null do the fetch
  
 //     console.log(cleaned);
      // Auto-fetch content if fetcher exists and cleaned is valid
      this._content = await this.options.fetcher();

//      if (this.options.fetcher && cleaned.url_fetchable) {
//        this._content = await this.options.fetcher().content;
//      } else {
//        this._content = null;
//      }
      
      this._emit();
    });

    this.root.appendChild(this.input);

    // ---- Add button ----
    this.btnAdd = document.createElement("button");
    this.btnAdd.type = "button";
    this.btnAdd.className = `btn btn-${this.options.variant}`;
    this.btnAdd.textContent = this.options.addLabel;

    if (this.options.size === "sm") this.btnAdd.classList.add("btn-sm");
    if (this.options.size === "lg") this.btnAdd.classList.add("btn-lg");

    this.btnAdd.addEventListener("click", () => {
      if (this._current) {
        this._accum.push(this._current);
      }
      this._emit();
    });

//    this.root.appendChild(this.btnAdd);

    // ---- Reset button ----
    this.btnReset = document.createElement("button");
    this.btnReset.type = "button";
    this.btnReset.className = `btn btn-primary`;
    this.btnReset.textContent = this.options.resetLabel;

    if (this.options.size === "sm") this.btnReset.classList.add("btn-sm");
    if (this.options.size === "lg") this.btnReset.classList.add("btn-lg");

    this.btnReset.addEventListener("click", () => {
      this._current = "";
      this._accum = [];
      this._content = null;
      this.input.value = "";
      this._emit();
    });

    this.root.appendChild(this.btnReset);

    // ---- Clip button ----
    this.btnClip = document.createElement("button");
    this.btnClip.type = "button";
    this.btnClip.className = `btn btn-outline-secondary`;
    this.btnClip.textContent = this.options.clipLabel;

    if (this.options.size === "sm") this.btnClip.classList.add("btn-sm");
    if (this.options.size === "lg") this.btnClip.classList.add("btn-lg");

    this.btnClip.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(this._accum));
      } catch (err) {
        console.error("Clipboard error:", err);
      }
    });

//    this.root.appendChild(this.btnClip);

    // ---- Quarto rewrite defense ----
    const allButtons = [this.btnAdd, this.btnReset, this.btnClip];

    queueMicrotask(() => {
      for (const b of allButtons) {
        b.classList.remove("btn-quarto");
       // console.log("yeah-too");     
       }
    });

    // ---- OJS .value ----
    Object.defineProperty(this.root, "value", {
      get: () => ({
        current: this._current,
//        accum: this._accum.slice(),
        payload: this._content     // <---- NEW
      })
    });
  }

  _emit() {
    this.root.dispatchEvent(new Event("input", { bubbles: true }));
  }

  node() {
    return this.root;
  }
}

// =========================================================================

//-- ========================================================= -->
//-- ===============  FILE: www/echo-input.js  =============== -->
//-- ========================================================= -->

/*
  echo-input.js
  --------------
  External JavaScript module exporting a Bootstrap‑styled,
  class‑based input component that echoes its value to the console
  and supports an optional callback.

  This file contains:
    - A reusable EchoInput class
    - No Quarto/OJS dependencies
    - No DOM assumptions beyond mount(target)
*/

export class EchoInput {
  constructor({
    placeholder = "Type…",
    label = "Echo input",
    oninput = null
  } = {}) {

    // Root wrapper (Bootstrap-friendly)
    this.root = document.createElement('div');
    this.root.className = 'mb-3';

    // Label
    this.label = document.createElement('label');
    this.label.className = 'form-label';
    this.label.textContent = label;

    // Input
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = placeholder;
    this.input.className = 'form-control';

    // Listener: echo to console + callback
    this.input.addEventListener('input', ev => {
      console.log(ev.target.value);
      if (oninput) oninput(ev.target.value);
    });

    // Assemble
    this.root.appendChild(this.label);
    this.root.appendChild(this.input);
  }

  // Mount into any DOM node
  mount(target) {
    target.appendChild(this.root);
  }

  // Reactive getter for OJS
  get value() {
    return this.input.value;
  }
}

