(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function bindMobileMenu() {
    var button = document.getElementById('mobileMenuButton');
    var menu = document.getElementById('mobileMenu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function bindHeroCarousel() {
    var hero = document.querySelector('[data-hero-carousel]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
        dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function bindFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));
    areas.forEach(function (area) {
      var input = area.querySelector('[data-search-input]');
      var buttons = Array.prototype.slice.call(area.querySelectorAll('[data-filter-button]'));
      var cards = Array.prototype.slice.call(area.querySelectorAll('[data-search-card]'));
      var active = 'all';

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-filter-text') || card.textContent || '').toLowerCase();
          var kind = (card.getAttribute('data-kind') || '').toLowerCase();
          var region = (card.getAttribute('data-region') || '').toLowerCase();
          var year = (card.getAttribute('data-year') || '').toLowerCase();
          var passText = !query || text.indexOf(query) !== -1;
          var passFilter = active === 'all' || kind.indexOf(active) !== -1 || region.indexOf(active) !== -1 || year.indexOf(active) !== -1 || text.indexOf(active) !== -1;
          card.classList.toggle('hidden-card', !(passText && passFilter));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          active = (button.getAttribute('data-filter-button') || 'all').toLowerCase();
          buttons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  window.initMoviePlayer = function (streamUrl, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) {
      return;
    }
    var attached = false;

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.hlsController = hls;
        return;
      }
      video.src = streamUrl;
    }

    function play() {
      attachStream();
      button.classList.add('is-hidden');
      button.setAttribute('aria-hidden', 'true');
      video.controls = true;
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          button.classList.remove('is-hidden');
          button.setAttribute('aria-hidden', 'false');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  };

  ready(function () {
    bindMobileMenu();
    bindHeroCarousel();
    bindFilters();
  });
}());
