/********************************************************************************************
* refui.js has bsInput AND RefEngine
* Minimal + OJS‑compliant + OSIS‑diff + url_fetchable + per‑keystroke transform
* new bsInput VS legacy bsInputBar then new RefEngine VS legacy SuperParserFetcher
********************************************************************************************/

//==============================================================================
//==============================================================================
// IMPORTS
import { bcv_parser } from "./bcv_parser.js"; // this is native bcv_parser

// Import default language tables objet directly here
import {   
  grammar_options as default_grammar_options,
  regexps as default_regexps,
  translations as default_translations }
  from "./lang/fr.js";
  
  /* =============================================================================
    * 1. UI COMPONENT — strict OJS contract
  * ========================================================================== */
    export class bsInput {
    constructor(options = {}) {
      this.options = {
        placeholder: "toto go",
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
      
      //========================================================================
      // 1. UI construction  
      // Root node returned to OJS
        this.root = document.createElement("div");
        this.root.className = "input-group";
        
      // ---- Prefix HTML ----
        if (this.options.prefixHTML) {
          this.prefix = document.createElement("span");
          this.prefix.className = "input-group-text";
          this.prefix.innerHTML = this.options.prefixHTML;
          this.root.appendChild(this.prefix);
        }
        
      // Internal <INPUT>
        this.input = document.createElement("input");
        this.input.type = "text";
        this.input.className = "form-control";
        this.input.placeholder = this.options.placeholder;
        
        if (this.options.size === "sm") this.input.classList.add("form-control-sm");
        if (this.options.size === "lg") this.input.classList.add("form-control-lg");
            
        this.root.appendChild(this.input); // append to ui
        
      // ---- Add BUTTONS ----
      //------------------------------------------------------------------------
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
      //------------------------------------------------------------------------

    // ---- Reset button ----
      this.btnReset = document.createElement("button");
      this.btnReset.type = "button";
      this.btnReset.className = `btn btn-warning`;
      this.btnReset.textContent = this.options.resetLabel;

      if (this.options.size === "sm") this.btnReset.classList.add("btn-sm");
      if (this.options.size === "lg") this.btnReset.classList.add("btn-lg");

    // RAZ Handler: UI, Osis, transform
      this.btnReset.addEventListener("click", async () => {
      // Reset UI
        this.input.value = "";
      // Reset OSIS tracking
        this.previousOsis = null;
      // Re-run transform
        await this._applyTransform();
    });

    this.root.appendChild(this.btnReset);
      //------------------------------------------------------------------------
      
    // 2. HANDLER logic
      // Internal state
          this._value = ""; // real-time input value per keystroke
          this.current = {osis: null, previousOsis: null, url_fetchable: null, response: null} // current response
          this.previousOsis = null;
        
      // Per‑KEYSTROKE HANDLER
        this.input.addEventListener("input", async () => {
          await this._applyTransform();
        }); // end of listener
        
      // REQUIRED DEF: .value getter on the root node
        Object.defineProperty(this.root, "value", {
          get: () => this.current ?? this._value
        });
    }  // end of constructor

      // REQUIRED: notify OJS that .value changed
      _emit() {
        this.root.dispatchEvent(new Event("input", { bubbles: true }));
      } // end of emit
  
      //
      async _applyTransform(){
          this._value = this.input.value;
          
          if (this.options.transform) {
            // transform receives (text, previousOsis)
            // transform returns {osis, previousOsis, url_fetchable, response}
            this.current = await this.options.transform(this._value, this.previousOsis);
            
            // update previous OSIS only when valid
            if (this.current.osis !== null) {
              this.previousOsis = this.current.osis;
            }
          }
          
      // REQUIRED: notify OJS that .value changed
          this.root.dispatchEvent(new Event("input"));
      }; // end of _applyTransform
        
      // REQUIRED: return the DOM node to OJS
      node() {
        return this.root;
      } // end of node
    } // end of class
  
  /* =============================================================================
    * 2. LOGIC LAYER — parser + OSIS diff + URL builder + conditional fetch
  * ========================================================================== */
  
  export class RefEngine {
    #url_fetchable = null; // acts as interface value between parse and fetch

    constructor({
      grammar_options = default_grammar_options,
      regexps = default_regexps,
      translations = default_translations
      } = {},
      baseUrl = "https://hmi.pjafischer.workers.dev/bgw/cache/"
      ) {
  
    this.baseUrl = baseUrl;
    this.#url_fetchable = `${this.baseUrl}?param=${encodeURIComponent("gen.1.1")}`;

   // Instantiate the internal bcv_parser via composition as a property
    this._baseParser = new bcv_parser({
      grammar_options,
      regexps,
      translations
      });

    this.baseUrl = baseUrl;
    
    // Optional: auto-bind if you want to pass methods directly
    this.transform = this.transform.bind(this);    // parse and return inspector object
    this.osis = this.osis.bind(this);    

    } // end of constructor
    
    parse(ref) {
      try {
        return this._baseParser.parse(ref).osis();
      } catch {
        return null;
      }
    }
    
  /**
   * Overloadable osis method osisi returns a string
   * @returns {string} - The OSIS string representation
   */
    osis() {
      return this._baseParser.osis();
    }
  
    buildUrl(osis) {
      return `${this.baseUrl}?param=${encodeURIComponent(osis)}`;
    }
    
    async transform(ref, previousOsis) {
      const osis = this.parse(ref);
      
      // Parsing failed → no URL, no fetch
      if (!osis) {
        return {
          osis: null,
          previousOsis,
          url_fetchable: null,
          response: null
        };
      }
      
      // Only build URL when OSIS changed
      const url_fetchable = (osis !== previousOsis)
      ? this.buildUrl(osis)
      : null;
      
      // Only fetch when OSIS changed
      let response = null;
      if (url_fetchable) {
          console.log(url_fetchable);
        const res = await fetch(url_fetchable);
        response = await res.json();
          console.log(response);
      }
      
      return {
        osis,
        previousOsis,
        url_fetchable,
        response
      };
    }
  }
  
  
//==============================================================================
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

//==============================================================================
// superParserFetcher
//==============================================================================
//==============================================================================
// IMPORTS
//import { bcv_parser } from "./bcv_parser.js"; // this is native bcv_parser

// Import default language tables directly here
//import {   
//  grammar_options as default_grammar_options,
//  regexps as default_regexps,
//  translations as default_translations }
//  from "./lang/fr.js";
  
//==============================================================================
export class SuperParserFetcher {
  // Private property to store the last successful OSIS string
  #previousValidOsis = "";
  #url_fetchable = null; // acts as interface value between parse and fetch
  #parsingInspector = {};
  
  // PRIVATE fields
  #osis_array = []; // stores osis & translation in array
  #pending = null;  // stores the Promise
  #payload = null;     // stores the resolved result as payload

  constructor({
    grammar_options = default_grammar_options,
    regexps = default_regexps,
    translations = default_translations
    } = {},
    baseUrl = "https://hmi.pjafischer.workers.dev/bgw/cache/"
    ) {
  
    this.baseUrl = baseUrl;
    this.#url_fetchable = `${this.baseUrl}?param=${encodeURIComponent("gen.1.1")}`;

   // Instantiate the internal bcv_parser via composition as a property
    this._baseParser = new bcv_parser({
      grammar_options,
      regexps,
      translations
      });
      
   // Optional: auto-bind if you want to pass methods directly
    // Bind methods so they can be passed as standalone functions
//    this.parseOsis = this.parseOsis.bind(this);    
    
    // Optional: auto-bind if you want to pass methods directly
//    this.parse_osis_array = this.parse_osis_array.bind(this);
    this.parse_inspect = this.parse_inspect.bind(this);    // parse and return inspector object
    this.osis_and_translations = this.osis_and_translations.bind(this);
    this.fetch_json = this.fetch_json.bind(this);    
    this.fetch_ready = this.fetch_ready.bind(this);    

    } // end of constructor
  
  // ------------------------------------------------------------
  // PRIVATE PREPROCESS HOOK
  // ------------------------------------------------------------
  _preprocess(text) {
    // just convert hsub ! to osis whitespace
    const hsub = text.trim().replaceAll('!',' ');
    return hsub;
  }
  
  /**
   * Overloadable parse method upto crafting url_fetchable
   * @param {string} text - The text containing Bible references to parse
   * @returns {SuperParserFetcher} - Returns `this` for chaining
   */
  parse(text) {
    // 1. Run the base parser logic at every keystroke !
    this._baseParser.parse(text);
    
    this.#osis_array = [];
    this.#payload = null;
    
    // 2. Check the result of this parse attempt
    const previousOsis = this.#previousValidOsis;
    const currentOsis = this._baseParser.osis();
    
    // 3. If the result is NEW and VALID (not empty), commit it to memory
    if (currentOsis == previousOsis) {
        this.#url_fetchable = null; // null marks is not fetchable
    } else {
      this.#previousValidOsis = currentOsis;
      this.#url_fetchable = `${this.baseUrl}?param=${encodeURIComponent(currentOsis)}`;
      // osis_array
      const arr = this._baseParser.osis_and_translations();
      this.#osis_array = arr.map(([osis, translation]) => translation ? `${osis} ${translation}` : `${osis}` );
    }
    const osis_array = this.#osis_array;
    const url_fetchable = this.#url_fetchable;
    const payload = this.#payload;
    this.#parsingInspector =  {previousOsis, currentOsis, osis_array, url_fetchable, payload};
    this.#parsingInspector =  { osis_array, url_fetchable, payload};

    return this; // allows chainable methods
  }
  
  /**
   * Overloadable osis method osisi returns a string
   * @returns {string} - The OSIS string representation
   */
  osis() {
    return this._baseParser.osis();
  }
  
  osis_and_translations(input) {
    const cleaned = this._preprocess(input);
    return this._baseParser.parse(cleaned).osis_and_translations();
  } 
   
  /**
   * Returns:
   *   ["John.3.16 KJV", "John.3.17 KJV", ...]
   * Safe for transform pipelines.
   */
  // DEPRECATED
  Xparse_osis_array(input) {
    try {
      const cleaned = this._preprocess(input);
      const arr = this._baseParser.parse(cleaned).osis_and_translations();
      return arr.map(([osis, translation]) => translation ? `${osis} ${translation}` : `${osis}` );
    } catch {
      return [];
    }
  }
  
  // NOT DEPRECATED
  parse_inspect(input) {
    const cleaned = this._preprocess(input);
//    const osis = this.parse_osis_array(cleaned);
    const osis = this.parse(cleaned).osis();
    const url = this.#url_fetchable;
//    return {osis, url}; // ONE singleton object is returned can hold multiple properties
    return this.parsingInspector;
    
  } 
 
  // PUBLIC API — no await needed, Stores the result to local properties
  // Wrapper you can call WITHOUT await
  fetch_json() {
    const url_fetchable = this.#url_fetchable;
    
    if (url_fetchable) {
      console.log(url_fetchable);
      // Start async work and store the Promise
      this.#pending = this.#fetcher(url_fetchable).then(json => {
        const json_ext = json;
//        Object.assign(json_ext, {url_fetchable});
 //       Object.assign(json_ext.data, this.#parsingInspector);
      this.#payload = json_ext;   // store result ie json
      return json_ext;
      });
    } else {
       this.#payload = {
        success: false,
        error: "url_fetchable none",
//        data: this.parsingInspector
       }
    } return this; // chainable, synchronous
  }
  
  
  async fetch_ready() {
      this.fetch_json(); // fetch !!
//    return this.fetch_json().#pending.then((() => this.#payload)) 
    return this.#pending.then((() => this.#payload)) 
  }  
  
  // PUBLIC awaitable accessor
  // Method to await later is _pending is completed then _data is available
  async ready_payload() {
//    if (this.#pending) {
//      await this.#pending;
//    }
    return this.#pending.then((() => this.#payload)) 
  }
  
  /**
   * IS NOT Async chainable method to fetch content based on the current OSIS value
   * @returns {Promise<SuperParser>} - Resolves to `this` for further chaining
   */
  async #fetcher(url) {
    try {
      const response = await fetch(url); // FETCH
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const mijson = await response.json(); // body as JSON
      return mijson;
      } catch (error) {
        console.error("SuperParserFetcher: Failed to fetch content:", error);
      }
  }
  
  /**
   * Getter to safely access the parser-state
   */
  get parsingInspector() {
    return this.#parsingInspector;
  }

  get osis_array() {
    return this.#osis_array;
  }
//=============================================================================
//=============================================================================
    /** ALMOST not used 
 * Robust fetch with timeout, error normalization, and safe JSON parsing.
 * Always returns an object: { ok, status, data, error }
 */
async robustFetcher(url, {
  method = "GET",
  headers = {},
  body = null,
  timeout = 8000,   // ms
} = {}) {

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal
    });

    clearTimeout(id);

    // HTTP-level error (non-2xx)
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: `HTTP ${res.status} ${res.statusText}`
      };
    }

    // Try to parse JSON safely
    let data = null;
    try {
      data = await res.json();
//      console.log(data.content);
      // Store the result in the private property (assuming JSON response, change to .text() if plain text)
      this.#payload = data; 
      
    } catch {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: "Invalid JSON in response"
      };
    }

//    return { ok: true, status: res.status, data, error: null };
      
  } catch (err) {
    clearTimeout(id);

    // Timeout
    if (err.name === "AbortError") {
      return {
        ok: false,
        status: 0,
        data: null,
        error: "Request timed out"
      };
    }

    // Network error (DNS, offline, CORS, etc.)
    return {
      ok: false,
      status: 0,
      data: null,
      error: err.message || "Network error"
    };
  }
  return this;

}
  
} // end of class
// END of SuperParser
  
  /* =============================================================================
    * 3. OJS / QUARTO USAGE (COMMENTED)
  * ========================================================================== */
    /*
    
    import { bsInput, RefEngine } from "./bible-ref-ojs-diff.js";
  
  const engine = new RefEngine({
    baseUrl: "https://api.example.com/passage"
  });
  
  viewof ref = new bsInput({
    placeholder: "Enter reference",
    transform: (txt, prev) => engine.transform(txt, prev)
  }).node();
  
  ref.value.osis           // current OSIS
  ref.value.previousOsis   // previous OSIS
  ref.value.url_fetchable  // non-null only when OSIS changed
  ref.value.response           // fetched JSON (only when OSIS changed)
  
  */