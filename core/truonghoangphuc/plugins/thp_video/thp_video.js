import './thp_video.scss';
import '../../polyfill';
import { convertNodeListToArray, wrap, getUrlQueryString } from '../../utils';
import thpProgress from '../thp_progress/thp_progress';

/* Private Method */
const _eventReady = new CustomEvent('thpVideo.Ready', { bubbles: false, cancelable: false });
const _eventLoad = new CustomEvent('thpVideo.Load', { bubbles: false, cancelable: false });

function _getVideoSource(video) {
  if (video.getAttribute('src') !== undefined) {
    return video.getAttribute('src');
  }
  const sources = convertNodeListToArray(video.querySelectorAll('source'));
  const _arr = [];
  sources.map(x => _arr.push(x.getAttribute('src')));
  return _arr;
}

function _requestYoutubeSDK() {
  return new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    try {
      // eslint-disable-next-line no-undef
      window.onYouTubeIframeAPIReady = () => resolve(YT);
    } catch (error) {
      reject(error);
    }
  });
}

function _buildUI(instance, index) {
  const _instance = instance;

  // building class
  _instance.elements.player.classList.add('thp-video__player');

  if (_instance.setting.type === 'youtube') {
    const iframe = document.createElement('div');
    iframe.id = `thp-video__player${index}`;
    _instance.elements.wrapper.insertBefore(iframe, _instance.elements.player);
    _instance.elements.player.classList.add('d-none');

    const youtubeId = getUrlQueryString('v', instance.data.src);
    _instance.data.youtubeId = youtubeId;

    _requestYoutubeSDK().then((YT) => {
      _instance.elements.youtube = new YT.Player(iframe.id, {
        videoId: _instance.data.youtubeId,
        events: {
          onReady: () => {
            // console.log('ready');
            _instance.elements.wrapper.dispatchEvent(_eventReady);
          },
          onStateChange: (event) => {
            const _status = event.data;
            if (_status === -1) {
              _instance.elements.wrapper.dispatchEvent(_eventLoad);
            } else if (_status === 0) {
              if (typeof _instance.setting.events.afterEnd === 'function') _instance.setting.events.afterEnd(instance);
            }
          },
        },
      });
    }).catch(error => console.log(error));
  }

  // remove controls attribute to hide browser native controls
  if (_instance.setting.controls) {
    _instance.elements.player.removeAttribute('controls', '');
    const _fragControls = document.createDocumentFragment();
    const _controls = document.createElement('div');
    const _btnPlay = document.createElement('button');
    const _elProgress = document.createElement('progress');
    const _elVolume = document.createElement('progress');
    const _btnVolume = document.createElement('button');
    const _btnFullScreen = document.createElement('button');

    _btnPlay.type = 'button';
    _btnPlay.classList.add('thp-video__play');

    _btnVolume.type = 'button';
    _btnVolume.classList.add('thp-video__mute');

    _btnFullScreen.type = 'button';
    _btnFullScreen.classList.add('thp-video__fullscreen');

    _elProgress.value = 0;
    if (_instance.elements.player.duration) _elProgress.max = _instance.elements.player.duration;
    _elProgress.classList.add('thp-video__progress');

    _elVolume.value = 0.5;
    _elVolume.max = 1.0;
    _elVolume.classList.add('thp-video__volume');

    _fragControls.appendChild(_btnPlay);
    _fragControls.appendChild(_elProgress);
    _fragControls.appendChild(_btnVolume);
    _fragControls.appendChild(_elVolume);
    _fragControls.appendChild(_btnFullScreen);

    _controls.classList.add('thp-video__controls');
    _controls.appendChild(_fragControls);

    _instance.elements.wrapper.appendChild(_controls);
    const _progress = new thpProgress({
      selector: 'progress.thp-video__progress',
    })[0];

    const _volume = new thpProgress({
      selector: 'progress.thp-video__volume',
      events: {
        afterChange(element, value) {
          _instance.elements.play.volume = value;
        },
      },
    })[0];

    _instance.elements.controls = {
      volume: _volume,
      progress: _progress,
      play: _btnPlay,
      mute: _btnVolume,
      fullscreen: _btnFullScreen,
    };

    if (_instance.setting.type === 'youtube') {
      _controls.classList.add('d-none');
    }
  }
}

function _bindEvents(instance) {
  instance.elements.player.addEventListener('canplay', () => {
    instance.elements.controls.progress.max(instance.elements.player.duration);
    instance.elements.wrapper.dispatchEvent(_eventReady);
  }, false);

  instance.elements.player.addEventListener('canplaythrough', () => {
    instance.elements.wrapper.dispatchEvent(_eventLoad);
  }, false);

  instance.elements.player.addEventListener('ended', () => {
    instance.elements.controls.play.classList.remove('playing');
    if (typeof instance.setting.events.afterEnd === 'function') instance.setting.events.afterEnd(instance);
  }, false);

  instance.elements.player.addEventListener('waiting', () => {
    if (typeof instance.setting.events.lacking === 'function') instance.setting.events.lacking(instance);
  }, false);

  instance.elements.player.addEventListener('playing', () => {
    instance.elements.controls.play.classList.add('playing');
  }, false);

  instance.elements.player.addEventListener('timeupdate', () => {
    instance.elements.controls.progress.update(instance.elements.player.currentTime);
  }, false);

  instance.elements.wrapper.addEventListener('thpVideo.Ready', () => {
    if (typeof instance.setting.events.ready === 'function') instance.setting.events.ready(instance);
  }, false);
  instance.elements.wrapper.addEventListener('thpVideo.Load', () => {
    if (typeof instance.setting.events.load === 'function') instance.setting.events.load(instance);
  }, false);

  instance.elements.controls.play.addEventListener('click', (e) => {
    if (e.target === instance.elements.controls.play) {
      if (instance.elements.player.paused) {
        instance.play();
        instance.elements.controls.play.classList.add('playing');
      } else {
        instance.pause();
        instance.elements.controls.play.classList.remove('playing');
      }
    }
  }, false);

  instance.elements.controls.mute.addEventListener('click', (e) => {
    if (e.target === instance.elements.controls.mute) {
      instance.mute(!instance.mute());
      if (instance.mute()) {
        instance.elements.controls.mute.classList.add('muted');
      } else {
        instance.elements.controls.mute.classList.remove('muted');
      }
    }
  }, false);

  instance.elements.controls.fullscreen.addEventListener('click', (e) => {
    if (e.target === instance.elements.controls.fullscreen) {
      instance.fullscreen();
      if (instance.data.fullscreen) {
        instance.elements.controls.fullscreen.classList.add('full');
      } else {
        instance.elements.controls.fullscreen.classList.remove('full');
      }
    }
  }, false);
}

function _bindPublicMethod(instance) {
  const _instance = instance;

  _instance.play = () => {
    if (_instance.elements.youtube !== undefined) {
      _instance.elements.youtube.playVideo();
    } else if (_instance.elements.player.paused) {
      _instance.elements.player.play();
    }
  };

  _instance.pause = () => {
    if (_instance.elements.youtube !== undefined) {
      _instance.elements.youtube.pauseVideo();
    } else if (!_instance.elements.player.paused) {
      _instance.elements.player.pause();
    }
  };

  _instance.volume = (number) => {
    if (_instance.elements.youtube !== undefined) {
      if (number === undefined) {
        return _instance.elements.youtube.getVolume();
      }
      return _instance.elements.youtube.setVolume(number);
    }
    if (_instance.elements.player !== null) {
      _instance.elements.player.volume = number;
      return _instance.elements.player.volume;
    }
    return false;
  };

  _instance.mute = (state) => {
    if (_instance.elements.youtube !== undefined) {
      if (state === undefined) {
        return _instance.elements.youtube.isMuted();
      }
      if (state) {
        _instance.elements.youtube.mute();
      } else {
        _instance.elements.youtube.unMute();
      }
      return _instance.elements.youtube.isMuted();
    }
    if (_instance.elements.player !== null) {
      if (state !== undefined) {
        _instance.elements.player.muted = state;
      }
      return _instance.elements.player.muted;
    }
    return false;
  };

  _instance.isFullscreen = () => _instance.data.fullscreen;
  _instance.fullscreen = () => {
    if (!_instance.data.fullscreen) {
      if (_instance.elements.wrapper.requestFullscreen) {
        _instance.elements.wrapper.requestFullscreen();
        _instance.data.fullscreen = true;
      } else if (_instance.elements.wrapper.mozRequestFullScreen) {
        _instance.elements.wrapper.mozRequestFullScreen();
        _instance.data.fullscreen = true;
      } else if (_instance.elements.wrapper.webkitRequestFullscreen) {
        _instance.elements.wrapper.webkitRequestFullscreen();
        _instance.data.fullscreen = true;
      } else if (_instance.elements.wrapper.msRequestFullscreen) {
        _instance.elements.wrapper.msRequestFullscreen();
        _instance.data.fullscreen = true;
      }
    } else if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullScreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        _instance.data.fullscreen = false;
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        _instance.data.fullscreen = false;
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
        _instance.data.fullscreen = false;
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
        _instance.data.fullscreen = false;
      }
    }
  };
}

class ThpVideo {
  constructor(setting) {
    const defaultSetting = {
      selector: 'video',
      events: {
        initialized() {},
        initializedAll() {},
        ready() {},
        load() {},
        beforePlay() {},
        beforePause() {},
        afterEnd() {},
        lacking() {},
        playing() {},
        play() {},
        pause() {},
      },
    };

    const s = Object.assign({}, defaultSetting, setting || {});

    this.setting = s;
    this.instances = [];
    this.init(s);

    return this.instances;
  }

  init(setting) {
    // console.log(setting);
    const $this = this;
    const els = convertNodeListToArray(document.querySelectorAll(setting.selector));

    els.map((x, index) => {
      const obj = {};
      // redefine setting for each instance here
      const s = Object.assign({}, $this.setting, x.dataset || {});
      s.controls = s.controls || (x.getAttribute('controls') !== undefined);
      s.muted = s.muted || (x.getAttribute('muted') !== undefined);
      obj.setting = s;

      obj.data = {
        fullscreen: false,
        src: _getVideoSource(x),
      };

      const wrapper = document.createElement('div');
      wrapper.classList.add('thp-video');
      wrap(wrapper, x);
      obj.elements = {
        wrapper,
        player: x,
        controls: {},
      };

      // if (s.type === 'youtube') {
      //   _requestYoutubeSDK(obj);
      // }

      _buildUI(obj, index);
      _bindEvents(obj);
      _bindPublicMethod(obj);
      $this.instances.push(obj);

      if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);
      return obj;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }

  // destroy() {
  //   const $this = this;
  //   console.log($this);
  // }
}
export default ThpVideo;
