// bsuidebounce.js provides ojs bootstrap compatible elements

//=========================================================================

export class bsInputAndFetch2 {
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
      console.log(cleaned);

      this._content = 'toto';
      this.options.fetcher();   // OSIS or null
  
      // Auto-fetch content if fetcher exists and cleaned is valid
      
//      if (this.options.fetcher && cleaned) {
//        this._content = await this.options.fetcher(cleaned);
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

export class bsInputAndFetch {
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

//    this.root.appendChild(this.btnReset);

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
class BSInput {
  constructor({ transform }) {
    this.transform = transform;

    // Root element OK
    this.root = document.createElement("div");
    this.root.className = "input-group";

    // Input element OK
    this.input = document.createElement("input");
    this.input.className = "form-control";
    this.root.append(this.input);

    // Private reactive value OK
    this._current = null;

    // Debounced heavy transform (bcv_parser + fetch)
    this._debounced = debounceAsync(async raw => {
      const result = await this.transform(raw);
      this._current = result;

      // Notify OJS
      this.root.dispatchEvent(new Event("input", { bubbles: true }));
    }, 40);

    // Cheap input listener
    this.input.addEventListener("input", e => {
      const raw = e.target.value;
      this._debounced(raw);
    });
  }

  // OJS reads this.value, not this._current
  get value() {
    return this._current;
  }
}

//======================================================================
const debounceAsync = (fn, ms = 40) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

export class bsInputAndDebounce {
  constructor(options = {}) {
    this.options = {
      placeholder: "",
      prefixHTML: null,
//      addLabel: "Add",
      resetLabel: "Reset",
//      clipLabel: "Clip",
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
    
    this.root.appendChild(this.input);
    
    // Debounced heavy transform (bcv_parser + fetch)
    this._debounced = debounceAsync(async raw => {
      const cleaned = await this.options.transform(raw);
      
      if(!cleaned) {
        this._current = null;
        this._emit();
        return
      } // if result is null     
      
      this._current = cleaned;

// FETCH here
      // Auto-fetch content if fetcher exists and cleaned is valid
      if (this.options.fetcher && cleaned) {
        try {
         this._content = await this.options.fetcher(cleaned);
//          this._content = await safeSendMessage({ type: "lookup", cleaned });
        } catch (err) {
          console.error("Fetcher failed:", err);
          this._content = null;
        }
      }

// Notify OJS
//      this.root.dispatchEvent(new Event("input", { bubbles: true }));
      this._emit();
      }, 50);

    // Cheap input listener
    this.input.addEventListener("input", e => {
      const raw = e.target.value;
      this._debounced(raw);
    });

    // ---- Add button ----

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

    // ---- Quarto rewrite defense ----

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
/**
 * 
const bcv_parser = require("bible-passage-reference-parser/js/en_bcv_parser").bcv_parser;
const bcv = new bcv_parser();

let lastFetchedOsis = "";

function processBibleInput(input) {
  // 1. Parse the current input
  const parsed = bcv.parse(input);
  
  // 2. Get valid OSIS references
  // .osis() returns a comma-separated string like "Gen.1.1,Exod.2.2"
  const currentOsis = parsed.osis();

  // 3. Validation & Fetch Logic
  if (currentOsis.length > 0) {
    // Only fire if the valid output has actually changed/grown
    if (currentOsis !== lastFetchedOsis) {
      fireFetch(currentOsis);
      lastFetchedOsis = currentOsis;
    }
  }
}

function fireFetch(osisString) {
  console.log(`🚀 Fetching data for: ${osisString}`);
  // Your API call logic here (e.g., fetch(`api/bible/${osisString}`))
}

// --- Simulation of progressive typing ---
const steps = [
  "Gen.1.1",           // Valid -> Fetch
  "Gen.1.1,Exod.",     // "Exod." is incomplete -> OSIS remains "Gen.1.1" -> No fetch
  "Gen.1.1,Exod.2.2",  // New valid ref -> OSIS becomes "Gen.1.1,Exod.2.2" -> Fetch
  "Gen.1.1,Exod.2.2,L" // Incomplete -> No fetch
];

steps.forEach(step => {
  console.log(`Input: "${step}"`);
  processBibleInput(step);
});

 */