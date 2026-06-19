/* =============================================================================
  * 2. LOGIC LAYER — parser + OSIS diff + URL builder + conditional fetch
* ========================================================================== */

// RefEngine2 takes bcv_parser as outside argument
export class RefEngine {
    #url_fetchable = null; // acts as interface value between parse and fetch

    constructor(
      parser, 
      baseUrl = "https://hmi.pjafischer.workers.dev/bgw/cache/"
    ) {
      this.baseUrl = baseUrl;
      this.#url_fetchable = `${this.baseUrl}?param=${encodeURIComponent("gen.1.1")}`;

      // Instantiate the external bcv_parser via composition as a property
      this._baseParser = parser;

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
  } // end of class

//=============================================================================
// EXECUTION

const mydoc = "now*****at this time*****henceforth*****now*****now, I know*****Exodus 18:11*****1 Kings 17:24*****Psalm 20:6*****whether in opposed to past time,*****Joshua 14:11*****Isaiah 1:21*****Isaiah 16:14*****Hosea 13:2*****or to future*****Numbers 24:17*****Numbers 22:38*****1 Kings 19:4*****Hosea 7:2*****Isaiah 9:7*****Isaiah 59:21*****Psalm 115:18;*****Psalm 121:8*****Psalm 131:3*****of the imminent or impending future:*****Exodus 6:1*****Numbers 11:23*****Isaiah 33:10*****Psalm 12:5]*****Isaiah 43:19*****Micah 7:4*****Micah 7:10*****Amos 6:7*****Jeremiah 14:10*****Isaiah 29:22b*****Hosea 10:3*****Hosea 10:3;*****present state = as things are:*****1 Samuel 8:5*****1 Samuel 9:6*****1 Samuel 27:1*****2 Kings 18:20*****Job 16:7*****Imperative, as an encouragement,*****implying that the time has come for the exhortation or advice to be followed,*****Genesis 31:13*****Exodus 18:19*****Deuteronomy 2:13*****Isaiah 30:8*****1 Kings 17:24*****therefore*****drawing a conclusion*****a practical one, from what has been stated:*****Genesis 27:8*****Genesis 31:16*****Isaiah 5:5;*****Psalm 39:7*****stating the ground on which some conclusion or action is to be based,*****Joshua 14:10*****Jeremiah 40:4*****1 Samuel 12:16*****Joel 2:12*****Job 16:19*****from now, henceforth*****Jeremiah 3:4*****Isaiah 48:6*****Daniel 10:17*****until now*****Deuteronomy 12:9*****for in this case,*****pointing to a condition assumed as a possible contingency:*****Haggai 1:2;"
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
Psalm 20:6
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
Daniel 10:17
*****
until now
*****
Deuteronomy 12:9
*****
for in this case,
*****
pointing to a condition assumed as a possible contingency:
*****
Haggai 1:2
*****
Rev4.2;`

// const monobloc = multilines.replaceAll("*****","");
//const monobloc2 = monobloc.replaceAll(/\r?\n/g," ")
export const monobloc = multilines.replaceAll("*****","");

//const supr = new RefEngine();
//console.log(supr)

// supr.parse() is always first operation
//supr.parse(monobloc2);
//console.log(supr.osis());
