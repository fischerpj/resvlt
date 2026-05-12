// Counter.js
import { Component } from "./Component.js";
import { injectStyles } from "./styles.js";

injectStyles("counter-css", `
             .counter {
               display: inline-flex;
               gap: .5rem;
               align-items: center;
               padding: .5rem;
               border: 1px solid #ccc;
               border-radius: .25rem;
             }
             .counter button {
               padding: .25rem .5rem;
             }
             `);

export class Counter extends Component {
  constructor(opts) {
    super(opts);
    this.state = { count: this.props.start || 0 };
  }
  
  render() {
    const div = document.createElement("div");
    div.className = "counter";
    
    this.btnDec = document.createElement("button");
    this.btnDec.textContent = "-";
    
    this.valueEl = document.createElement("span");
    this.valueEl.textContent = this.state.count;
    
    this.btnInc = document.createElement("button");
    this.btnInc.textContent = "+";
    
    this.btnDec.onclick = () => this.setState({ count: this.state.count - 1 });
    this.btnInc.onclick = () => this.setState({ count: this.state.count + 1 });
    
    div.append(this.btnDec, this.valueEl, this.btnInc);
    return div;
  }
  
  update() {
    this.valueEl.textContent = this.state.count;
    this.dispatch("change", this.state.count);
  }
}