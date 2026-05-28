import { H as Hls } from './hls.js';

function setStatus(player, message) {
  var status = player.querySelector('[data-player-status]');

  if (status) {
    status.textContent = message;
  }
}

function hideCover(player) {
  var cover = player.querySelector('[data-player-button]');

  if (cover) {
    cover.classList.add('is-hidden');
  }
}

function playVideo(video, player) {
  var playPromise = video.play();

  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(function () {
      setStatus(player, '浏览器已拦截自动播放，请再次点击播放按钮');
    });
  }
}

function initPlayer(player) {
  var video = player.querySelector('video');
  var source = player.getAttribute('data-src');

  if (!video || !source) {
    setStatus(player, '播放源未找到');
    return;
  }

  hideCover(player);
  setStatus(player, '正在加载 m3u8 播放源...');

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.addEventListener('loadedmetadata', function () {
      setStatus(player, '播放源已就绪');
      playVideo(video, player);
    }, { once: true });
    return;
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(player, '播放源已就绪');
      playVideo(video, player);
    });

    hls.on(Hls.Events.ERROR, function (eventName, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setStatus(player, '网络波动，正在重新连接播放源...');
        hls.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setStatus(player, '媒体解码异常，正在恢复播放...');
        hls.recoverMediaError();
        return;
      }

      setStatus(player, '当前浏览器暂时无法播放该线路');
      hls.destroy();
    });

    player.__hls = hls;
    return;
  }

  setStatus(player, '当前浏览器不支持 HLS 播放');
}

document.querySelectorAll('.js-player').forEach(function (player) {
  var button = player.querySelector('[data-player-button]');

  if (button) {
    button.addEventListener('click', function () {
      initPlayer(player);
    }, { once: true });
  }
});
