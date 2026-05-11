<!-- this line is needed to add your svelte component to quarto! -->
<svelte:options customElement={{ 
  tag: 'my-osisparserui', 
  shadow: 'none',
  props: {
    data: { type: "Array" }
  } 
}} />

<script>

//--------------------------------------------------------- windows.STORE ------
  import { RefAccu, addValue, resetRefAccu, setValue } from './refstore.js'
  
// ---------------------------------------------------------------- PARSING ---- 
  import { ParserRef } from "./ParserRef.js";

  import { bcv_parser } from "bible-passage-reference-parser/esm/bcv_parser.js";
  import * as lang from "bible-passage-reference-parser/esm/lang/fr.js";
  
  // Configure parsing strategies to prevent skipping
  const options = {
          punctuation_strategy: "us",
          "consecutive_combination_strategy": "separate",
          "sequence_combination_strategy": "combine",
        }
        
  // Initialize the parser externally to my class
  const bcv = new bcv_parser(lang);
  const parser = new ParserRef(bcv, options)

// ----------------------------------------------------------- VARIABLES -------

  let inputValue =  "Gal 1:16!SG21 ge1:5 (2tim1:1!KJV) rom5:8 Ap4:2";
  let osisArrayString = "";
  let hsubArrayString = "";
  let wrapResult = "";
  let n = 0

// ---------------------------------------------------  REACTIVE TRANSFORMS ----

  /**  3. Reactive Statement
   * This re-runs automatically whenever 'userInput' changes.
  */
  $: {
    osisArrayString = JSON.stringify(parser.parse(inputValue).osis_array(),null,0);
    hsubArrayString = JSON.stringify(parser.parse(inputValue).hsub_refarray(),null,0);
    wrapResult = parser.parse(inputValue).osis_idempotent();
    }
   
//   $: {
//    setValue(wrapResult);
//   }

// --------------------------------------------------------------- FUNCTONS ----

  // Copy to clipboard logic (CLIP)
  async function handleClip() {
    if (inputValue) {
      try {
        await navigator.clipboard.writeText(wrapResult);
        console.log("Copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    }
  }

  // Reset function (RAZ)
  function handleRaz() {
    inputValue = "";
  }
  
</script>

<!-- ----------------------------------------------------------------------- -->
<!-- --------------------------------------------------------------- UI ---- -->

<!-- ---------------------------------------------------------- UI_toolbar ------>

<div class="btn-toolbar ms-1 m-2" role="toolbar" aria-label="Toolbar with button groups">
  
  <div class="input-group input-group-sm flex-grow-1 me-1">
    <span class="input-group-text" id="btnGroupAddon">
      <i class="bi bi-search"></i>
    </span>
    <input 
      type="text" 
      class="form-control"
      style="flex-basis:40%; max-width:50%;"
      placeholder="UI.toolbar Search..." 
      aria-label="Input group example" 
      aria-describedby="btnGroupAddon"
      bind:value={inputValue}
    >
    <button type="button" 
            class="btn btn-sm btn-primary rounded flex-grow-1"
            on:click={() => addValue(wrapResult)}> 
            ADD
            </button>
    <button type="button" 
            class="btn btn-sm btn-success rounded flex-grow-1" 
            on:click={handleClip}
            disabled={!inputValue}>
            CLIP
            </button>
    <button type="button" 
            class="btn btn-sm btn-danger rounded flex-grow-1" 
            on:click={handleRaz}>
            RAZ
            </button>
    <button type="button" 
            class="btn btn-sm btn-info flex-grow-1 d-none d-sm-block"
            on:click={() => handleAction('HELP')}>
            HELP</button>
    
  </div>
</div>

<!-- ------------------------------------------------ end of BUTTONS_mobile --->



<!-- ----------------------------------------------------- OUTPUT AREA  ---- -->

<!-- ----------------------------------------------------- Input  ---- -->

  {#if inputValue}
    <div class="d-flex w-100 px-1">
      <div class="w-100 p-3 border rounded bg-white shadow-sm">
        <div><strong class="text-muted small text-uppercase me-2">OSIS:</strong>
          {@html wrapResult}</div>
        <div><strong class="text-muted small text-uppercase me-2">hsub:</strong>
          {@html hsubArrayString}</div>
<!-- this is refUI portion         --> 
        <div><strong class="text-muted small text-uppercase me-2">store:</strong>
          {@html JSON.stringify($RefAccu.items)}</div>
      </div>
    </div>
  {/if}

<!-- ----------------------------------------------------- Viewer  ---- -->

<div class="RefAccu-widget">
<!--  <input type="number" bind:value={n} />
//  <button on:click={() => addValue(+n)}>
//    Add
//  </button>
-->

  <button on:click={resetRefAccu}>
    Reset
  </button>

  <ul>
    {#each $RefAccu.items as item}
      <li>{item}</li>
    {/each}
  </ul>
</div>

<!-- --------------------------------------------------------- STYLING  ---- -->

<style>
  .container {
    font-family: sans-serif;
    max-width: 400px;
    margin: 2rem auto;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  input {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  hr {
    margin: 1.5rem 0;
    border: 0;
    border-top: 1px solid #eee;
  }

  .output {
    margin-bottom: 0.75rem;
  }

  .long-string {
    overflow-wrap : break-word;
  }

  code {
    background: #f4f4f4;
    padding: 2px 6px;
    border-radius: 4px;
    color: #d11010;
  }

  .error {
    color: #999;
    font-style: italic;
  }
</style>

