/* =============================================================================
  fetcher.js
  Fetcher takes very long in Docker / Node
  Patrallel from Copilot
  fetch_parallel from biblebooksandcodes
* ========================================================================== */
class Fetcher {
  constructor(
    param = "Gen.1.1",
    templateUrl = "https://hmi.pjafischer.workers.dev/bgw/cache/?param=Gen.1",
    timeout = 100
  ) {
    this.param = param;
    this.#templateUrl = templateUrl;
    this.#timeout = timeout;

    const u = new URL(this.#templateUrl);

    this.baseUrl = `${u.origin}${u.pathname}`;

    const qs = new URLSearchParams(u.search);
    qs.set("param", this.param);

    this.queryString = qs.toString();
    this.url = `${this.baseUrl}?${this.queryString}`;
  }

  // Private fields
  #templateUrl;
  #timeout;
  #response = null;
  #duration = null;

  // Public getters
  get response() {
    return this.#response;
  }

  get duration() {
    return this.#duration;
  }

  // -------------------------
  // SIMPLE FETCH (no abort)
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

  // -------------------------
  // FETCH WITH TIMEOUT + ABORT
  // -------------------------
  async fetch_abort(timeout = this.#timeout) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const t0 = performance.now();

    try {
      const res = await fetch(this.url, { signal: controller.signal });
      clearTimeout(timer);

      const t1 = performance.now();
      this.#duration = Math.round(t1 - t0);

      if (!res.ok) throw new Error(`HTTP ${res.status} for ${this.url}`);

      const json = await res.json();
      json.duration_client = this.#duration;
      this.#response = json;
    } catch (err) {
      clearTimeout(timer);

      const t1 = performance.now();
      this.#duration = Math.round(t1 - t0);

      this.#response = {
        url: this.url,
        error: err.name === "AbortError" ? "timeout" : err.message,
        duration_client: this.#duration
      };
    }

    return this; // chainable
  }
}

const f = new Fetcher();
//await f.fetch_mono();
await f.fetch_abort(30000);

console.log(f.response); // safely accessed via getter
console.log(f.duration); // safely accessed via getter

//==============================================================================

class Parallel {
  constructor(
    osisArray = ["Gen.1.1","Exo2.3"],
    baseUrlTemplate = "https://hmi.pjafischer.workers.dev/bgw/cache/?param="
  ) {
    this.osisArray = Array.isArray(osisArray) ? osisArray : [String(osisArray)];
    this.baseUrlTemplate = baseUrlTemplate;

    this.urls = this.osisArray.map(
      osis => `${this.baseUrlTemplate}${encodeURIComponent(osis)}`
    );
  }

  async fetchAll() {
    const tasks = this.urls.map(url =>
      fetch(url)
        .then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
          return res.json();
        })
        .catch(err => ({ url, error: err.message }))
    );

    return Promise.all(tasks);
  }
  
  async fetch_parallel() {
    // attempt to fetch the urls
    try {
      const responses = await Promise.all(
        this.urls.map(url => fetch(url).then(res => res.json()))
      );
      this.data = responses;
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  }
}
/**
const p = new Parallel();

//p.fetchAll().then(results => console.log(results));
p.fetch_parallel().then(results => console.log(results.data));
*/

class Parallel_Abort {
  constructor(
    osisArray = ["Gen.1.1"],
    baseUrlTemplate = "https://hmi.pjafischer.workers.dev/bgw/cache/?param="
  ) {
    this.osisArray = Array.isArray(osisArray) ? osisArray : [String(osisArray)];
    this.baseUrlTemplate = baseUrlTemplate;

    this.urls = this.osisArray.map(
      osis => `${this.baseUrlTemplate}${encodeURIComponent(osis)}`
    );

    this.controllers = this.urls.map(() => new AbortController());
    this.autoAbortDelay = 1000; // ms
  }

  abortAll() {
    this.controllers.forEach(ctrl => ctrl.abort());
  }

  abortOne(index) {
    if (this.controllers[index]) {
      this.controllers[index].abort();
    }
  }

  async fetchAll() {
    // Auto-abort timer
    const timer = setTimeout(() => this.abortAll(), this.autoAbortDelay);

    const tasks = this.urls.map((url, i) =>
      fetch(url, { signal: this.controllers[i].signal })
        .then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
          return res.json();
        })
        .catch(err => ({
          url,
          error: err.name === "AbortError" ? "aborted" : err.message
        }))
    );

    const results = await Promise.all(tasks);

    clearTimeout(timer); // prevent abort if everything finished in time
    return results;
  }
}

//==============================================================================
export class Ref {
  // takes an array of validated reference(s) as argument
  // Step 1: Define URLs-params as a property
  constructor(
    input = [ 'Hos14!SG21', 'Neh13!SG21','Rev22:4!KJV' ],
    edition_default="SG21") {
      this.inputs = Array.isArray(input) ? input : [input];
//      this.baseUrl = 'https://hsub.pjafischer.workers.dev/bgw/api/';
      this.urls = this.inputs.map(input => `${this.baseUrl}?param=${encodeURIComponent(input)}`);
      this.data = [];
//      this.outputDiv = document.getElementById('outputDiv');
//      this.outputContent = document.createElement('div');
      this.edition_default = edition_default;
    }

  // Step 2: Method to fetch and populate data
 async fetch_parallel() {
    // attempt to fetch the urls
    try {
      const responses = await Promise.all(
        this.urls.map(url => fetch(url).then(res => res.json()))
      );
      this.data = responses;
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  }
  
   // Step 3: Display method that ensures data is ready
   // Step 3: Display method that ensures data is ready
  displayData() {
//    const outputDiv = document.getElementById('outputDiv');
  
/*    
    if (!outputDiv) {
      console.error('No element with id="outputdiv" found.');
      return;
    }
*/

    // Clear previous content
    this.outputContent.innerHTML = '';
    this.outputContent.id = crypto.randomUUID();

    // Create UL
//    const div_wrapper = document.createElement('div');
    const ul = document.createElement('ul');

    // Create LI for each data item
    this.data.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${item.ref}</strong> ${item.content} <em>${item.version}</em>`; // or any other property
      ul.appendChild(li);
    });

    // Append UL to outputDiv
//    div_wrapper.appendChild( ul);
     this.outputContent.prepend(ul);
  } // end of Display
}

//==============================================================================
/**
    const mir = new Ref();
    await mir.fetch_parallel();   // Wait for data to be fetched
    await mir.data;
    console.log(mir.data)
//    await mir.displayData(); 
//    console.log(mir.outputContent);
*/

