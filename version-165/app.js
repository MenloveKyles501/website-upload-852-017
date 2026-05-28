(function () {
  const menuBtn = document.querySelector('[data-menu-btn]');
  const navLinks = document.querySelector('[data-nav-links]');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  const searchInputs = document.querySelectorAll('[data-filter-input]');
  searchInputs.forEach((input) => {
    const scope = input.closest('[data-filter-scope]') || document;
    const cards = Array.from(scope.querySelectorAll('[data-filter-item]'));
    const counter = scope.querySelector('[data-filter-count]');
    const sync = () => {
      const value = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const hay = [
          card.dataset.title || '',
          card.dataset.tags || '',
          card.dataset.genre || '',
          card.dataset.region || '',
          card.dataset.year || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        const show = !value || hay.includes(value);
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
      });
      if (counter) counter.textContent = `${visible} 条结果`;
    };
    input.addEventListener('input', sync);
    sync();
  });

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  if (slides.length > 1) {
    let index = 0;
    let timer = null;
    const activate = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    };
    const start = () => {
      timer = window.setInterval(() => activate(index + 1), 5200);
    };
    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };
    activate(0);
    start();
    const hero = document.querySelector('[data-hero-carousel]');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      hero.addEventListener('focusin', stop);
      hero.addEventListener('focusout', start);
    }
    document.querySelectorAll('[data-hero-prev]').forEach((btn) => {
      btn.addEventListener('click', () => activate(index - 1));
    });
    document.querySelectorAll('[data-hero-next]').forEach((btn) => {
      btn.addEventListener('click', () => activate(index + 1));
    });
  }

  const yearBadge = document.querySelector('[data-year-now]');
  if (yearBadge) {
    yearBadge.textContent = new Date().getFullYear();
  }
})();
