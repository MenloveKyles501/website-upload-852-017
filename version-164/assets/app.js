(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart(next) {
            window.clearInterval(timer);
            show(next);
            start();
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                restart(i);
            });
        });
        hero.addEventListener('mouseenter', function () {
            window.clearInterval(timer);
        });
        hero.addEventListener('mouseleave', start);
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-tags') || '',
            card.textContent || ''
        ].join(' ').toLowerCase();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var input = panel.querySelector('[data-filter-input]');
            var year = panel.querySelector('[data-year-filter]');
            var region = panel.querySelector('[data-region-filter]');
            var type = panel.querySelector('[data-type-filter]');
            var reset = panel.querySelector('[data-filter-reset]');
            var grid = document.querySelector('[data-filter-grid]');
            var empty = document.querySelector('[data-empty-state]');
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
            var params = new URLSearchParams(window.location.search);
            if (input && params.get('q')) {
                input.value = params.get('q');
            }
            function apply() {
                var q = input ? input.value.trim().toLowerCase() : '';
                var y = year ? year.value : '';
                var r = region ? region.value : '';
                var t = type ? type.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = true;
                    if (q && textOf(card).indexOf(q) === -1) {
                        ok = false;
                    }
                    if (y && card.getAttribute('data-year') !== y) {
                        ok = false;
                    }
                    if (r && card.getAttribute('data-region') !== r) {
                        ok = false;
                    }
                    if (t && card.getAttribute('data-type') !== t) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            [input, year, region, type].forEach(function (el) {
                if (el) {
                    el.addEventListener('input', apply);
                    el.addEventListener('change', apply);
                }
            });
            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    if (region) {
                        region.value = '';
                    }
                    if (type) {
                        type.value = '';
                    }
                    apply();
                });
            }
            apply();
        });
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video[data-src]');
            var button = shell.querySelector('[data-player-button]');
            if (!video || !button) {
                return;
            }
            var src = video.getAttribute('data-src');
            var loaded = false;
            var hlsInstance = null;
            function loadVideo() {
                if (loaded || !src) {
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = src;
                }
            }
            function playVideo() {
                loadVideo();
                shell.classList.add('is-playing');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            }
            button.addEventListener('click', function (event) {
                event.preventDefault();
                playVideo();
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
