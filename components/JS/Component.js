// Component.js — strict JS, no framework

export class Component {
  constructor({ target, props = {} } = {}) {
    this.target = target;
    this.props = props;
    this.state = {};
    this._listeners = {};
    
    this.beforeMount();
    this.root = this.render();
    this.afterMount();
    
    if (target) target.appendChild(this.root);
  }
  
  // --- Svelte-like lifecycle hooks ---
    beforeMount() {}
  afterMount() {}
  beforeUpdate() {}
  afterUpdate() {}
  beforeDestroy() {}
  
  // --- Svelte-like event dispatcher ---
    dispatch(name, detail) {
      (this._listeners[name] || []).forEach(fn => fn(detail));
    }
  
  on(name, fn) {
    this._listeners[name] = this._listeners[name] || [];
    this._listeners[name].push(fn);
  }
  
  // --- Svelte-like state update ---
    setState(patch) {
      this.beforeUpdate();
      Object.assign(this.state, patch);
      this.update();
      this.afterUpdate();
    }
  
  // --- To be implemented by subclasses ---
    render() { throw new Error("render() not implemented"); }
  update() {}
  destroy() {
    this.beforeDestroy();
    this.root.remove();
  }
}





