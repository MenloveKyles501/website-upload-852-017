
(function () {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function initHeroCarousel() {
    const root = qs('[data-hero-carousel]');
    if (!root) return;

    const slides = qsa('[data-hero-slide]', root);
    const dots = qsa('[data-hero-dot]', root);
    const prev = qs('[data-hero-prev]', root);
    const next = qs('[data-hero-next]', root);
    let index = 0;
    let timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, idx) => {
        slide.classList.toggle('is-active', idx === index);
      });
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(() => show(index + 1), 6000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) prev.addEventListener('click', () => { show(index - 1); start(); });
    if (next) next.addEventListener('click', () => { show(index + 1); start(); });
    dots.forEach((dot, idx) => dot.addEventListener('click', () => { show(idx); start(); }));

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function normalizeText(s) {
    return (s || '').toLowerCase().trim();
  }

  function initFilters() {
    const root = qs('[data-filter-root]');
    if (!root) return;

    const input = qs('[data-filter-search]', root);
    const typeSelect = qs('[data-filter-type]', root);
    const regionSelect = qs('[data-filter-region]', root);
    const yearSelect = qs('[data-filter-year]', root);
    const cards = qsa('#catalog [data-card]', root);
    const visibleCount = qs('[data-visible-count]', root);
    const totalCount = qs('[data-total-count]', root);
    const chips = qsa('[data-filter-chip]', root);

    if (totalCount) totalCount.textContent = cards.length.toString();

    function filter() {
      const q = normalizeText(input ? input.value : '');
      const type = typeSelect ? typeSelect.value : '';
      const region = regionSelect ? regionSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';

      let shown = 0;
      cards.forEach((card) => {
        const haystack = normalizeText(card.dataset.search || '');
        const okQ = !q || haystack.includes(q);
        const okType = !type || card.dataset.type === type;
        const okRegion = !region || card.dataset.region === region;
        const okYear = !year || card.dataset.year === year;
        const show = okQ && okType && okRegion && okYear;
        card.classList.toggle('hidden', !show);
        if (show) shown++;
      });

      if (visibleCount) visibleCount.textContent = shown.toString();
    }

    if (input) input.addEventListener('input', filter);
    if (typeSelect) typeSelect.addEventListener('change', filter);
    if (regionSelect) regionSelect.addEventListener('change', filter);
    if (yearSelect) yearSelect.addEventListener('change', filter);
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.filterChip;
        if (typeSelect) typeSelect.value = '';
        if (regionSelect) regionSelect.value = '';
        if (yearSelect) yearSelect.value = '';
        if (input) input.value = '';
        cards.forEach((card) => {
          const ok = key === 'all' || card.dataset.type === key || card.dataset.region === key || card.dataset.year === key;
          card.classList.toggle('hidden', !ok);
        });
        chips.forEach((c) => c.classList.toggle('active', c === chip));
        filter();
      });
    });

    filter();
  }

  function initPlayer() {
    const video = qs('video[data-player]');
    if (!video) return;

    const source = video.getAttribute('data-src') || '';
    const poster = video.getAttribute('poster') || '';

    function load() {
      if (!source) return;

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        window.__movieHls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }

      if (poster) {
        video.setAttribute('poster', poster);
      }
    }

    load();

    const playBtn = qs('[data-play-button]');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        video.play().catch(() => {});
        video.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeroCarousel();
    initFilters();
    initPlayer();
  });
})();
