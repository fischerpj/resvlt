// demo.js
import { Counter } from "./Counter.js";

const app = document.getElementById("app");

const counter = new Counter({
  target: app,
  props: { start: 10 }
});

counter.on("change", value => {
  console.log("Counter changed:", value);
});