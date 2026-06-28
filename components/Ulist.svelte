<!-- this line is needed to add your svelte component to quarto! -->
<svelte:options customElement={{ 
  tag: 'my-ulist', 
  props: {
    data: { type: "Array" }
  } 
}} />


<!-- ==========================SCRIPT======================================= -->
<script>

  // here we declare `data` as a prop that this component can expect. it has
  // a default value in case we don't provide anything
  
//  let { data = [5, 15, 10, 12, 14] } = $props();
  let { items = ["aaa","tutu"] } = $props();
  
</script>

<!-- ==========================UI=========================================== -->

<ul>
  {#each items as item}
    <li>{item}</li>
  {/each}
</ul>

<!-- ==========================STYLE======================================== -->

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

