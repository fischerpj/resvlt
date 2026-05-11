// ============================================================
//  -------  File: components/ParserRef.js
// (Pure logic — no Svelte imports, no DOM, no side effects)
// NewRef Class and Methods can be imported in quarto ojs
// DESIGN: Create Parser Instance Externally Then Pass it to my Class
// ============================================================

//------------------------------------------------------------------------------
// CLASS DEFINITON
// ParserRef extends bcv_parser nevertheless sticks to the .parse.osis aan parse.hsub paradigm

import { bcv_parser } from "bible-passage-reference-parser/esm/bcv_parser.js";
import * as lang from "bible-passage-reference-parser/esm/lang/fr.js";

export class ParserRef {
  // CONSTRUCTOR
  /**
   * @param {object} lang - language configuration module
   * @param {object} options   - optional parser options
   */constructor(
        bcv_instance,
//        lang, 
        options = {
          punctuation_strategy: "us"
        }
  ) {
//    this.parser = new bcv_parser(lang, options);
     this.parser = bcv_instance;
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

//------------------------------------------------------------------------------
// EXECUTE

// punctuation_strategy = US for whitespace
//.osis
// osis_and_translations();

/**
// create bcv_parser instance outside
const bcv = new bcv_parser(lang);              // uses French by default
// pass it into proprietary ParserRef
const parser = new ParserRef(bcv);              // uses French by default

// simulate some input text
let myref = "hello Galates 1:16!SG21";
myref = "(Galates 1:16),(Hos14!LSG); rom5:8!SG21; Psaume 51:2!ESV, Ap 4:1 KJV";

// Array osis_and_translations
console.log(parser.parse(myref).osis_and_translations());      // example call
console.log(parser.parse(myref).osis_array());      // example call
// ARRAY hsub_refarray
console.log(parser.parse(myref).hsub_refarray());      // example call
console.log(parser.parse(myref).osis_idempotent());      // example call
*/

/**
const myosis = 'Gal.1.16,Gal.2.4 NIV; Hos.14 LSG; Rom.5.8 SG21; Ps.51.2 ESV; Rev.4.1,Rev.22.4 KJV';
console.log(myref)     // example call

//console.log(bcv.parse(myref).osis());      // lacks value of translation info
//console.log(bcv.parse(myosis).osis_string());      // example call
console.log(bcv.parse(myref).osis_array());      // example call
//console.log(bcv.parse(myref).hsub_refarray());      // example call
//console.log(bcv.parse(myref).osis_and_translations());      // example call

*/