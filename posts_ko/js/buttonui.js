// helloButton.js — a tiny DOM factory for a "Hello" button

export function helloButton(onClick) {
  const btn = document.createElement("button");
  btn.textContent = "Hello";
  btn.onclick = () => onClick?.();
  return btn;
}

// helloButton.js — a tiny DOM factory producing a viewof-compatible "Hello" button

export function viewofHello() {
  const btn = document.createElement("button");
  btn.textContent = "Hello_too";

  // The value exposed by `viewof`
  btn.value = "hello";

  // Notify Observable that the value changed
  btn.onclick = () => {
    btn.value = "hello_me";      // could be anything you want to expose
    btn.dispatchEvent(new Event("input", { bubbles: true }));
  };

  return btn;
}



