<!-- this line is needed to add your svelte component to quarto! -->
<svelte:options customElement={{ 
  tag: 'my-bcvreader', 
  shadow: 'none',
  props: {
    data: { type: "Array" }
  } 
}} />

<script>
// ---------------------------------------------------------------- PARSING ---- 
  import { ParserRef } from "ParserRef.js";
  import { bcv_parser } from "bible-passage-reference-parser/esm/bcv_parser.js";
  import * as lang from "bible-passage-reference-parser/esm/lang/en.js";
  
  // 1. Initialize the parser
  const bcv = new bcv_parser(lang);
  // pass it into proprietary ParserRef
  const parser = new ParserRef(bcv);    
  
  
  // 2. Configure strategies to prevent skipping
  bcv.set_options({
    "consecutive_combination_strategy": "combine",
    "sequence_combination_strategy": "combine",
  });

  let userInput = "Gal 1:16";
  let responseText = "";
  let loading = false;
  let timer;

  // The fetch function
  async function getPassage(query) {
    if (!query) return;
    loading = true;
    
    const url = `https://hmi.pjafischer.workers.dev/bgw/cache/?param=${encodeURIComponent(query)}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      // Adjust 'data.text' based on your actual Worker JSON structure
      responseText = data.content || JSON.stringify(data);
      responseText = responseText.replace(/\n\n\n\n/g, "\n\n");
    } catch (err) {
      responseText = "Error fetching data.";
    } finally {
      loading = false;
    }
  }
  
  /** 
  * 3. Reactive Statement
  * This re-runs automatically whenever 'userInput' changes.
  */
  $: osisResult = parser.parse(userInput).osis_idempotent();

  /* REACTIVE LOGIC: 
    Whenever 'userInput' changes, clear the old timer and start a new one.
    This "debounces" the input so it only fetches 500ms after you STOP typing.
  */
  $: {
    clearTimeout(timer);
    timer = setTimeout(() => {
      getPassage(osisResult);
    }, 100);
  }
</script>

<div class="app">
  <input 
    bind:value={userInput} 
    placeholder="Enter reference (e.g. Gal 1:16)" 
  />

  {#if loading}
    <p>Loading...</p>
  {:else}
    <div class="results">
      <strong>Response:</strong>
        {#if osisResult.length}
          <code>{osisResult}</code>
          <pre>{responseText}</pre>
        {:else}
          <span class="error">invalid reference</span>
        {/if}
    </div>
  {/if}
</div>

<style>
  .app {
    font-family: sans-serif;
    padding: 20px;
    max-width: 500px;
  }
  input {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 1.1rem;
  }
  .results {
    background: #f4f4f4;
    padding: 15px;
    border-radius: 5px;
  }
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>

