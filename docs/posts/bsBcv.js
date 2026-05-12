// BcvParserRef.js
import { bcv_parser } from "./bcv_parser.js";
// Import default language tables directly here
import {   
  grammar_options as default_grammar_options,
  regexps as default_regexps,
  translations as default_translations }
  from "./lang/fr.js";
  
// bcvWrapper.js — minimal safe wrapper around bcv_parser
export class BCVWrapper {
  constructor(baseUrl = "https://hmi.pjafischer.workers.dev/bgw/cache/") {
    this.bcv = (new SuperParserRef()).parser;
    this.baseUrl = baseUrl;

    // Bind methods so they can be passed as standalone functions
    this.parseOsis = this.parseOsis.bind(this);
    this.parseOsisArray = this.parseOsisArray.bind(this);
  }

  // Parse a Bible reference and return OSIS or null
  parseOsis(input) {
    try {
      const result = this.bcv.parse(input);
      return result.osis();     // normalized OSIS string
    } catch (err) {
      return null;              // invalid reference
    }
  }
  
    // Parse a Bible reference and return an OSIS ARRAY or null
  parseOsisArray(input) {
    try {
      const result = this.bcv.parse(input);
      return result.osis_array();     // normalized OSIS string
    } catch (err) {
      return null;              // invalid reference
    }
  }
 

}


////====================================================================
// super_bcv_parser.js

export class super_bcv_parser {
  constructor({
    grammar_options = default_grammar_options,
    regexps = default_regexps,
    translations = default_translations
    } = {},
    baseUrl = "https://hmi.pjafischer.workers.dev/bgw/cache/"
    ) {

    this.baseUrl = baseUrl;
    
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
    return this._bcv.parse(cleaned);
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


// creates a bcv_parser with lang
export class BcvParserLang {
  constructor() {
    this.instance = new bcv_parser({
      grammar_options,
      regexps,
      translations
    });
  }

  parse(ref) {
    return this.instance.parse(ref).osis();
  }
}

export class SuperParserRef {
  // CONSTRUCTOR
  /**
   * @param {object} lang - language configuration module
   * @param {object} options   - optional parser options
   */constructor(
        lang = {
          grammar_options,
          regexps,
          translations
        }, 
        options = {
          punctuation_strategy: "us"
        }
  ) {
     this.parser = new bcv_parser(lang, options);
//     this.parser = bcv_instance;
     this.parser.set_options(options);
    }

  // --- OK TRUE CHAINABLE PARSE ---
  parse(input) {
    // --- PRE-PROCESSING HOOK ---
    const normalized = this._preprocess(input);

    // --- DELEGATE TO ORIGINAL PARSER ---
    this.parser.parse(normalized);
    
//    this.parser.parse(input);
    return this; // critical for chaining
  }
  
  _preprocess(text) {
    // just convert hsub ! to osis whitespace
//    const arr = Array.isArray(input) ? input : [input];
//    const hsub =  arr.join(";").replaceAll('!',' ');
    const hsub = text.replaceAll('!',' ');
    return hsub;
  }

 // --- OPTIONAL: expose selected API methods ---
  osis() {
    return this.parser.osis();
  }
  
  // OK re-exposition of ...
  osis_and_translations() {
     return this.parser.osis_and_translations();
  }

  // OK NEW Method for this yields hsub ! formatting
  //
  hsub_refarray() {
  // PARSING: OSIS + TRANS
  const osis_translations = this.osis_and_translations();

  // REFACTOR input
  const output_hsub = osis_translations
    .map(([osis, translation]) => translation ? `${osis}!${translation}` : `${osis}` )

  return output_hsub 
  }
  
  // OK NEW Method for this yields hsub formatting
  osis_array() {
  // PARSING: OSIS + TRANS
  const osis_translations = this.osis_and_translations();

  // REFACTOR input
  const output_hsub = osis_translations
    .map(([osis, translation]) => translation ? `${osis}&nbsp;${translation}` : `${osis}` )

  return output_hsub 
  }

  // OK NEW Method for this yields hsub formatting
  osis_idempotent() {
  // PARSING: OSIS + TRANS
  const osis_translations = this.osis_and_translations();

  // REFACTOR input
  const output_hsub = osis_translations
    .map(([osis, translation]) => translation ? `(${osis}&nbsp;${translation})` : `(${osis})` )
 
  const json = output_hsub.join("; ");
  return json 
  }
}


////====================================================

// super_bcv_parser.js

export class super_bcv_parser_legacy {
  constructor({
    grammar_options = default_grammar_options,
    regexps = default_regexps,
    translations = default_translations
  } = {}) {

    this._bcv = new bcv_parser({
      grammar_options,
      regexps,
      translations
    });
  }

  parse(input) {
    return this._bcv.parse(input);
  }
  
  
  osis(input) {
    return this._bcv.parse(input).osis();
  }

  osis_and_translations(input) {
    return this._bcv.parse(input).osis_and_translations();
  }

  /**
   * Returns:
   *   ["John.3.16 KJV", "John.3.17 KJV", ...]
   * Safe for transform pipelines.
   */
  osis_array(input) {
    try {
      const arr = this._bcv.parse(input).osis_and_translations();
      return arr.map(([osis, translation]) => translation ? `${osis} ${translation}` : `${osis}` );
    } catch {
      return [];
    }
  }
  
  
}

