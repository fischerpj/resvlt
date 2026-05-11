// ============================================================
// File: components/refclass.js
// (Pure logic — no Svelte imports, no DOM, no side effects)
// ============================================================

console.log("loading refclass.js ONLY ONCE but in each Svelte widget however")

export class RefAccumulator {
  constructor() {
    this.items = []
  }

  add(x) {
    this.items.push(x)
  }

  reset() {
    this.items = []
  }
  
  lastItem() {
    this.items.reverse()[0];
  }
}  

