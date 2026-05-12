// bsui.js provides ojs bootstrap compatible elements

// bsButton: Bootstrap-styled button, OJS-compatible
export class bsButton {
  constructor(options = {}) {
    this.options = {
      label: "Click",
      variant: "primary",   // Bootstrap variant: primary, secondary, danger, etc.
      size: undefined,      // "sm" | "lg"
      value: null,          // payload emitted on click
      disabled: false,
      ...options
    };

    // Root is the actual <button> element (OJS likes this)
    this.root = document.createElement("button");
    this.root.type = "button";
    this.root.className = `btn btn-${this.options.variant}`;

    if (this.options.size === "sm") this.root.classList.add("btn-sm");
    if (this.options.size === "lg") this.root.classList.add("btn-lg");

    this.root.textContent = this.options.label;
    this.root.disabled = this.options.disabled;

    // OJS requirement: dispatch "input" when clicked
    this.root.addEventListener("click", () => {
      this._emit();
    });

    // OJS requirement: expose .value
    Object.defineProperty(this.root, "value", {
      get: () => this.options.value
    });
  }

  /**
   * Emit an OJS "input" event with the configured value.
   */
  _emit() {
    // Update internal value (timestamp default if null)
    this.options.value = this.options.value ?? { clickedAt: Date.now() };

    // Trigger OJS reactivity
    this.root.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /**
   * Return the DOM node (OJS expects this)
   */
  node() {
    return this.root;
  }
}


// bsInput: Bootstrap-styled text input, OJS-compatible
export class bsInput {
  constructor(options = {}) {
    this.options = {
      label: "",
      value: "",
      placeholder: "",
      description: "",
      type: "text",
      disabled: false,
      required: false,
      size: undefined,
      ...options
    };

    this.root = document.createElement("div");
    this.root.className = "mb-3";

    // Label
    if (this.options.label) {
      const label = document.createElement("label");
      label.className = "form-label";
      label.textContent = this.options.label;
      this.root.appendChild(label);
    }

    // Input
    this.input = document.createElement("input");
    this.input.type = this.options.type;
    this.input.className = "form-control";
    if (this.options.size === "sm") this.input.classList.add("form-control-sm");
    if (this.options.size === "lg") this.input.classList.add("form-control-lg");

    this.input.placeholder = this.options.placeholder;
    this.input.value = this.options.value;
    this.input.disabled = this.options.disabled;
    this.input.required = this.options.required;

    this.root.appendChild(this.input);

    // Help text
    if (this.options.description) {
      const help = document.createElement("div");
      help.className = "form-text";
      help.textContent = this.options.description;
      this.root.appendChild(help);
    }

    // OJS requirement: dispatch "input" on change
    this.input.addEventListener("input", () => {
      this.root.dispatchEvent(new Event("input"));
    });

    // OJS requirement: expose .value
    Object.defineProperty(this.root, "value", {
      get: () => this.input.value
    });
  }

  /**
   * Return the DOM node (OJS expects this)
   */
  node() {
    return this.root;
  }
}


// bsInputgroup: Bootstrap input-group with input + button, OJS-compatible
export class bsInputgroup {
  constructor(options = {}) {
    this.options = {
      placeholder: "",
      buttonLabel: "Add",
      variant: "primary",
      size: undefined, // "sm" | "lg"
      ...options
    };

    // Internal state
    this._current = "";
    this._accum = [];

    // Root node (OJS observes this)
    this.root = document.createElement("div");
    this.root.className = "input-group";

    // ---- Input ----
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.className = "form-control";
    this.input.placeholder = this.options.placeholder;

    if (this.options.size === "sm") this.input.classList.add("form-control-sm");
    if (this.options.size === "lg") this.input.classList.add("form-control-lg");

    // Real-time channel
    this.input.addEventListener("input", () => {
      this._current = this.input.value;
      this._emit();
    });

    // ---- Button ----
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.className = `btn btn-${this.options.variant}`;
    this.button.textContent = this.options.buttonLabel;

    if (this.options.size === "sm") this.button.classList.add("btn-sm");
    if (this.options.size === "lg") this.button.classList.add("btn-lg");

    // Accumulation channel
    this.button.addEventListener("click", () => {
      if (this.input.value.trim() !== "") {
        this._accum.push(this.input.value);
      }
      this._emit();
    });

    // Assemble
    this.root.appendChild(this.input);
    this.root.appendChild(this.button);

    // OJS: expose .value
    Object.defineProperty(this.root, "value", {
      get: () => ({
        current: this._current,
        accum: this._accum.slice() // defensive copy
      })
    });
    
  }

  // OJS reactivity trigger
  _emit() {
    this.root.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // OJS expects a node() method
  node() {
    return this.root;
  }
}


// bsInputgroup: Bootstrap input-group with input + button, OJS-compatible
export class bsInputgroup2 {
  constructor(options = {}) {
    this.options = {
      placeholder: "",
      buttonLabel: "Add",
      variant: "primary",
      size: undefined, // "sm" | "lg"
      ...options
    };

    // Internal state
    this._current = "";
    this._accum = [];

    // Root node (OJS observes this)
    this.root = document.createElement("div");
    this.root.className = "input-group";

    // ---- Input ----
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.className = "form-control";
    this.input.placeholder = this.options.placeholder;

    if (this.options.size === "sm") this.input.classList.add("form-control-sm");
    if (this.options.size === "lg") this.input.classList.add("form-control-lg");

    // Real-time channel
    this.input.addEventListener("input", () => {
      this._current = this.input.value;
      this._emit();
    });

    // ---- Button ----
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.className = `btn btn-${this.options.variant}`;
    this.button.textContent = this.options.buttonLabel;

    if (this.options.size === "sm") this.button.classList.add("btn-sm");
    if (this.options.size === "lg") this.button.classList.add("btn-lg");

    // Accumulation channel
    this.button.addEventListener("click", () => {
      if (this.input.value.trim() !== "") {
        this._accum.push(this.input.value);
      }
      this._emit();
    });

    // ---- Assemble input-group ----
    this.root.appendChild(this.input);
    this.root.appendChild(this.button);

    // ---- Quarto rewrite defense: microtask + one-shot observer ----
    queueMicrotask(() => {
      this.button.classList.remove("btn-quarto");
    });

    new MutationObserver((mutations, obs) => {
      if (this.button.classList.contains("btn-quarto")) {
        this.button.classList.remove("btn-quarto");
        obs.disconnect();
      }
    }).observe(this.button, { attributes: true });

    // ---- OJS .value definition ----
    Object.defineProperty(this.root, "value", {
      get: () => ({
        current: this._current,
        accum: this._accum.slice()
      })
    });
  }

  // OJS reactivity trigger
  _emit() {
    this.root.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // OJS expects a node() method
  node() {
    return this.root;
  }
}


// bsInputgroup: Bootstrap input-group with prefixHTML + input + 3 buttons, OJS-compatible
export class bsInputgroup3 {
  constructor(options = {}) {
    this.options = {
      placeholder: "",
      prefixHTML: null,      // <i class="bi bi-search"></i> or "€" etc.
      addLabel: "Add",
      resetLabel: "Reset",
      clipLabel: "Clip",
      variant: "primary",
      size: undefined,       // "sm" | "lg"
      ...options
    };

    // Internal state
    this._current = "";
    this._accum = [];

    // Root node (OJS observes this)
    this.root = document.createElement("div");
    this.root.className = "input-group";

    // ---- Prefix HTML (optional) ----
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

    // Real-time channel
    this.input.addEventListener("input", () => {
      this._current = this.input.value;
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
      if (this.input.value.trim() !== "") {
        this._accum.push(this.input.value);
      }
      this._emit();
    });

    this.root.appendChild(this.btnAdd);

    // ---- Reset button ----
    this.btnReset = document.createElement("button");
    this.btnReset.type = "button";
    this.btnReset.className = `btn btn-danger`;
    this.btnReset.textContent = this.options.resetLabel;

    if (this.options.size === "sm") this.btnReset.classList.add("btn-sm");
    if (this.options.size === "lg") this.btnReset.classList.add("btn-lg");

    this.btnReset.addEventListener("click", () => {
      this._current = "";
      this._accum = [];
      this.input.value = "";
      this._emit();
    });

    this.root.appendChild(this.btnReset);

    // ---- Clip button ----
    this.btnClip = document.createElement("button");
    this.btnClip.type = "button";
    this.btnClip.className = `btn btn-success`;
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

    this.root.appendChild(this.btnClip);

    // ---- Quarto rewrite defense: microtask + one-shot observer ----
    const allButtons = [this.btnAdd, this.btnReset, this.btnClip];

    queueMicrotask(() => {
      for (const b of allButtons) b.classList.remove("btn-quarto");
    });

    for (const b of allButtons) {
      new MutationObserver((mut, obs) => {
        if (b.classList.contains("btn-quarto")) {
          b.classList.remove("btn-quarto");
          obs.disconnect();
        }
      }).observe(b, { attributes: true });
    }

    // ---- OJS .value definition ----
    Object.defineProperty(this.root, "value", {
      get: () => ({
        current: this._current,
        accum: this._accum.slice()
      })
    });
  }

  // OJS reactivity trigger
  _emit() {
    this.root.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // OJS expects a node() method
  node() {
    return this.root;
  }
}

// bsInputgroup: Bootstrap input-group with prefixHTML + input + 3 buttons + transform(), OJS-compatible
export class bsInputgroupTransform {
  constructor(options = {}) {
    this.options = {
      placeholder: "",
      prefixHTML: null,
      addLabel: "Add",
      resetLabel: "Reset",
      clipLabel: "Clip",
      variant: "primary",
      size: undefined,       // "sm" | "lg"
      transform: x => x.toUpperCase(),     // <---- NEW: transform function
      ...options
    };

    // Internal state
    this._current = "";
    this._accum = [];

    // Root node (OJS observes this)
    this.root = document.createElement("div");
    this.root.id = "mine";
    this.root.className = "input-group";

    // ---- Prefix HTML (optional) ----
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

    // Real-time channel with transform()
    this.input.addEventListener("input", () => {
      const raw = this.input.value;
      this._current = this.options.transform(raw);   // <---- transform applied here
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
      if (this.input.value.trim() !== "") {
        this._accum.push(this.options.transform(this.input.value)); // transformed push
      }
      this._emit();
    });

    this.root.appendChild(this.btnAdd);

    // ---- Reset button ----
    this.btnReset = document.createElement("button");
    this.btnReset.type = "button";
    this.btnReset.className = `btn btn-danger`;
    this.btnReset.textContent = this.options.resetLabel;

    if (this.options.size === "sm") this.btnReset.classList.add("btn-sm");
    if (this.options.size === "lg") this.btnReset.classList.add("btn-lg");

    this.btnReset.addEventListener("click", () => {
      this._current = "";
      this._accum = [];
      this.input.value = "";
      this._emit();
    });

    this.root.appendChild(this.btnReset);

    // ---- Clip button ----
    this.btnClip = document.createElement("button");
    this.btnClip.type = "button";
    this.btnClip.className = `btn btn-success`;
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

    this.root.appendChild(this.btnClip);
    
    document.addEventListener("ojs-loaded", () => {
      const container = document.querySelector("div.input-group");
      console.log("AFTER hydration:", container);
    });

    // ---- Quarto rewrite defense ----
    const allButtons = [this.btnAdd, this.btnReset, this.btnClip];

    queueMicrotask(() => {
      for (const b of allButtons) b.classList.remove("btn-quarto");
    });

    for (const b of allButtons) {
      new MutationObserver((mut, obs) => {
        if (b.classList.contains("btn-quarto")) {
          b.classList.remove("btn-quarto");
          obs.disconnect();
        }
      }).observe(b, { attributes: true });
    }

    // ---- OJS .value definition ----
    Object.defineProperty(this.root, "value", {
      get: () => ({
        current: this._current,
        accum: this._accum.slice()
      })
    });
  }

  // OJS reactivity trigger
  _emit() {
    this.root.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // OJS expects a node() method
  node() {
    return this.root;
  }
}

//===============================================================
export class bsInputgroupFetch_legacy {
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

      // Auto-fetch content if fetcher exists and cleaned is valid
      if (this.options.fetcher && cleaned) {
        this._content = await this.options.fetcher(cleaned);
      } else {
        this._content = null;
      }

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

    this.root.appendChild(this.btnAdd);

    // ---- Reset button ----
    this.btnReset = document.createElement("button");
    this.btnReset.type = "button";
    this.btnReset.className = `btn btn-outline-secondary`;
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

    this.root.appendChild(this.btnClip);

    // ---- Quarto rewrite defense ----
    const allButtons = [this.btnAdd, this.btnReset, this.btnClip];

    queueMicrotask(() => {
      for (const b of allButtons) b.classList.remove("btn-quarto");
    });

    for (const b of allButtons) {
      new MutationObserver((mut, obs) => {
        if (b.classList.contains("btn-quarto")) {
          b.classList.remove("btn-quarto");
          obs.disconnect();
        }
      }).observe(b, { attributes: true });
    }

    // ---- OJS .value ----
    Object.defineProperty(this.root, "value", {
      get: () => ({
        current: this._current,
        accum: this._accum.slice(),
        content: this._content     // <---- NEW
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

//=========================================================================
export class bsInputgroupFetch {
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

      // Auto-fetch content if fetcher exists and cleaned is valid
      if (this.options.fetcher && cleaned) {
        this._content = await this.options.fetcher(cleaned);
      } else {
        this._content = null;
      }

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

    this.root.appendChild(this.btnAdd);

    // ---- Reset button ----
    this.btnReset = document.createElement("button");
    this.btnReset.type = "button";
    this.btnReset.className = `btn btn-outline-secondary`;
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

    this.root.appendChild(this.btnClip);

    // ---- Quarto rewrite defense ----
    const allButtons = [this.btnAdd, this.btnReset, this.btnClip];

    queueMicrotask(() => {
      for (const b of allButtons) {
        b.classList.remove("btn-quarto");
        console.log("yeah-too");      }
    });

    // ---- OJS .value ----
    Object.defineProperty(this.root, "value", {
      get: () => ({
        current: this._current,
        accum: this._accum.slice(),
        content: this._content     // <---- NEW
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

//======================================================================
export class bsInputgroupRoot {
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
    this._content = null;

    // ---- QUARTO-SAFE ROOT CONTAINER ----
    // Quarto does NOT rewrite DOM inside this container.
    this.root = document.createElement("div");
    this.root.classList.add("bs-inputgroup-container");

    // Inner wrapper for the actual input group
    this.group = document.createElement("div");
    this.group.className = "input-group";
    this.root.appendChild(this.group);

    // ---- Prefix HTML ----
    if (this.options.prefixHTML) {
      this.prefix = document.createElement("span");
      this.prefix.className = "input-group-text";
      this.prefix.innerHTML = this.options.prefixHTML;
      this.group.appendChild(this.prefix);
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

      // Auto-fetch content if fetcher exists and cleaned is valid
      if (this.options.fetcher && cleaned) {
        this._content = await this.options.fetcher(cleaned);
      } else {
        this._content = null;
      }

      this._emit();
    });

    this.group.appendChild(this.input);

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

    this.group.appendChild(this.btnAdd);

    // ---- Reset button ----
    this.btnReset = document.createElement("button");
    this.btnReset.type = "button";
    this.btnReset.className = `btn btn-outline-secondary`;
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

    this.group.appendChild(this.btnReset);

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

    this.group.appendChild(this.btnClip);
    
    // ---- OJS .value ----
    Object.defineProperty(this.root, "value", {
      get: () => ({
        current: this._current,
        accum: this._accum.slice(),
        content: this._content
      })
    });
    
    // Attempt a temporisation
//    await new Promise(resolve => setTimeout(resolve, 1));
        // ---- Quarto rewrite defense: microtask + one-shot observer ----
   // ---- Quarto rewrite defense ----
//    const allButtons = [this.group.btnAdd, this.group.btnReset, this.group.btnClip];
    const allButtons = this.group.querySelectorAll("button");
    
    queueMicrotask(() => {
      for (const b of allButtons) {
        b.classList.remove("btn-quarto");
        console.log("yeah-too");      }
    });

    const obs = new MutationObserver(() => {
      this.group.querySelectorAll("button").forEach(btn => {
        btn.classList.remove("btn-quarto");
        });
    });
    obs.observe(this.group, { childList: true, subtree: true });
  }

  _emit() {
    this.root.dispatchEvent(new Event("input", { bubbles: true }));
  }

  node() {
    return this.root;
  }
}

