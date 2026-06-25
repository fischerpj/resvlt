/* =============================================================================
  * 2. LOGIC LAYER — parser + OSIS diff + URL builder + conditional fetch
* ========================================================================== */
// RefEngine respects bcv_parser interfaces: parse, osis, osis_and_translations
// RefEngine takes bcv_parser as outside argument
export class RefEngine {
      // PRIVATE fields
    #url_fetchable = null;  // acts as interface value between parse and fetch
    #osis_array = [];       // stores osis & translation in array
    #hsub_array = [];       // stores hsub in array
    #defaultTranslation = "SG21";

    constructor(
      parser,
      baseUrl = "https://hmi.pjafischer.workers.dev/bgw/cache/"
    ) {
      this.baseUrl = baseUrl;
      this.#url_fetchable = `${this.baseUrl}?param=${encodeURIComponent("gen.1.1")}`;

      // Instantiate the external bcv_parser via composition as a property
      this._baseParser = parser;

      // Optional: auto-bind if you want to pass methods directly
      this.transform = this.transform.bind(this);    // parse and return inspector object
//      this.parse = this.parse.bind(this);    
      this.osis = this.osis.bind(this);    
      this.osis_and_translations = this.osis_and_translations.bind(this);
      
    } // end of constructor

    // helper equivalent to parse and osis return
    parse_osis(ref) {
      try {
        return this._baseParser.parse(ref).osis();
      } catch {
        return null;
      }
    }
    
    // simple strict reexposition of chainable parse at RefEngine level 
    parse(ref) {
        return this._baseParser.parse(ref);
    }
    
    /**
      * Overloadable osis method osisi returns a string
    * @returns {string} - The OSIS string representation
    */
    osis() {
        return this._baseParser.osis();
    }
    
    osis_and_translations() {
//      const cleaned = this._preprocess(input);
      return this._baseParser.osis_and_translations();
    } 
  
    buildUrl(osis) {
      return `${this.baseUrl}?param=${encodeURIComponent(osis)}`;
    }
    
    concatAll() {
    return this.#osis_array.map(([osisString, translation]) => {
      // Use default if translation is empty
      const tr = translation === "" ? this.#defaultTranslation : translation;

      const refs = osisString
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      return refs.map(ref => `${ref}!${tr}`);
    });
  }
    
    async transform(ref, previousOsis) {
      const osis = this.parse_osis(ref);   
    // Optional: auto-bind if you want to pass methods directly
//    this.parse_osis_array = this.parse_osis_array.bind(this);
//    this.parse_inspect = this.parse_inspect.bind(this);    // parse and return inspector object
//    this.osis_and_translations = this.osis_and_translations.bind(this);
      
      // PARSING FAILED = > → no URL, no fetch
      if (!osis) {
        return {
          osis: null,
          osis_array: null,
          hsub_array: null,
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
//        this.#osis_array = osis.split(","); // array split equivalent of valid osis string
        this.#osis_array = this.osis_and_translations();
        this.#hsub_array = this.concatAll();
        
        const res = await fetch(url_fetchable);
        response = await res.json();
        console.log(response);
      }
      
      return {
        osis,
        osis_array: this.#osis_array,
        hsub_array:this.#hsub_array,
        previousOsis,
        url_fetchable,
        response
      };
    }
  } // end of class

//=============================================================================
// EXECUTION

//export const monobloc = multilines.replaceAll("*****","");
//const monobloc2 = monobloc.replaceAll(/\r?\n/g," ")
