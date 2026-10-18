const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

const reveals = document.querySelectorAll("[data-reveal]");

function showReveals() {
  reveals.forEach((node) => node.classList.add("is-in"));
}

if (motion.matches) {
  showReveals();
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  reveals.forEach((node) => observer.observe(node));
  motion.addEventListener("change", () => {
    if (motion.matches) showReveals();
  });
}

const header = document.querySelector(".header");

function onScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const cloths = {
  matte: { name: "Матовый", rate: 750 },
  gloss: { name: "Глянцевый", rate: 850 },
  satin: { name: "Сатиновый", rate: 790 },
  shadow: { name: "Теневой", rate: 1100 },
};

const SPOT = 550;
const CONTOUR = 950;
const LEVEL = 600;

const lenInput = document.querySelector("#q-len");
const widInput = document.querySelector("#q-wid");
const areaOut = document.querySelector("#q-area");
const perOut = document.querySelector("#q-per");
const lightsOut = document.querySelector("#q-lights");
const linesOut = document.querySelector("#q-lines");
const totalOut = document.querySelector("#q-total");
const contourInput = document.querySelector("#q-contour");
const levelInput = document.querySelector("#q-level");
const comment = document.querySelector("textarea[name='comment']");

let lights = 4;
let lastSummary = "";

const money = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const meters = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function selectedCloth() {
  const picked = document.querySelector("input[name='cloth']:checked");
  return cloths[picked ? picked.value : "matte"];
}

function line(title, detail, sum) {
  const item = document.createElement("li");
  const label = document.createElement("span");
  label.textContent = title;
  const note = document.createElement("small");
  note.textContent = detail;
  label.append(note);
  const amount = document.createElement("b");
  amount.textContent = money.format(sum);
  item.append(label, amount);
  return item;
}

function renderQuote() {
  const length = clamp(lenInput.value, 1.2, 20, 4.5);
  const width = clamp(widInput.value, 1.2, 12, 3.4);
  const area = length * width;
  const perimeter = 2 * (length + width);
  const cloth = selectedCloth();
  const clothSum = area * cloth.rate;
  const levelSum = levelInput.checked ? area * LEVEL : 0;
  const spotSum = lights * SPOT;
  const contourSum = contourInput.checked ? perimeter * CONTOUR : 0;
  const total = clothSum + levelSum + spotSum + contourSum;

  areaOut.textContent = meters.format(area);
  perOut.textContent = meters.format(perimeter);
  lightsOut.textContent = String(lights);
  linesOut.replaceChildren(
    line(cloth.name, `${meters.format(area)} м² × ${cloth.rate} ₽`, clothSum)
  );
  if (levelSum) {
    linesOut.append(line("Второй уровень", `${meters.format(area)} м² × ${LEVEL} ₽`, levelSum));
  }
  if (spotSum) {
    linesOut.append(line("Светильники", `${lights} × ${SPOT} ₽`, spotSum));
  }
  if (contourSum) {
    linesOut.append(line("Световая линия", `${meters.format(perimeter)} м × ${CONTOUR} ₽`, contourSum));
  }
  totalOut.textContent = money.format(total);

  const extras = [
    levelInput.checked ? "второй уровень" : "",
    lights ? lightsPhrase(lights) : "без светильников",
    contourInput.checked ? "световая линия" : "без световой линии",
  ].filter(Boolean);

  lastSummary = `Смета с сайта: ${meters.format(length)} × ${meters.format(width)} м, ${cloth.name.toLowerCase()}, ${extras.join(", ")}. Ориентир ${money.format(total)}.`;
}

function lightsPhrase(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  let word = "светильников";
  if (mod10 === 1 && mod100 !== 11) word = "светильник";
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = "светильника";
  return `${count} ${word}`;
}

function bumpLights(step) {
  lights = Math.min(24, Math.max(0, lights + step));
  renderQuote();
}

const quoteForm = document.querySelector("#quote");
quoteForm.addEventListener("submit", (event) => event.preventDefault());
quoteForm.addEventListener("input", renderQuote);
document.querySelector("#q-minus").addEventListener("click", () => bumpLights(-1));
document.querySelector("#q-plus").addEventListener("click", () => bumpLights(1));
document.querySelector("#q-order").addEventListener("click", () => {
  renderQuote();
  if (!comment.value || comment.value.startsWith("Смета с сайта:")) {
    comment.value = lastSummary;
  }
  document.querySelector("#lead-open").checked = true;
});

renderQuote();
