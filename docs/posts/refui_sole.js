/********************************************************************************************
* refui2.js has only bsInput
********************************************************************************************/

//==============================================================================
//==============================================================================

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
        helpLabel: "Help",
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
    
    // ---- Help button ----
      this.btnHelp = document.createElement("button");
      this.btnHelp.type = "button";
      this.btnHelp.className = `btn btn-warning`;
      this.btnHelp.textContent = this.options.helpLabel;

    this.root.appendChild(this.btnHelp);

    // -------------------------------------------------------------------------  
      
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
  