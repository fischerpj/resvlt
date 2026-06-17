// bsBcv2.js

// DESIGN: the fetch rule IF current != previous THEN fetch current

//==============================================================================
// IMPORTS
import { bcv_parser } from "./bcv_parser.js";

// Import default language tables directly here
import {   
  grammar_options as default_grammar_options,
  regexps as default_regexps,
  translations as default_translations }
  from "./lang/fr.js";
  
  
  
//==============================================================================
export class SuperParser {
  // Private property to store the last successful OSIS string
  #previousValidOsis = "";
  #content = null; 
  #isfetchable = false;
  #parsingInspector = {};
  
  constructor({
    grammar_options = default_grammar_options,
    regexps = default_regexps,
    translations = default_translations
    } = {},
    baseUrl = "https://hmi.pjafischer.workers.dev/bgw/cache/"
    ) {
  
    this.baseUrl = baseUrl;

   // Instantiate the bcv_parser via composition
   // Internal parser as a property
    this._baseParser = new bcv_parser({
      grammar_options,
      regexps,
      translations
      });
      
    // Optional: auto-bind if you want to pass methods directly
    // Bind methods so they can be passed as standalone functions
//    this.parseOsis = this.parseOsis.bind(this);    
    
    // Optional: auto-bind if you want to pass methods directly
    this.osis_array = this.osis_array.bind(this);
    this.osis_and_translations = this.osis_and_translations.bind(this);

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
   * Overloadable parse method
   * @param {string} text - The text containing Bible references to parse
   * @returns {SuperParser} - Returns `this` for chaining
   */
  parse(text) {
    // 1. Run the base parser logic at every keystroke !
    const cleaned = this._preprocess(text);
    this._baseParser.parse(cleaned);

    // 2. Check the result of this parse attempt
    const previousOsis = this.#previousValidOsis;
    const currentOsis = this._baseParser.osis();

    // 3. If the result is NEW and VALID (not empty), commit it to memory
    if (currentOsis == previousOsis) {
      this.#isfetchable = false;
    } else {
      this.#isfetchable = true;
      this.#previousValidOsis = currentOsis;
    }
    
      const isfetchable = this.#isfetchable;
      const mylog = {isfetchable,currentOsis,previousOsis}
      console.log(mylog);
    this.#parsingInspector = mylog;
    
    return this;
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
  osis_array(input) {
    try {
      const cleaned = this._preprocess(input);
      const arr = this._baseParser.parse(cleaned).osis_and_translations();
      return arr.map(([osis, translation]) => translation ? `${osis} ${translation}` : `${osis}` );
    } catch {
      return [];
    }
  }
  

  /**
   * Overloadable osis method osisi returns a string
   * @returns {string} - The OSIS string representation
   */
  osis() {
    return this._baseParser.osis();
  }
  
  // Parse a Bible reference and return OSIS or null
  parseOsis(input) {
    try {
      const result = this.parse(input);
      const mires =  result.osis();
        const isfetchable = this.#isfetchable;
        const milog = {mires,isfetchable}
//      return result.osis();
      return milog;s
    } catch (err) {
      return null;              // invalid reference
    }
  }
  
   /**
   * Resets the internal memory properties to their default states.
   * @returns {SuperParser} - Returns `this` for chaining
   */
  reset() {
    this.#previousValidOsis = "";
    this.#content = null;
    this.#isfetchable = false;
    this.#parsingInspector = {};
    
    // Optional: If you also want to clear out the underlying bcv_parser state
    // you can reinstantiate it, or just leave it to be overwritten on the next .parse()
    // this.baseParser = new bcv_parser(); 

    return this;
  }

  /**
   * Async chainable method to fetch content based on the current OSIS value
   * @returns {Promise<SuperParser>} - Resolves to `this` for further chaining
   */
  async fetcher() {
    // Get the current OSIS reference from the last parse
    const currentOsis = this.osis();
//    const previousOsis = this.previousValidOsis;
    const fetchable = this.#isfetchable;

    // If there is nothing parsed yet, we can't fetch anything
//    if (!currentOsis) {
//    if (currentOsis == previousOsis) {
    if (!fetchable) {
      console.warn("SuperParser: No valid OSIS reference found to fetch.");
      this.#content = null;
      return this; 
    }

    console.log('hello');
    try {
      // Construct your target Cloudflare endpoint URL (adjust query params/paths as needed by your API)
      const url = `${this.baseUrl}?param=${encodeURIComponent(currentOsis)}`;
      console.log(url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Store the result in the private property (assuming JSON response, change to .text() if plain text)
      this.#content = await response.json(); 

    } catch (error) {
      console.error("SuperParser: Failed to fetch content:", error);
      this.#content = null; // Clear or handle state on failure
    }

    // Return 'this' to keep the method chainable
    return this;
  }

  /**
   * Getter to safely access the memory of the last valid OSIS value
   * @returns {string}
   */
  get previousValidOsis() {
    return this.#previousValidOsis;
  }
  
  /**
   * Getter to safely access the fetched content
   */
  get content() {
    return this.#content;
  }
  
   /**
   * Getter to safely access the parser-state
   */
  get parsingInspector() {
    return this.#parsingInspector;
  }
  
} // end of class
// END of SuperParser

//=============================================================================
// super_bcv_parser.js

export class super_bcv_parser {
  #lastValidOsis = null;

  constructor({
    grammar_options = default_grammar_options,
    regexps = default_regexps,
    translations = default_translations
    } = {},
    baseUrl = "https://hmi.pjafischer.workers.dev/bgw/cache/"
    ) {

    this.baseUrl = baseUrl;

    // Internal parser as a property
    this._bcv = new bcv_parser({
      grammar_options,
      regexps,
      translations
    });
    
    // Optional: auto-bind if you want to pass methods directly
    this.osis_array = this.osis_array.bind(this);
    this.parse = this.parse.bind(this);
    this.osis_and_translations = this.osis_and_translations.bind(this);
    this.fetchPassage = this.fetchPassage.bind(this);

  }
  
  // ------------------------------------------------------------
  // ACCESSORS
  // ------------------------------------------------------------
  
  get lastValid() {
    return this.#lastValidOsis
  }

  set lastValid(input) {
    const osis = this.#tryParse(input)
    if (osis !== null) {
      this.#lastValidOsis = osis
    }
  }

  #tryParse(input) {
    try {
      const out = this._bcv.parse(input).osis()
      return out && out.length > 0 ? out : null
    } catch {
      return null
    }
  }
  
  // ------------------------------------------------------------
  // PRIVATE PREPROCESS HOOK
  // ------------------------------------------------------------
    _preprocess(text) {
    // just convert hsub ! to osis whitespace
    const hsub = text.trim().replaceAll('!',' ');
    return hsub;
  }

  // ------------------------------------------------------------
  // PUBLIC API (all go through preprocess)
  // ------------------------------------------------------------
  parse(input) {
    const cleaned = this._preprocess(input);
    return  this._bcv.parse(cleaned);
  }

  osis_and_translations(input) {
    const cleaned = this._preprocess(input);
    return this._bcv.parse(cleaned).osis_and_translations();
  }
  
  /**
   * Returns:
   *   ["John.3.16 KJV", "John.3.17 KJV", ...]
   * Safe for transform pipelines.
   */
  osis_array(input) {
    try {
      const cleaned = this._preprocess(input);
      const arr = this._bcv.parse(cleaned).osis_and_translations();
      return arr.map(([osis, translation]) => translation ? `${osis} ${translation}` : `${osis}` );
    } catch {
      return [];
    }
  }
  

//============================
  
        // ---- FETCH FROM YOUR PROXY ----
  // Fetch sanitized passage HTML from your Worker
  async fetchPassage(osis ="Gen1.1", version = "LSG") {
    if (!osis) return null;

    // Your Worker expects: ?param=John.3.16!LSG
//    const param = `${osis}!${version}`;
    const param = `${osis}`;
    const url = `${this.baseUrl}?param=${encodeURIComponent(param)}`;
    console.log(url);

    const res = await fetch(url);
    const json = await res.json();

    // Your Worker returns:
    // { success, data: { passage_html, ... }, error }
    if (!json.success) return null;

    return json.content|| null;
  }
}

//=============================================================================
// EXECUTION
/**
const supr = new SuperParser();
console.log(supr.parse("Gen211.1").osis());
console.log(supr.parse("Gen1.3 Ps151.4").osis());

console.log(supr.parse("Gen1.1").osis());
console.log(supr.parse("Gn1.1 Exo1.1").osis());
console.log(supr.parse("Gn1.1 Exo1.3 Gg.").osis());
*/


const supr = new SuperParser();

supr.parse("Gn1.15")
//console.log(supr.parsingInspector);

supr.parse("Gn2.1 Ex")

supr.parse("Gn1.1 Exo2.4")
  .fetcher()
  .then((res) => console.log(res.content.content));

async function run() {
  const super_bcv = new SuperParser();

  // Chain parse() and fetch() together seamlessly
  const parserInstance = super_bcv.parse("Gn1.1 Exo1.3 Gg.")
  await parserInstance.fetch();

  // Access the private #content property via its public getter
  console.log(parserInstance.content.data);
}


//run

