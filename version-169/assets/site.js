(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-site-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var sliders = document.querySelectorAll('[data-hero-slider]');
  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function activate(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (timer || slides.length < 2) {
        return;
      }

      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
        stop();
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    activate(0);
    start();
  });

  var categorySearch = document.querySelector('[data-category-search]');
  var categoryTabs = Array.prototype.slice.call(document.querySelectorAll('[data-category-tab]'));
  var categoryGroups = Array.prototype.slice.call(document.querySelectorAll('[data-category-group]'));

  function filterCategories() {
    var query = categorySearch ? categorySearch.value.trim().toLowerCase() : '';
    var activeTab = 'all';

    categoryTabs.forEach(function (tab) {
      if (tab.classList.contains('is-active')) {
        activeTab = tab.getAttribute('data-category-tab') || 'all';
      }
    });

    categoryGroups.forEach(function (group) {
      var groupType = group.getAttribute('data-category-group');
      var showGroup = activeTab === 'all' || activeTab === groupType;
      group.classList.toggle('hidden', !showGroup);

      Array.prototype.slice.call(group.querySelectorAll('[data-category-name]')).forEach(function (item) {
        var text = (item.getAttribute('data-category-name') || '').toLowerCase();
        item.classList.toggle('hidden', Boolean(query) && text.indexOf(query) === -1);
      });
    });
  }

  if (categorySearch) {
    categorySearch.addEventListener('input', filterCategories);
  }

  categoryTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      categoryTabs.forEach(function (item) {
        item.classList.remove('is-active');
      });
      tab.classList.add('is-active');
      filterCategories();
    });
  });

  filterCategories();
})();
