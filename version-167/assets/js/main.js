function ready(callback) {
    if (document.readyState !== 'loading') {
        callback();
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
}

ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            document.body.classList.toggle('is-menu-open', open);
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            menuButton.textContent = open ? '×' : '☰';
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
        var index = 0;
        var activate = function (next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                activate(i);
            });
        });
        setInterval(function () {
            activate(index + 1);
        }, 5600);
    }

    initCardFilters();
    initSearchPage();
});

function initCardFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
        var input = panel.querySelector('[data-card-search]');
        var clearButton = panel.querySelector('[data-clear-filter]');
        var typeButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-type] button'));
        var yearButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-year-group] button'));
        var scope = panel.closest('main') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var empty = scope.querySelector('[data-no-results]');
        var state = {
            type: 'all',
            year: 'all',
            q: ''
        };
        var apply = function () {
            var shown = 0;
            cards.forEach(function (card) {
                var text = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.tags].join(' ').toLowerCase();
                var typeOk = state.type === 'all' || (card.dataset.type || '').indexOf(state.type) !== -1;
                var yearOk = state.year === 'all' || (card.dataset.year || '') === state.year;
                var queryOk = !state.q || text.indexOf(state.q) !== -1;
                var visible = typeOk && yearOk && queryOk;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.style.display = shown ? 'none' : 'block';
            }
        };
        if (input) {
            input.addEventListener('input', function () {
                state.q = input.value.trim().toLowerCase();
                apply();
            });
        }
        typeButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                typeButtons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                state.type = button.dataset.filterValue || 'all';
                apply();
            });
        });
        yearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                yearButtons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                state.year = button.dataset.filterYear || 'all';
                apply();
            });
        });
        if (clearButton) {
            clearButton.addEventListener('click', function () {
                state.type = 'all';
                state.year = 'all';
                state.q = '';
                if (input) {
                    input.value = '';
                }
                typeButtons.forEach(function (button) {
                    button.classList.toggle('is-active', (button.dataset.filterValue || 'all') === 'all');
                });
                yearButtons.forEach(function (button) {
                    button.classList.toggle('is-active', (button.dataset.filterYear || 'all') === 'all');
                });
                apply();
            });
        }
    });
}

function initSearchPage() {
    var form = document.querySelector('[data-site-search-form]');
    var input = document.querySelector('[data-site-search-input]');
    var target = document.querySelector('[data-search-results]');
    if (!form || !input || !target || !window.SITE_SEARCH_INDEX) {
        return;
    }
    var render = function () {
        var q = input.value.trim().toLowerCase();
        var source = window.SITE_SEARCH_INDEX;
        var list = source.filter(function (item) {
            if (!q) {
                return true;
            }
            return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.line].join(' ').toLowerCase().indexOf(q) !== -1;
        }).slice(0, 120);
        if (!list.length) {
            target.innerHTML = '<div class="no-results" style="display:block">没有找到匹配内容</div>';
            return;
        }
        target.innerHTML = list.map(function (item) {
            return '<article class="movie-card"><a class="poster-link" href="./' + item.file + '"><span class="poster-frame"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="poster-shade"></span><span class="poster-year">' + escapeHtml(item.year) + '</span></span></a><div class="card-body"><h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3><p class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</p><p class="card-line">' + escapeHtml(item.line) + '</p></div></article>';
        }).join('');
    };
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
    });
    input.addEventListener('input', render);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    input.value = q;
    render();
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;'
        }[char];
    });
}

function startVideoPlayer(videoId, maskId, sourceUrl) {
    var video = document.getElementById(videoId);
    var mask = document.getElementById(maskId);
    if (!video || !mask) {
        return;
    }
    var loaded = false;
    var play = function () {
        if (!loaded) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                loaded = true;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                loaded = true;
            } else {
                video.src = sourceUrl;
                loaded = true;
            }
        }
        mask.classList.add('is-hidden');
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {
                mask.classList.remove('is-hidden');
            });
        }
    };
    mask.addEventListener('click', play);
    video.addEventListener('click', function () {
        if (!loaded) {
            play();
        }
    });
}
