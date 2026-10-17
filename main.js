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
