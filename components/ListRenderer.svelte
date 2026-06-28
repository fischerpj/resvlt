<!-- this line is needed to add your svelte component to quarto! -->
<svelte:options customElement={{
  tag: "my-list",
  props: {
    data: { type: "Array" }
  }
}} />

<!-- ==========================SCRIPT======================================= -->

<script>
  // here we declare `data` as a prop that this component can expect. it has
  // a default value in case we don't provide anything
  
  let { data = ["aa","bb"] } = $props();
  
</script>

<!-- ==========================UI=========================================== -->

<ul>
  {#each data as item}
    <li>{item}</li>
  {/each}
</ul>