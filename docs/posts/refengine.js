/* =============================================================================
  * 2. LOGIC LAYER — parser + OSIS diff + URL builder + conditional fetch
* ========================================================================== */
// RefEngine respects bcv_parser interfaces: parse, osis, osis_and_translations
// RefEngine takes bcv_parser as outside argument
// TODO : try fetch_mono fetch_abort fetch_parallel define interface methods and properties
export class RefEngine {
      // PRIVATE fields
    #url_fetchable = null;  // acts as interface value between parse and fetch
    #osis_array = [];       // stores osis & translation in array
    #hsub_array = [];       // stores hsub in array
    #hsub = [];             // stores hsub in array
    #defaultTranslation = "SG21";
    #duration = 0;
    #response = null;
    
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
//      this.osis_and_translations = this.osis_and_translations.bind(this);
      
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
    
    buildUrls() {
      const urls = this.#hsub.map((hsub) => this.buildUrl(hsub));
      return urls
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
  
    concat() {
    return this.#osis_array.map(([osisString, translation]) => {
      // Use default if translation is empty
      const tr = translation === "" ? this.#defaultTranslation : translation;

      return  `${osisString}!${tr}`;
    });
  }
  
  hsub(){
    return this.#hsub_array.at(-1).join(",");
  }
  
  // USE this for parallel and adjust interface
  async fetchAll(myurls) {
    const tasks = myurls.map(url =>
      fetch(url)
        .then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
          return res.json();
        })
        .catch(err => ({ url, error: err.message }))
    );

    return Promise.all(tasks);
  }
  
    // -------------------------
  // SIMPLE FETCH (no abort) ADAPT IT
  // -------------------------
  async fetch_mono() {
    const t0 = performance.now();

    try {
      const res = await fetch(this.url);
      const t1 = performance.now();
      this.#duration = Math.round(t1 - t0);

      if (!res.ok) throw new Error(`HTTP ${res.status} for ${this.url}`);

      const json = await res.json();
      json.duration_client = this.#duration;
      this.#response = json;
    } catch (err) {
      this.#response = {
        url: this.url,
        error: err.message,
        duration_client: this.#duration
      };
    }

    return this; // chainable
  }
  
    async transform(ref, previousOsis) {
//      const osis = this.parse_osis(ref);   
//      const osis =  this.parse(ref).osis();   
      this.parse(ref); // start always with .parse
      this.#osis_array = this._baseParser.osis_and_translations();
      this.#hsub_array = this.concatAll();
      this.#hsub = this.concat();
      const osis =  this.#hsub.at(-1); 
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
          husb: null,
          previousOsis,
          url_fetchable: null,
          response: null
        };
      }
      
      // Only build URL when OSIS changed
      const url_fetchable = (osis !== previousOsis)
//      ? this.buildUrl(osis)
      ? this.buildUrls()
      : null;
      
      // Only fetch when OSIS changed
      
      let response = null;
      if (url_fetchable) {
        console.log(url_fetchable);
//        this.#osis_array = osis.split(","); // array split equivalent of valid osis string
////        this.#osis_array = this._baseParser.osis_and_translations();
////        this.#hsub_array = this.concatAll();
////        this.#hsub = this.concat();
        
        // FETCH sequence
        const t0 = performance.now();
// mono fetch        const res = await fetch(url_fetchable.at(-1));
        response = await this.fetchAll(url_fetchable);
        const t1 = performance.now();
        this.#duration = Math.round(t1 - t0);
      // postprocessing repsonse.content
      response = response.map((item) => ({...item,
        content_array: item.content.split(/\n{4}/).map(s=>s.trim())
      }));
      //        response = await res.json();
        response.duration_client = this.#duration;

        console.log(response);
      }
      
      return {
        osis,
        osis_array: this.#osis_array,
        hsub_array: this.#hsub_array,
        hsub: this.#hsub,
        previousOsis,
        url_fetchable,
        response
      };
    }
  } // end of class

//=============================================================================
// EXECUTION

const multilines = `H6258 - Strong's Hebrew Lexicon (KJV)
now
*****
at this time
*****
henceforth
*****
now
*****
now, I know
*****
Exodus 18:11
*****
Kings 17:24
*****
Psalm 20:6 KJV
*****
whether in opposed to past time,
*****
Joshua 14:11
*****
Isaiah 1:21
*****
Isaiah 16:14
*****
Hosea 13:2
*****
or to future
*****
Numbers 24:17
*****
Numbers 22:38
*****
1 Kings 19:4
*****
Hosea 7:2
*****
Isaiah 9:7
*****
Isaiah 59:21
*****
Psalm 115:18;
*****
Psalm 121:8
*****
Psalm 131:3
*****
of the imminent or impending future:
*****
Exodus 6:1
*****
Numbers 11:23
*****
Isaiah 33:10
*****
Psalm 12:5]
*****
Isaiah 43:19
*****
Micah 7:4
*****
Micah 7:10
*****
Amos 6:7
*****
Jeremiah 14:10
*****
Isaiah 29:22b
*****
Hosea 10:3
*****
Hosea 10:3;
*****
present state = as things are:
*****
1 Samuel 8:5
*****
1 Samuel 9:6
*****
1 Samuel 27:1
*****
2 Kings 18:20
*****
Job 16:7
*****
Imperative, as an encouragement,
*****
implying that the time has come for the exhortation or advice to be followed,
*****
Genesis 31:13
*****
Exodus 18:19
*****
Deuteronomy 2:13
*****
Isaiah 30:8
*****
1 Kings 17:24
*****
therefore
*****
drawing a conclusion
*****
a practical one, from what has been stated:
*****
Genesis 27:8
*****
Genesis 31:16
*****
Isaiah 5:5;
*****
Psalm 39:7
*****
stating the ground on which some conclusion or action is to be based,
*****
Joshua 14:10
*****
Jeremiah 40:4
*****
1 Samuel 12:16
*****
Joel 2:12
*****
Job 16:19
*****
from now, henceforth
*****
Jeremiah 3:4
*****
Isaiah 48:6
*****
Daniel 10:17 NIV
*****
until now
*****
Deuteronomy 12:9
*****
for in this case,
*****
pointing to a condition assumed as a possible contingency:
*****
Haggai 1:2;`

const monobloc2 = multilines.replaceAll("*****","");

export const monobloc = multilines.replaceAll("*****","");

//console.log(monobloc2);
//console.log(monobloc);