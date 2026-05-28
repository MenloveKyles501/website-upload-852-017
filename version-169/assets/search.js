(function () {
  var movies = window.MOVIES || [];
  var input = document.querySelector('[data-search-input]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var genreSelect = document.querySelector('[data-filter-genre]');
  var result = document.querySelector('[data-search-results]');
  var summary = document.querySelector('[data-search-summary]');
  var hotButtons = Array.prototype.slice.call(document.querySelectorAll('[data-hot-query]'));

  function uniqueValues(getter) {
    var seen = Object.create(null);
    var values = [];

    movies.forEach(function (movie) {
      var value = getter(movie);
      if (Array.isArray(value)) {
        value.forEach(addValue);
      } else {
        addValue(value);
      }
    });

    function addValue(value) {
      if (!value || seen[value]) {
        return;
      }

      seen[value] = true;
      values.push(value);
    }

    return values.sort(function (a, b) {
      return String(a).localeCompare(String(b), 'zh-Hans-CN');
    });
  }

  function fillSelect(select, values, label) {
    if (!select) {
      return;
    }

    select.innerHTML = '<option value="">' + label + '</option>' + values.map(function (value) {
      return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    return '' +
      '<article class="movie-card">' +
        '<a href="' + escapeHtml(movie.detail) + '" class="movie-card__link">' +
          '<figure class="movie-card__thumb">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="badge badge--left">' + escapeHtml(movie.region) + '</span>' +
            '<span class="badge badge--right">' + escapeHtml(movie.year) + '</span>' +
            '<span class="play-float" aria-hidden="true">▶</span>' +
          '</figure>' +
          '<div class="movie-card__body">' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
            '<div class="movie-card__meta">' +
              '<span>' + escapeHtml(movie.type) + '</span>' +
              '<span>' + escapeHtml(movie.genre) + '</span>' +
              '<strong>' + escapeHtml(movie.score) + '</strong>' +
            '</div>' +
          '</div>' +
        '</a>' +
      '</article>';
  }

  function matches(movie) {
    var query = input ? input.value.trim().toLowerCase() : '';
    var region = regionSelect ? regionSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var genre = genreSelect ? genreSelect.value : '';

    if (region && movie.region !== region) {
      return false;
    }

    if (type && movie.type !== type) {
      return false;
    }

    if (year && movie.year !== year) {
      return false;
    }

    if (genre && movie.genreTokens.indexOf(genre) === -1) {
      return false;
    }

    if (!query) {
      return true;
    }

    var haystack = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.oneLine,
      movie.summary,
      (movie.tags || []).join(' ')
    ].join(' ').toLowerCase();

    return haystack.indexOf(query) !== -1;
  }

  function render() {
    var filtered = movies.filter(matches);
    var display = filtered.slice(0, 120);

    if (summary) {
      summary.textContent = '找到 ' + filtered.length + ' 部内容' + (filtered.length > display.length ? '，已显示前 ' + display.length + ' 部' : '');
    }

    if (!result) {
      return;
    }

    if (!display.length) {
      result.innerHTML = '<div class="empty-state">没有找到匹配内容，请更换关键词或筛选条件。</div>';
      return;
    }

    result.innerHTML = display.map(card).join('');
  }

  fillSelect(regionSelect, uniqueValues(function (movie) { return movie.region; }), '全部地区');
  fillSelect(typeSelect, uniqueValues(function (movie) { return movie.type; }), '全部类型');
  fillSelect(yearSelect, uniqueValues(function (movie) { return movie.year; }).reverse(), '全部年份');
  fillSelect(genreSelect, uniqueValues(function (movie) { return movie.genreTokens; }), '全部题材');

  [input, regionSelect, typeSelect, yearSelect, genreSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    }
  });

  hotButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (input) {
        input.value = button.getAttribute('data-hot-query') || '';
      }
      render();
    });
  });

  render();
})();
