// ui.js — a tiny DOM factory for an input + 3 buttons in a row

export function inputWithButtons({ 
  placeholder = "",
  buttons = []
} = {}) {
  
  // Parent container
  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = "0.5rem";
  row.style.alignItems = "center";
  
  // Input
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = placeholder;
  input.className = "form-control"; // optional Bootstrap class
  row.append(input);
  
  // Buttons
  for (const btnSpec of buttons) {
    const btn = document.createElement("button");
    btn.textContent = btnSpec.label;
    btn.className = btnSpec.className ?? "btn btn-secondary";
    btn.onclick = () => btnSpec.onClick?.(input.value);
    row.append(btn);
  }
  
  return row;
}
