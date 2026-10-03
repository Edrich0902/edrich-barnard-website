import { reduceMotion } from "./palette";
import { prepareDecode } from "./decode";

const h1 = document.querySelector<HTMLElement>("[data-decode]");
if (h1 && !reduceMotion) prepareDecode(h1, { delay: 280 }).start();
