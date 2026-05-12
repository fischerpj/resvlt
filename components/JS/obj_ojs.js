
export function objectInput(obj) {
  const el = document.createElement("div");
  el.className = "object-input";

  // Internal state clone
  let state = structuredClone(obj);

  // Create fields dynamically
  for (const [key, value] of Object.entries(state)) {
    const wrapper = document.createElement("label");
    wrapper.textContent = key + ": ";

    const input = document.createElement("input");
    input.value = value;
    input.oninput = () => {
      state[key] = input.value;
      el.value = structuredClone(state);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };

    wrapper.append(input);
    el.append(wrapper, document.createElement("br"));
  }

  // REQUIRED: expose .value
  Object.defineProperty(el, "value", {
    get() { return state; },
    set(v) {
      state = structuredClone(v);
      for (const [key, value] of Object.entries(state)) {
        const input = el.querySelector(`label:nth-child(${Object.keys(state).indexOf(key)*2+1}) input`);
        input.value = value;
      }
    }
  });

  return el;
}

/**
viewof person = objectInput(obj)
person

const obj = {
  first: "Ada",
  last: "Lovelace",
  age: 36
};
*/

// bootstrap-inputs.js
// Supplier‑agnostic Bootstrap input factories for Quarto OJS

export function bootstrapNumberInput({
  value = 0,
  min = null,
  max = null,
  step = 1,
  prefix = "",
  suffix = ""
} = {}) {

  // Create wrapper
  const group = document.createElement("div");
  group.className = "input-group";
  group.style.maxWidth = "260px";

  // Optional prefix
  if (prefix) {
    const span = document.createElement("span");
    span.className = "input-group-text";
    span.textContent = prefix;
    group.appendChild(span);
  }

  // Input element
  const input = document.createElement("input");
  input.className = "form-control";
  input.type = "number";
  input.value = value;
  input.step = step;
  if (min !== null) input.min = min;
  if (max !== null) input.max = max;
  group.appendChild(input);

  // Optional suffix
  if (suffix) {
    const span = document.createElement("span");
    span.className = "input-group-text";
    span.textContent = suffix;
    group.appendChild(span);
  }

  // OJS contract: expose .value on wrapper
  Object.defineProperty(group, "value", {
    get: () => Number(input.value)
  });

  // OJS contract: dispatch "input" when value changes
  input.addEventListener("input", () => {
    group.dispatchEvent(new Event("input", { bubbles: true }));
  });

  return group;
}

// bootstrap-inputs.js
// Accumulating text input with Add + RAZ + Clip buttons for Quarto OJS.

export function bootstrapAccumulatingTextInput({
  prefix = "",
  suffix = "",
  placeholder = "",
  addLabel = "Add",
  addClass = "btn btn-primary",
  razLabel = "RAZ",
  razClass = "btn btn-outline-danger",
  clipLabel = "Clip",
  clipClass = "btn btn-outline-secondary"
} = {}) {

  // Wrapper
  const group = document.createElement("div");
  group.className = "input-group";
  group.style.maxWidth = "520px";

  // Internal state: accumulated values
  const values = [];

  // Optional prefix
  if (prefix) {
    const span = document.createElement("span");
    span.className = "input-group-text";
    span.textContent = prefix;
    group.appendChild(span);
  }

  // Text input
  const input = document.createElement("input");
  input.className = "form-control";
  input.type = "text";
  if (placeholder) input.placeholder = placeholder;
  group.appendChild(input);

  // Optional suffix
  if (suffix) {
    const span = document.createElement("span");
    span.className = "input-group-text";
    span.textContent = suffix;
    group.appendChild(span);
  }

  // Add button
  const addBtn = document.createElement("button");
  addBtn.className = addClass;
  addBtn.textContent = addLabel;
  group.appendChild(addBtn);

  // RAZ button
  const razBtn = document.createElement("button");
  razBtn.className = razClass;
  razBtn.textContent = razLabel;
  group.appendChild(razBtn);

  // Clip button
  const clipBtn = document.createElement("button");
  clipBtn.className = clipClass;
  clipBtn.textContent = clipLabel;
  group.appendChild(clipBtn);

  // OJS contract: .value returns the accumulated array
  Object.defineProperty(group, "value", {
    get: () => values
  });

  // Add button → push input value into array
  addBtn.onclick = () => {
    const text = input.value.trim();
    if (text !== "") {
      values.push(text);
      group.dispatchEvent(new Event("input", { bubbles: true }));
      input.value = "";
    }
  };

  // RAZ button → clear array
  razBtn.onclick = () => {
    values.length = 0; // clear in place
    group.dispatchEvent(new Event("input", { bubbles: true }));
  };

  // Clip button → copy JSON stringified array to clipboard
  clipBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(values));
      // Optional: visual feedback
      clipBtn.textContent = "Copied!";
      setTimeout(() => (clipBtn.textContent = clipLabel), 800);
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };

  // Typing does not change array, but still emits event
  input.addEventListener("input", () => {
    group.dispatchEvent(new Event("input", { bubbles: true }));
  });

  return group;
}

// bootstrap-inputs.js
// Accumulating text input with Add + RAZ + Clip buttons for Quarto OJS,
// with a private variable tracking the last typed text.

export function bootstrapAccumulatingTextInput2({
  prefix = "",
  prefixHTML = "",
  suffix = "",
  placeholder = "",
  addLabel = "Add",
  addClass =  "btn btn-sm btn-primary rounded flex-grow-1", //"btn btn-primary",
  razLabel = "RAZ",
  razClass = "btn btn-sm btn-danger rounded flex-grow-1", // "btn btn-outline-danger",
  clipLabel = "Clip",
  clipClass =  "btn btn-sm btn-success rounded flex-grow-1" //"btn btn-outline-secondary"
} = {}) {

  // Wrapper
  const group = document.createElement("div");
  group.className = "input-group input-group-sm flex-grow-1 me-1"; // "input-group";
  group.style.maxWidth = "520px";
  
//        style="flex-basis:40%; max-width:50%;"


  // Internal state
  const values = [];          // committed array
  let currentText = "";       // private, last typed text

  // Optional prefix
  // --- PREFIX (text or HTML) ---
  if (prefix || prefixHTML) {
    const span = document.createElement("span");
    span.className = "input-group-text";
    if (prefixHTML) span.innerHTML = prefixHTML;
    else span.textContent = prefix;
    group.appendChild(span);
  }

/**
   <span class="input-group-text" id="btnGroupAddon">
      <i class="bi bi-search"></i>
    </span>
*/

  // Text input
  const input = document.createElement("input");
  input.className = "form-control";
  input.type = "text";
  input.style = "flex-basis: 40%; max-width: 50%;"; 
  
  if (placeholder) input.placeholder = placeholder;
  group.appendChild(input);

  // Optional suffix
  if (suffix) {
    const span = document.createElement("span");
    span.className = "input-group-text";
    span.textContent = suffix;
    group.appendChild(span);
  }

  // Add button
  const addBtn = document.createElement("button");
  addBtn.className = addClass;
  addBtn.textContent = addLabel;
  group.appendChild(addBtn);

/**
    <button type="button" 
            class="btn btn-sm btn-primary rounded flex-grow-1"
            on:click={() => addValue(wrapResult)}> 
            ADD
            </button>
*/

  // RAZ button
  const razBtn = document.createElement("button");
  razBtn.className = razClass;
  razBtn.textContent = razLabel;
  group.appendChild(razBtn);

  // Clip button
  const clipBtn = document.createElement("button");
  clipBtn.className = clipClass;
  clipBtn.textContent = clipLabel;
  group.appendChild(clipBtn);

  // OJS contract: .value returns the accumulated array
  Object.defineProperty(group, "value", {
    get: () => values
  });

  // Track last typed text (private)
  input.addEventListener("input", () => {
    currentText = input.value;  // update private variable
    group.dispatchEvent(new Event("input", { bubbles: true }));
  });

  // Add button → push currentText into array
  addBtn.onclick = () => {
    const text = currentText.trim();
    if (text !== "") {
      values.push(text);
      group.dispatchEvent(new Event("input", { bubbles: true }));
      input.value = "";
      currentText = ""; // reset private variable
    }
  };

  // RAZ button → clear array
  razBtn.onclick = () => {
    values.length = 0;
    group.dispatchEvent(new Event("input", { bubbles: true }));
  };

  // Clip button → copy JSON stringified array to clipboard
  clipBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(values));
      clipBtn.textContent = "Copied!";
      setTimeout(() => (clipBtn.textContent = clipLabel), 800);
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };

  return group;
}

/**
// inspired by osisparserUI.svelte
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
    <button type="button" 
            class="btn btn-sm btn-success rounded flex-grow-1" 
            on:click={handleClip}
            disabled={!inputValue}>
            CLIP
            </button>
    <button type="button" 
            class="btn btn-sm btn-danger rounded flex-grow-1" 
            on:click={handleRaz}>
            RAZ
            </button>
    <button type="button" 
            class="btn btn-sm btn-info flex-grow-1 d-none d-sm-block"
            on:click={() => handleAction('HELP')}>
            HELP</button>
    
  </div>
</div>
*/

// bootstrap-inputs.js
// Accumulating text input with Add + RAZ + Clip buttons for Quarto OJS,
// supporting prefixHTML/suffixHTML and now wrapped in a btn-toolbar.

export function bootstrapAccumulatingTextInputBar({
  prefix = "",
  prefixHTML = "",
  suffix = "",
  suffixHTML = "",
  placeholder = "",
  inputClass = "form-control",
  addLabel = "Add",
  addClass = "btn btn-sm btn-primary rounded flex-grow-1",
  razLabel = "RAZ",
  razClass =  "btn btn-sm btn-danger rounded flex-grow-1",
  clipLabel = "Clip",
  clipClass = "btn btn-sm btn-success rounded flex-grow-1"
} = {}) {

  // --- OUTER WRAPPER: btn-toolbar ---
  const toolbar = document.createElement("div");
  toolbar.className = "btn-toolbar";
  toolbar.role = "toolbar";
  toolbar.setAttribute("aria-label", "blba");

  // --- INNER WRAPPER: input-group ---
  const group = document.createElement("div");
//  group.className = "input-group";
  group.className = "input-group input-group-sm flex-grow-1 me-1"; // "input-group";
  group.style.maxWidth = "600px";

  // Internal state
  const values = [];
  let currentText = "";

  // --- PREFIX (text or HTML) ---
  if (prefix || prefixHTML) {
    const span = document.createElement("span");
    span.className = "input-group-text";
    if (prefixHTML) span.innerHTML = prefixHTML;
    else span.textContent = prefix;
    group.appendChild(span);
  }

  // --- TEXT INPUT ---
  const input = document.createElement("input");
  input.className = "form-control";
////  
  input.style = "flex-basis: 40%; max-width: 50%;"; 
////
  if (inputClass) input.classList.add(...inputClass.split(" "));
  input.type = "text";
  if (placeholder) input.placeholder = placeholder;
  group.appendChild(input);

  // --- SUFFIX (text or HTML) ---
  if (suffix || suffixHTML) {
    const span = document.createElement("span");
    span.className = "input-group-text";
    if (suffixHTML) span.innerHTML = suffixHTML;
    else span.textContent = suffix;
    group.appendChild(span);
  }

  // --- ADD BUTTON ---
  const addBtn = document.createElement("button");
  addBtn.className = addClass;
  addBtn.textContent = addLabel;
  addBtn.classList.remove("btn-quarto");
  group.appendChild(addBtn);

  // --- RAZ BUTTON ---
  const razBtn = document.createElement("button");
  razBtn.className = razClass;
  razBtn.textContent = razLabel;
  razBtn.classList.remove("btn-quarto");
  group.appendChild(razBtn);

  // --- CLIP BUTTON ---
  const clipBtn = document.createElement("button");
  clipBtn.className = clipClass;
  clipBtn.textContent = clipLabel;
  clipBtn.classList.remove("btn-quarto");
  group.appendChild(clipBtn);

  // --- OJS CONTRACT: .value returns the accumulated array ---
  Object.defineProperty(group, "value", {
    get: () => values
  });
  
  // --- TRACK PRIVATE currentText ---
  input.addEventListener("input", () => {
    currentText = input.value;
    group.dispatchEvent(new Event("input", { bubbles: true }));
  });

  // --- ADD BUTTON LOGIC ---
  addBtn.onclick = () => {
    const text = currentText.trim();
    if (text !== "") {
      values.push(text);
      group.dispatchEvent(new Event("input", { bubbles: true }));
      input.value = "";
      currentText = "";
    }
  };

  // --- RAZ BUTTON LOGIC ---
  razBtn.onclick = () => {
    values.length = 0;
    group.dispatchEvent(new Event("input", { bubbles: true }));
  };

  // --- CLIP BUTTON LOGIC ---
  clipBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(values));
      clipBtn.textContent = "Copied!";
      setTimeout(() => (clipBtn.textContent = clipLabel), 800);
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };

  // --- ASSEMBLE TOOLBAR ---
  toolbar.appendChild(group);

  return toolbar;
}


////
// bootstrap-inputs.js
// Accumulating text input with Add + RAZ + Clip buttons for Quarto OJS,
// supporting prefixHTML/suffixHTML and wrapped in a btn-toolbar.
// .value and "input" events are correctly attached to the OUTER toolbar.

export function bootstrapAccumulatingTextInputBar2({
  prefix = "",
  prefixHTML = "",
  suffix = "",
  suffixHTML = "",
  placeholder = "",
  inputClass = "",
  addLabel = "Add",
  addClass = "btn btn-primary",
  razLabel = "RAZ",
  razClass = "btn btn-outline-danger",
  clipLabel = "Clip",
  clipClass = "btn btn-outline-secondary"
} = {}) {

  // --- OUTER WRAPPER: btn-toolbar ---
  const toolbar = document.createElement("div");
////  toolbar.className = "btn-toolbar";
  toolbar.classList.add("btn-toolbar");

  toolbar.role = "toolbar";
  toolbar.setAttribute("aria-label", "blba");

  // --- INNER WRAPPER: input-group ---
  const group = document.createElement("div");
////  group.className = "input-group";
  group.classList.add("input-group");

  group.style.maxWidth = "600px";

  // Internal state
  const values = [];      // committed array
  let currentText = "";   // private ephemeral state

  // --- PREFIX (text or HTML) ---
  if (prefix || prefixHTML) {
    const span = document.createElement("span");
    span.className = "input-group-text";
    if (prefixHTML) span.innerHTML = prefixHTML;
    else span.textContent = prefix;
    group.appendChild(span);
  }

  // --- TEXT INPUT ---
  const input = document.createElement("input");
//  input.className = "form-control";
  input.classList.add("form-control");

  if (inputClass) input.classList.add(...inputClass.split(" "));
  input.type = "text";
  if (placeholder) input.placeholder = placeholder;
  group.appendChild(input);

  // --- SUFFIX (text or HTML) ---
  if (suffix || suffixHTML) {
    const span = document.createElement("span");
    span.className = "input-group-text";
    if (suffixHTML) span.innerHTML = suffixHTML;
    else span.textContent = suffix;
    group.appendChild(span);
  }

  // --- ADD BUTTON ---
  const addBtn = document.createElement("button");
////  addBtn.className = addClass;
  addBtn.classList.add(addClass);
  addBtn.textContent = addLabel;
  group.appendChild(addBtn);

  // --- RAZ BUTTON ---
  const razBtn = document.createElement("button");
////  razBtn.className = razClass;
  razBtn.classList.add(razClass);
  razBtn.textContent = razLabel;
  group.appendChild(razBtn);

  // --- CLIP BUTTON ---
  const clipBtn = document.createElement("button");
////  clipBtn.className = clipClass;
  clipBtn.classList.add(clipClass);
  clipBtn.classList.remove("btn-quarto");
  clipBtn.textContent = clipLabel;
  group.appendChild(clipBtn);

  // --- OJS CONTRACT: .value MUST be on the OUTER toolbar ---
  Object.defineProperty(toolbar, "value", {
    get: () => values
  });

  // --- TRACK PRIVATE currentText ---
  input.addEventListener("input", () => {
    currentText = input.value;
    toolbar.dispatchEvent(new Event("input", { bubbles: true }));
  });

  // --- ADD BUTTON LOGIC ---
  addBtn.onclick = () => {
    const text = currentText.trim();
    if (text !== "") {
      values.push(text);
      toolbar.dispatchEvent(new Event("input", { bubbles: true }));
      input.value = "";
      currentText = "";
    }
  };

  // --- RAZ BUTTON LOGIC ---
  razBtn.onclick = () => {
    values.length = 0;
    toolbar.dispatchEvent(new Event("input", { bubbles: true }));
  };

  // --- CLIP BUTTON LOGIC ---
  clipBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(values));
      clipBtn.textContent = "Copied!";
      setTimeout(() => (clipBtn.textContent = clipLabel), 800);
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };

  // --- ASSEMBLE TOOLBAR ---
  toolbar.appendChild(group);

  return toolbar;
}

// reconcile latest two versions

export function InputGroupWithButton({placeholder = "", label = "Go", variant = "primary"} = {}) {
  const group = html`<div class="input-group"></div>`

  const input = html`<input class="form-control" placeholder="${placeholder}">`

  // Quarto-safe wrapper around the button
  const btnWrap = html`<div class="ojs-safe"></div>`
  const btn = html`<button class="btn btn-${variant}">${label}</button>`
  btnWrap.append(btn)

  group.append(input, btnWrap)
  return group
}

