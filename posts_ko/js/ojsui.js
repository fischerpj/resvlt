// ojsui.js provides ojs compatible elements

export function viewofHello() {
  const btn = document.createElement("button");
  btn.textContent = "Hello_too";

  // The value exposed by `viewof`
  btn.value = "hello";

  // Notify Observable that the value changed
  btn.onclick = () => {
    btn.value = "hello_me";      // could be anything you want to expose
    btn.dispatchEvent(new Event("input", { bubbles: true }));
  };

  return btn;
}

export function ojsButton(label) {
  const btn = document.createElement("button");
  btn.textContent = label;

  // OJS requirement: expose a .value property
  btn.value = null;
  
   // Notify Observable that the value changed
  btn.onclick = () => {
    btn.value = "hello_me";      // could be anything you want to expose
    btn.dispatchEvent(new Event("input", { bubbles: true }));
  };

  return btn;
}

export function bsButton(label, variant = "primary") {
  const btn = document.createElement("button");

  // Bootstrap styling
  btn.className = `btn btn-${variant}`;
  btn.textContent = label;

  // OJS contract: expose a .value property
  btn.value = null;

  // OJS contract: dispatch a bubbling "input" event when value changes
  btn.addEventListener("click", () => {
//    btn.value = JSON.stringify({ clickedAt: Date.now() },null,2);
    btn.value = { clickedAt: Date.now() };
    console.log(btn.value);
    btn.dispatchEvent(new Event("input", { bubbles: true }));
  });
  
  return btn;
}

// 422
// --- Canonical InputGroup with prefixHTML + Add/RAZ/Clip --- //

// Canonical InputGroup with prefixHTML, Add/RAZ/Clip, and transform()
// Fully Quarto/OJS compatible — .value and .current live on the DOM node

export class InputGroup3PrefixTransform {
  constructor({
    placeholder = "Type…",
    prefixHTML = null,
    addLabel = "Add",
    razLabel = "RAZ",
    clipLabel = "Clip",
    toolbarLabel = "Input group toolbar",
    transform = (x) => x   // validation / normalization function
  } = {}) {

    this.transform = transform;

    // --- Toolbar wrapper --- //
    this.toolbar = document.createElement("div");
    this.toolbar.className = "btn-toolbar";
    this.toolbar.setAttribute("role", "toolbar");
    this.toolbar.setAttribute("aria-label", toolbarLabel);

    // --- Input-group container --- //
    this.group = document.createElement("div");
    this.group.className = "input-group";

    // --- Optional prefix HTML --- //
    if (prefixHTML) {
      const span = document.createElement("span");
      span.className = "input-group-text";
      span.innerHTML = prefixHTML;
      this.group.append(span);
    }

    // --- Input --- //
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.className = "form-control";
    this.input.placeholder = placeholder;
    this.group.append(this.input);

    // --- Buttons --- //
    this.btnAdd = document.createElement("button");
    this.btnAdd.className = "btn btn-primary";
    this.btnAdd.textContent = addLabel;

    this.btnRaz = document.createElement("button");
    this.btnRaz.className = "btn btn-secondary";
    this.btnRaz.textContent = razLabel;

    this.btnClip = document.createElement("button");
    this.btnClip.className = "btn btn-outline-secondary";
    this.btnClip.textContent = clipLabel;

    this.group.append(this.btnAdd, this.btnRaz, this.btnClip);
    this.toolbar.append(this.group);

    // --- Internal state --- //
    this.current = "";
    this.value = [];

    // --- Sync helper: attach state to DOM node --- //
    const sync = () => {
      this.toolbar.current = this.current;
      this.toolbar.value = this.value;
    };

    // --- Real-time channel with transform --- //
    this.input.addEventListener("input", () => {
      const raw = this.input.value;

      try {
        this.current = this.transform(raw);
      } catch {
        this.current = null; // invalid input
      }

      sync();
      this.toolbar.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // --- Add button: accumulate --- //
    this.btnAdd.addEventListener("click", () => {
      const raw = this.input.value;

      try {
        this.current = this.transform(raw);
        this.value = [...this.value, this.current];
      } catch {
        // ignore invalid
      }

      sync();
      this.toolbar.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // --- RAZ button: reset --- //
    this.btnRaz.addEventListener("click", () => {
      this.value = [];
      sync();
      this.toolbar.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // --- Clip button: copy to clipboard --- //
    this.btnClip.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(this.value));
      } catch (err) {
        console.error("Clipboard error:", err);
      }
    });

    // --- Remove Quarto's automatic btn-quarto class --- //
    queueMicrotask(() => {
      for (const b of [this.btnAdd, this.btnRaz, this.btnClip]) {
        b.classList.remove("btn-quarto");
      }
    });

    // Initial sync
    sync();
  }

  // Observable expects the DOM node as the control
  get node() {
    return this.toolbar;
  }
}

////
// Canonical InputGroup with prefixHTML, Add/RAZ/Clip, and transform()
// Fully Quarto/OJS compatible — .value and .current live on the DOM node

export class InputGroup3PrefixTransform2 {
  constructor({
    placeholder = "Type…",
    prefixHTML = null,
    addLabel = "Add",
    razLabel = "RAZ",
    clipLabel = "Clip",
    toolbarLabel = "Input group toolbar",
    transform = (x) => x   // validation / normalization function
  } = {}) {

    this.transform = transform;

    // --- Toolbar wrapper --- //
    this.toolbar = document.createElement("div");
    this.toolbar.className = "btn-toolbar";
    this.toolbar.setAttribute("role", "toolbar");
    this.toolbar.setAttribute("aria-label", toolbarLabel);

    // --- Input-group container --- //
    this.group = document.createElement("div");
    this.group.className = "input-group";

    // --- Optional prefix HTML --- //
    if (prefixHTML) {
      const span = document.createElement("span");
      span.className = "input-group-text";
      span.innerHTML = prefixHTML;
      this.group.append(span);
    }

    // --- Input --- //
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.className = "form-control";
    this.input.placeholder = placeholder;
    this.group.append(this.input);

    // --- Buttons --- //
    this.btnAdd = document.createElement("button");
    this.btnAdd.className = "btn btn-primary";
    this.btnAdd.textContent = addLabel;

    this.btnRaz = document.createElement("button");
    this.btnRaz.className = "btn btn-secondary";
    this.btnRaz.textContent = razLabel;

    this.btnClip = document.createElement("button");
    this.btnClip.className = "btn btn-outline-secondary";
    this.btnClip.textContent = clipLabel;

    this.group.append(this.btnAdd, this.btnRaz, this.btnClip);
    this.toolbar.append(this.group);

    // --- Internal state --- //
    this.current = "tutu";
    this.value = [];
    // Initial sync
      this.toolbar.current = this.current;
      this.toolbar.value = this.value;

  // --- Sync helper: attach state to DOM node --- //
    const sync = () => {
      this.toolbar.current = this.current;
      this.toolbar.value = this.value;
      console.log(this.toolbar);
    };
 
 /////
 // from ojsclass
 
   // --- Bind events ---
///    input.addEventListener("input", () => {
///      el.current = input.value;               // mirror to DOM
///      el.dispatchEvent(new CustomEvent("input"));
///    });

////    btn.addEventListener("click", () => {
///      const t = input.value.trim();
///      if (t !== "") {
///        el.value = [...el.value, t];          // mirror to DOM
///        el.dispatchEvent(new CustomEvent("change"));
///      }
///    });
 
 ////
    // --- Real-time channel with transform --- //
    this.input.addEventListener("input", () => {
      this.toolbar.current = this.input.value;
      this.toolbar.dispatchEvent(new CustomEvent("input"));
    });

    // --- Add button: accumulate --- //
    this.btnAdd.addEventListener("click", () => {
      this.toolbar.value = [...this.toolbar.value, this.toolbar.current];
      this.toolbar.dispatchEvent(new CustomEvent("change"));
    });

    // --- RAZ button: reset --- //
    this.btnRaz.addEventListener("click", () => {
      this.value = [];
      sync();
      this.toolbar.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // --- Clip button: copy to clipboard --- //
    this.btnClip.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(this.toolbar.value));
      } catch (err) {
        console.error("Clipboard error:", err);
      }
    });

    // --- Remove Quarto's automatic btn-quarto class --- //
//    queueMicrotask(() => {
//      for (const b of [this.btnAdd, this.btnRaz, this.btnClip]) {
//        b.classList.remove("btn-quarto");
//      }
//    });

  
  }

  // Observable expects the DOM node as the control
  get node() {
    return this.toolbar;
  }
}


// input-group.js
export class InputGroupControl {
  constructor({
    placeholder = "Type…",
    button = "Add",
    buttonClass = "btn btn-primary"
  } = {}) {

    // --- DOM ---
    const input = document.createElement("input");
      input.type = "text";
      input.className = "form-control";
      input.placeholder = placeholder;

    const btn = document.createElement("button");
      btn.type = "button";
      btn.className = buttonClass;
      btn.textContent = button;

    const el = document.createElement("div");
      el.className = "input-group";
      el.append(input, btn);

    // --- Attach DOM to instance ---
    this.el = el;
    this.input = input;
    this.button = btn;

    // --- Reactive state (MUST be on DOM node) ---
    el.current = "";
    el.value = [];

    // --- Bind events ---
    input.addEventListener("input", () => {
      el.current = input.value;               // mirror to DOM
      el.dispatchEvent(new CustomEvent("input"));
    });

    btn.addEventListener("click", () => {
      const t = input.value.trim();
      if (t !== "") {
        el.value = [...el.value, t];          // mirror to DOM
        el.dispatchEvent(new CustomEvent("change"));
      }
    });

    // Remove Quarto styling
    queueMicrotask(() => btn.classList.remove("btn-quarto"));
  }

  get node() {
    return this.el;
  }
}


// --- Canonical InputGroup with prefixHTML + Add/RAZ/Clip --- //



