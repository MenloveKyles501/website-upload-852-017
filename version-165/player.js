import { H as Hls } from './hls-vendor.js';

const shell = document.querySelector('[data-player-shell]');
if (shell) {
  const video = shell.querySelector('video');
  const source = shell.dataset.src;
  const overlayButton = shell.querySelector('[data-player-play]');
  const status = shell.querySelector('[data-player-status]');

  const setStatus = (text) => {
    if (status) status.textContent = text;
  };

  const attach = () => {
    if (!video || !source) return;
    try {
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setStatus('播放已就绪');
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data && data.fatal) {
            setStatus('播放加载失败');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('播放已就绪');
      } else {
        setStatus('当前浏览器暂不支持该视频格式');
      }
    } catch (err) {
      setStatus('播放加载失败');
    }
  };

  if (overlayButton) {
    overlayButton.addEventListener('click', () => {
      video.play().catch(() => {});
    });
  }
  video.addEventListener('click', () => {
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
  attach();
}
