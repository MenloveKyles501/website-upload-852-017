(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setMenu() {
    var button = qs(".menu-toggle");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      document.body.classList.toggle("is-menu-open");
    });
  }

  function setHero() {
    var slides = qsa(".hero-slide");
    if (slides.length === 0) {
      return;
    }
    var dots = qsa(".hero-dot");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var prev = qs(".hero-prev");
    var next = qs(".hero-next");

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    start();
  }

  function setCatalog() {
    var cards = qsa(".movie-card");
    var search = qs(".catalog-search");
    var region = qs(".catalog-region");
    var year = qs(".catalog-year");
    var empty = qs(".empty-state");

    if (cards.length === 0 || (!search && !region && !year)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && search) {
      search.value = query;
    }

    function matches(card) {
      var text = [
        card.dataset.title || "",
        card.dataset.region || "",
        card.dataset.type || "",
        card.dataset.year || "",
        card.dataset.genre || ""
      ].join(" ").toLowerCase();
      var q = search ? search.value.trim().toLowerCase() : "";
      var r = region ? region.value : "";
      var y = year ? year.value : "";
      return (!q || text.indexOf(q) !== -1) && (!r || card.dataset.region === r) && (!y || card.dataset.year === y);
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function pad(value) {
    value = Math.floor(value || 0);
    var minute = Math.floor(value / 60);
    var second = value % 60;
    return String(minute).padStart(2, "0") + ":" + String(second).padStart(2, "0");
  }

  function initMoviePlayer(streamUrl) {
    var shell = document.querySelector(".player-shell");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var toggle = shell.querySelector(".player-toggle");
    var mute = shell.querySelector(".player-mute");
    var fullscreen = shell.querySelector(".player-fullscreen");
    var progress = shell.querySelector(".player-progress");
    var progressFill = progress ? progress.querySelector("span") : null;
    var time = shell.querySelector(".player-time");
    var message = shell.querySelector(".player-message");
    var ready = false;
    var hls = null;

    function showMessage() {
      if (message) {
        message.hidden = false;
      }
    }

    function prepare() {
      if (ready || !video || !streamUrl) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      prepare();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          showMessage();
        });
      }
    }

    function togglePlay() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    function update() {
      if (toggle) {
        toggle.textContent = video.paused ? "▶" : "Ⅱ";
      }
      if (time) {
        time.textContent = pad(video.currentTime) + " / " + pad(video.duration);
      }
      if (progressFill && video.duration) {
        progressFill.style.width = Math.max(0, Math.min(100, (video.currentTime / video.duration) * 100)) + "%";
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    if (toggle) {
      toggle.addEventListener("click", togglePlay);
    }
    if (video) {
      video.addEventListener("click", togglePlay);
      video.addEventListener("timeupdate", update);
      video.addEventListener("durationchange", update);
      video.addEventListener("play", update);
      video.addEventListener("pause", update);
      video.addEventListener("error", showMessage);
    }
    if (mute) {
      mute.addEventListener("click", function () {
        video.muted = !video.muted;
        mute.textContent = video.muted ? "已静音" : "音量";
      });
    }
    if (fullscreen) {
      fullscreen.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (shell.requestFullscreen) {
          shell.requestFullscreen();
        }
      });
    }
    if (progress) {
      progress.addEventListener("click", function (event) {
        if (!video.duration) {
          return;
        }
        var rect = progress.getBoundingClientRect();
        var ratio = (event.clientX - rect.left) / rect.width;
        video.currentTime = Math.max(0, Math.min(video.duration, ratio * video.duration));
      });
    }

    update();
  }

  window.initMoviePlayer = initMoviePlayer;

  document.addEventListener("DOMContentLoaded", function () {
    setMenu();
    setHero();
    setCatalog();
  });
})();
