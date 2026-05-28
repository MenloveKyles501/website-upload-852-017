const mobileButton = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (mobileButton && mobileNav) {
    mobileButton.addEventListener("click", () => {
        mobileNav.classList.toggle("is-open");
    });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const previous = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const showSlide = (target) => {
        index = (target + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    };

    const startTimer = () => {
        timer = window.setInterval(() => showSlide(index + 1), 5200);
    };

    const restartTimer = () => {
        window.clearInterval(timer);
        startTimer();
    };

    previous?.addEventListener("click", () => {
        showSlide(index - 1);
        restartTimer();
    });

    next?.addEventListener("click", () => {
        showSlide(index + 1);
        restartTimer();
    });

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener("click", () => {
            showSlide(dotIndex);
            restartTimer();
        });
    });

    startTimer();
}

const toolbars = document.querySelectorAll("[data-filter-toolbar]");

toolbars.forEach((toolbar) => {
    const input = toolbar.querySelector("[data-card-search]");
    const page = toolbar.closest("main");
    const cards = Array.from(page.querySelectorAll("[data-card]"));
    const count = page.querySelector("[data-result-count]");
    const chips = Array.from(toolbar.querySelectorAll("[data-filter-value]"));
    const params = new URLSearchParams(window.location.search);
    const startQuery = params.get("q") || "";
    let activeFilter = "all";

    if (input && startQuery) {
        input.value = startQuery;
    }

    const applyFilters = () => {
        const query = (input?.value || "").trim().toLowerCase();
        let visible = 0;

        cards.forEach((card) => {
            const searchText = (card.dataset.searchtext || "").toLowerCase();
            const matchesQuery = !query || searchText.includes(query);
            const matchesFilter = activeFilter === "all" || searchText.includes(activeFilter.toLowerCase());
            const show = matchesQuery && matchesFilter;

            card.classList.toggle("is-hidden", !show);
            if (show) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = `${visible} 部影片`;
        }
    };

    input?.addEventListener("input", applyFilters);

    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            activeFilter = chip.dataset.filterValue || "all";
            chips.forEach((item) => item.classList.toggle("is-active", item === chip));
            applyFilters();
        });
    });

    applyFilters();
});

let hlsLoader = null;

const loadHlsClass = async () => {
    if (window.Hls) {
        return window.Hls;
    }

    if (!hlsLoader) {
        hlsLoader = import("./hls.esm.js").then((module) => module.H || module.default || null);
    }

    return hlsLoader;
};

const prepareVideo = async (video, source) => {
    if (video.dataset.ready === "true") {
        return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.dataset.ready = "true";
        return;
    }

    const Hls = await loadHlsClass();

    if (Hls && Hls.isSupported && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.hlsInstance = hls;
        video.dataset.ready = "true";
        return;
    }

    video.src = source;
    video.dataset.ready = "true";
};

const players = document.querySelectorAll("[data-player]");

players.forEach((player) => {
    const video = player.querySelector("video");
    const button = player.querySelector(".player-start");
    const source = player.dataset.stream;

    if (!video || !button || !source) {
        return;
    }

    const play = async () => {
        button.disabled = true;
        await prepareVideo(video, source);
        player.classList.add("is-playing");
        video.controls = true;

        try {
            await video.play();
        } catch (error) {
            player.classList.remove("is-playing");
            button.disabled = false;
        }
    };

    button.addEventListener("click", play);

    video.addEventListener("play", () => {
        player.classList.add("is-playing");
    });

    video.addEventListener("pause", () => {
        if (!video.ended) {
            button.disabled = false;
        }
    });

    video.addEventListener("ended", () => {
        player.classList.remove("is-playing");
        button.disabled = false;
    });
});
