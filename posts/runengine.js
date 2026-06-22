// runengine.js runs the refengine.js in Node.js

//------------------------------------------------------------------------------
// IMPORT #1: bcv_parser as native
import { bcv_parser } from "./bcv_parser.js"; // this is native bcv_parser

// IMPORT#2: default language tables directly here
import { grammar_options, regexps, translations } from "./lang/en.js"

//------------------------------------------------------------------------------
// or passed further to SUPER RefEngine2
// IMPORT#3: RefENgine is a SuperBCVParser
import { RefEngine, monobloc } from "./refengine.js";
console.log(monobloc);
//=============================================================================
// EXECUTION

// bcv_parser native INSTANCE to with language to be used as such or passed further 
const bcv = new bcv_parser({grammar_options, regexps, translations})
console.log(bcv.parse("John 1.1 Rev4.2").osis());
//console.log(bcv.parse(monobloc).osis());
//console.log(bcv.osis_and_translations());
//console.log(bcv.parse(monobloc).parsed_entities());

const engine = new RefEngine(bcv);
  
//  console.log(engine.parse("John 1.1").osis());
//  console.log(engine.parse_osis(monobloc));
  console.log(engine.parse(monobloc).osis_and_translations());
