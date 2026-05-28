import { H as Hls } from "./hls-dru42stk.js";

const select = (selector, scope = document) => scope.querySelector(selector);
const selectAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function initMobileMenu() {
  const button = select("[data-mobile-menu-button]");
  const nav = select("[data-mobile-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function initHero() {
  const root = select("[data-hero]");
  if (!root) {
    return;
  }
  const slides = selectAll("[data-hero-slide]", root);
  const dots = selectAll("[data-hero-dot]", root);
  const prev = select("[data-hero-prev]", root);
  const next = select("[data-hero-next]", root);
  if (!slides.length) {
    return;
  }
  let active = 0;
  let timer = null;

  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, itemIndex) => {
      slide.classList.toggle("active", itemIndex === active);
    });
    dots.forEach((dot, itemIndex) => {
      dot.classList.toggle("active", itemIndex === active);
    });
  };

  const start = () => {
    timer = window.setInterval(() => show(active + 1), 5200);
  };

  const reset = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    start();
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index);
      reset();
    });
  });

  if (prev) {
    prev.addEventListener("click", () => {
      show(active - 1);
      reset();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      show(active + 1);
      reset();
    });
  }

  show(0);
  start();
}

function normalise(value) {
  return String(value || "").trim().toLowerCase();
}

function applyFilters(container) {
  const input = select("[data-library-filter-input]");
  const typeFilter = select("[data-type-filter]");
  const sortSelect = select("[data-sort-select]");
  const cards = selectAll(".library-card", container);

  const update = () => {
    const keyword = normalise(input ? input.value : "");
    const typeValue = normalise(typeFilter ? typeFilter.value : "");
    cards.forEach((card) => {
      const search = normalise(card.dataset.search);
      const type = normalise(card.dataset.type);
      const matchKeyword = !keyword || search.includes(keyword);
      const matchType = !typeValue || type.includes(typeValue);
      card.classList.toggle("hidden-by-filter", !(matchKeyword && matchType));
    });
  };

  const sortCards = () => {
    if (!sortSelect) {
      return;
    }
    const value = sortSelect.value;
    const sorted = [...cards].sort((a, b) => {
      if (value === "year") {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      }
      if (value === "title") {
        return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
      }
      return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
    });
    sorted.forEach((card) => container.appendChild(card));
  };

  if (input) {
    input.addEventListener("input", update);
  }
  if (typeFilter) {
    typeFilter.addEventListener("change", update);
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      sortCards();
      update();
    });
  }

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  const pageSearchInput = select("[data-search-page-input]");
  if (pageSearchInput) {
    pageSearchInput.value = query;
  }
  if (input && query && !input.value) {
    input.value = query;
  }
  sortCards();
  update();
}

function initFilters() {
  const containers = selectAll("[data-library-container]");
  containers.forEach((container) => applyFilters(container));
}

function initPlayer() {
  const video = select("[data-player-url]");
  if (!video) {
    return;
  }
  const url = video.dataset.playerUrl;
  const overlay = select("[data-play-overlay]");
  let hls = null;

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
  } else if (Hls && Hls.isSupported()) {
    hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(url);
    hls.attachMedia(video);
  } else {
    video.src = url;
  }

  const begin = () => {
    if (overlay) {
      overlay.classList.add("hidden");
    }
    const result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {
        if (overlay) {
          overlay.classList.remove("hidden");
        }
      });
    }
  };

  if (overlay) {
    overlay.addEventListener("click", begin);
  }

  video.addEventListener("play", () => {
    if (overlay) {
      overlay.classList.add("hidden");
    }
  });

  video.addEventListener("pause", () => {
    if (video.currentTime === 0 && overlay) {
      overlay.classList.remove("hidden");
    }
  });

  window.addEventListener("beforeunload", () => {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initHero();
  initFilters();
  initPlayer();
});
