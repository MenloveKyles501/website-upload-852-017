
(function () {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) {
      return "00:00";
    }
    const total = Math.floor(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  }

  function initNavigation() {
    const toggle = qs("[data-nav-toggle]");
    const panel = qs("[data-nav-panel]");
    if (!toggle || !panel) {
      return;
    }

    const closePanel = () => {
      panel.hidden = true;
      document.body.classList.remove("no-scroll");
    };

    const openPanel = () => {
      panel.hidden = false;
      document.body.classList.add("no-scroll");
    };

    toggle.addEventListener("click", () => {
      if (panel.hidden) {
        openPanel();
      } else {
        closePanel();
      }
    });

    qsa(".mobile-link", panel).forEach((link) => {
      link.addEventListener("click", closePanel);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) {
        closePanel();
      }
    });
  }

  function initToTop() {
    const btn = qs("[data-to-top]");
    if (!btn) {
      return;
    }

    const update = () => {
      if (window.scrollY > 500) {
        btn.classList.add("show");
      } else {
        btn.classList.remove("show");
      }
    };

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initSearchFilters() {
    qsa("[data-search-input]").forEach((input) => {
      const scopeSelector = input.getAttribute("data-search-scope") || "main";
      const scope = qs(scopeSelector) || document;
      const groups = qsa("[data-search-group]", scope);
      const empty = qs("[data-search-empty]", scope);
      const counter = qs("[data-search-counter]", scope);

      const filter = () => {
        const query = input.value.trim().toLowerCase();
        let visibleGroups = 0;
        let visibleCards = 0;

        groups.forEach((group) => {
          const cards = qsa("[data-searchable]", group);
          let groupVisible = 0;

          cards.forEach((card) => {
            const text = (card.getAttribute("data-search-index") || card.textContent || "").toLowerCase();
            const match = !query || text.includes(query);
            card.classList.toggle("hidden", !match);
            if (match) {
              groupVisible += 1;
              visibleCards += 1;
            }
          });

          group.hidden = groupVisible === 0;
          if (groupVisible > 0) {
            visibleGroups += 1;
          }
        });

        if (empty) {
          empty.hidden = visibleCards !== 0;
        }

        if (counter) {
          counter.textContent = visibleCards;
        }
      };

      input.addEventListener("input", filter);
      filter();
    });
  }

  function initDetailPlayer() {
    const video = qs("[data-hls-video]");
    if (!video) {
      return;
    }

    const src = video.getAttribute("data-hls-src");
    const loader = qs("[data-player-loader]");
    const toggleBtn = qs("[data-player-toggle]");
    const muteBtn = qs("[data-player-mute]");
    const fullBtn = qs("[data-player-fullscreen]");
    const replayBtn = qs("[data-player-replay]");
    const seek = qs("[data-player-seek]");
    const timeLabel = qs("[data-player-time]");
    const stage = qs("[data-player-stage]");

    let hls = null;
    let isPlaying = false;
    let durationReady = false;

    const setLoader = (show) => {
      if (loader) {
        loader.hidden = !show;
      }
    };

    const updateToggle = () => {
      if (!toggleBtn) {
        return;
      }
      toggleBtn.textContent = isPlaying ? "暂停" : "播放";
    };

    const updateMute = () => {
      if (!muteBtn) {
        return;
      }
      muteBtn.textContent = video.muted ? "取消静音" : "静音";
    };

    const updateTime = () => {
      if (!timeLabel) {
        return;
      }
      timeLabel.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
      if (seek && isFinite(video.duration) && video.duration > 0) {
        seek.value = String(Math.floor((video.currentTime / video.duration) * 1000));
      }
    };

    const stopHls = () => {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
      hls = null;
    };

    const attachSource = () => {
      if (!src) {
        setLoader(false);
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          setLoader(false);
        });
        hls.on(window.Hls.Events.ERROR, (_evt, data) => {
          console.error("HLS playback error:", data);
          if (data && data.fatal) {
            setLoader(false);
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", () => setLoader(false), { once: true });
      } else {
        setLoader(false);
      }
    };

    const syncPlayState = () => {
      isPlaying = !video.paused && !video.ended;
      updateToggle();
    };

    const togglePlay = async () => {
      try {
        if (video.paused || video.ended) {
          await video.play();
        } else {
          video.pause();
        }
      } catch (error) {
        console.warn("Play failed:", error);
      }
    };

    const toggleMute = () => {
      video.muted = !video.muted;
      updateMute();
    };

    const toggleFullscreen = () => {
      const element = stage || video;
      if (!document.fullscreenElement) {
        element.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    };

    const replay = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    attachSource();

    video.addEventListener("play", () => {
      setLoader(false);
      syncPlayState();
    });
    video.addEventListener("pause", syncPlayState);
    video.addEventListener("ended", () => {
      syncPlayState();
      if (toggleBtn) {
        toggleBtn.textContent = "重播";
      }
    });
    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", () => {
      durationReady = true;
      setLoader(false);
      updateTime();
    });
    video.addEventListener("volumechange", updateMute);

    if (toggleBtn) {
      toggleBtn.addEventListener("click", togglePlay);
    }
    if (muteBtn) {
      muteBtn.addEventListener("click", toggleMute);
    }
    if (fullBtn) {
      fullBtn.addEventListener("click", toggleFullscreen);
    }
    if (replayBtn) {
      replayBtn.addEventListener("click", replay);
    }
    if (seek) {
      seek.addEventListener("input", () => {
        if (durationReady && isFinite(video.duration) && video.duration > 0) {
          const pct = Number(seek.value) / 1000;
          video.currentTime = video.duration * pct;
        }
      });
    }

    if (stage) {
      stage.addEventListener("click", (event) => {
        const interactive = event.target.closest("button, input, a");
        if (interactive) {
          return;
        }
        togglePlay();
      });
    }

    updateToggle();
    updateMute();
    updateTime();

    window.addEventListener("beforeunload", stopHls);
  }

  function initCategoryCounters() {
    qsa("[data-category-count]").forEach((node) => {
      const selector = node.getAttribute("data-category-count");
      const group = selector ? qs(selector) : null;
      if (!group) {
        return;
      }
      const count = qsa("[data-searchable]", group).length;
      node.textContent = count;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initToTop();
    initSearchFilters();
    initDetailPlayer();
    initCategoryCounters();
  });
})();
