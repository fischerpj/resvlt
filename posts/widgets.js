// widgets.js

//=========================================================================

// widgets.js

export class InputGroup {
  constructor(html, { placeholder = "Type…", button = "Send" } = {}) {
    this.html = html;
    this.value = "";

    this.root = html`<div class="input-group"></div>`;
    this.input = html`<input class="form-control" placeholder="${placeholder}">`;
    this.btn   = html`<button class="btn btn-primary">${button}</button>`;

    this.root.append(this.input, this.btn);

    this.btn.addEventListener("click", () => {
      this.value = this.input.value;
      this.root.dispatchEvent(new CustomEvent("input"));
    });
  }

  get element() {
    return this.root;
  }
}

export class SuperParserFetcher {
  constructor(html) {
    this.html = html;
    this.content = null;

    this.root = html`<div class="border rounded p-3 mt-3"></div>`;
  }

  update(raw) {
    if (!raw) {
      this.root.innerHTML = "<em>No input provided.</em>";
      this.content = null;
    } else {
      this.root.innerHTML = `<strong>Received:</strong> ${raw}`;
      this.content = raw;
    }

    this.root.dispatchEvent(new CustomEvent("input"));
  }

  get element() {
    return this.root;
  }
}

