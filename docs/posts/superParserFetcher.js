// superParserFetchers.js has .parse and .fetch methods

// handle passing from input via parse to url then fetch
// harden robustFetcher returns

//==============================================================================
//==============================================================================
// IMPORTS
import { bcv_parser } from "./bcv_parser.js"; // this is native bcv_parser

// Import default language tables directly here
import {   
  grammar_options as default_grammar_options,
  regexps as default_regexps,
  translations as default_translations }
  from "./lang/fr.js";
  
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

//=============================================================================
// EXECUTION

/**
const supr = new SuperParserFetcher();

// supr.parse() is always first operation
supr.parse("Gn1.1 ps51.4");
// parsingInspector is an accessor
// .osis() returns osis internal property of parser
// console.log(supr.osis());
// console.log(supr.osis_array);
//console.log(supr.parse("Gn2.12 Ex3.4").parsingInspector);
console.log(supr.parse_inspect("Gn5.1 Rev4.2"));
//  console.log(supr.parsingInspector)
supr.parse("Gn5.1 Lv4.2 ps51.1").fetch_json();
  console.log(await supr.ready_payload());     // waits for #pending, returns #payload
//supr.parse("Gn6.1 Rev4.3").parse().fetch_json();
//  console.log(await supr.ready_payload());     // waits for #pending, returns #payload
//  supr.ready_payload().then(json => console.log(json.content));     // waits for #pending, returns #payload
*/ 
//supr.parse("Gn5.2 Lv3.1").fetch();
//const data = await supr.ready_payload();
//  console.log(data.content);

//supr.parse("Gn1.1 Exo2.4")
//  .fetcher()
//  .then((res) => console.log(res.content.content));

//==============================================================================
// Demo OK 
//const c = new Client();
//  c.fetch("https://hmi.pjafischer.workers.dev/bgw/cache/?param=Gen.5.2");   // synchronous, no await
//console.log(await c.ready());     // waits for #pending, returns #payload

/**
 * This is json response of hmi
 {
  "success": true,
  "error": null,
  "data": {
    "param": "Gen.5.2,Lev.3.1",
    "searchQuery": "Gen.5.2,Lev.3.1",
    "versionQuery": "SG21",
    "cacheid": "v3.1",
    "from_cache": true,
    "upstream": {
      "ok": true,
      "status": 200
    }
  },
  "duration": 12,
  "href": "https://www.biblegateway.com/passage/?search=Gen.5.2%2CLev.3.1&version=SG21",
  "ref": "Genèse 5:2Lévitique 3:1",
  "version": "Segond 21Segond 21",
  "content": "2 *Il créa l'homme et la femme et les bénit. Il les appela êtres humains lorsqu'ils furent créés. \n \n\n\n\n 3 »Lorsque quelqu'un offrira à l'Eternel un sacrifice de communion, s'il offre du gros bétail, mâle ou femelle, il l'offrira sans défaut devant l'Eternel."
} 

*/
 