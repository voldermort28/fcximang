import { getSystemInformation } from './utils';

class App {
  /**
   * Class constructor
   * @param {Object} setting
   */
  constructor(setting) {
    // console.log('init application');

    const defaultSetting = {
      name: 'Splash Starter Kit',
      breakpoints: [768, 992, 1200],
      viewport: 0,
      winWidth: window.innerWidth,
      winHeight: window.innerHeight,
      runWithViewport: [],
      runAlways: [],
    };

    const s = Object.assign({}, defaultSetting, setting);

    this.Site = s;
    const info = getSystemInformation();
    this.Device = info.device;
    if (this.Device.type === undefined) this.Device.type = 'pc';
    if (this.Device.model === undefined) this.Device.model = 'desktop';
    if (this.Device.vendor === undefined) this.Device.vendor = 'desktop';

    if (Array.isArray(this.Site.breakpoints)) {
      const arr = this.Site.breakpoints.filter(n => (typeof n === 'number'));
      this.Site.breakpoints = arr;
      this.Site.breakpoints.sort((a, b) => a - b);

      const _w = this.Device.type === 'pc' ? window.innerWidth : window.screen.width;
      for (let i = 0, len = this.Site.breakpoints.length; i < len; i += 1) {
        if (_w < this.Site.breakpoints[i]) {
          this.Site.viewport = i;
          if (i === len) {
            this.Site.viewport = i - 1;
          }
          break;
        } else {
          this.Site.viewport = i + 1;
        }
      }
    }

    this.Browser = info.browser;
    this.OS = info.os;

    const $this = this;

    window.addEventListener('DOMContentLoaded', () => {
      const html = document.querySelector('html');

      html.classList.remove('no-js');

      const arrClass = [];
      arrClass.push($this.OS.name ? $this.OS.name.replace(' ', '-').toLowerCase() : '');
      arrClass.push($this.Device.type ? $this.Device.type.replace(' ', '-').toLowerCase() : '');
      arrClass.push($this.Device.model ? $this.Device.model.replace(' ', '-').toLowerCase() : '');
      arrClass.push($this.Browser.name ? $this.Browser.name.replace(' ', '-').toLowerCase() : '');
      arrClass.push($this.Browser.version ? $this.Browser.version.replace(' ', '-').toLowerCase() : '');

      arrClass.map((x) => {
        if (x !== '') html.classList.add(x);
        return x;
      });
    }, false);

    window.addEventListener('resize', () => {
      const h = window.innerHeight;
      const w = window.innerWidth;
      const v = $this.Site.viewport;

      if (h !== $this.Site.winHeight || w !== $this.Site.winWidth) {
        $this.Site.winWidth = window.innerWidth;
        $this.Site.winHeight = window.innerHeight;

        $this.Site.runAlways.map(x => x());

        for (let i = 0, len = $this.Site.breakpoints.length; i < len; i += 1) {
          if (w < $this.Site.breakpoints[i]) {
            $this.Site.viewport = i;
            if (i === len) {
              $this.Site.viewport = i - 1;
            }
            break;
          } else {
            $this.Site.viewport = i + 1;
            if ((i + 1) > len) {
              $this.Site.viewport = i;
              break;
            }
          }
        }

        if (v !== $this.Site.viewport) {
          // if (typeof runWithViewport === 'function') runWithViewport(v, $this.Site.viewport);
          $this.Site.runWithViewport.map(x => x());
        }
      }
    }, false);
  }

  /**
   * DOM ready event
   * @param {function} f
   */
  ready(f) {
    window.addEventListener('DOMContentLoaded', () => {
      if (typeof f === 'function') f();
    }, false);

    return this;
  }

  /**
   * Window load event
   * @param {function} f
   */
  load(f) {
    window.addEventListener('load', () => {
      if (typeof f === 'function') f();
    }, false);

    return this;
  }

  /**
   * Window resize event
   * @param {function (oldViewport,currentViewport) } runWithViewport this function only run when viewport change (meaning browser resize to other breakpoint)
   * @param {function} runAlways this function always run when browser resize
   */
  resize(runWithViewport, runAlways) {
    const $this = this;
    if (typeof runWithViewport === 'function') $this.Site.runWithViewport.push(runWithViewport);
    if (typeof runAlways === 'function') $this.Site.runAlways.push(runAlways);

    return $this;
  }

  /**
   * loadFont
   * This method will request webfont.js from googleapis
   * Document: https://github.com/typekit/webfontloader
   */
  loadFont() {
    const $this = this;
    const wf = document.createElement('script');
    const h = document.getElementsByTagName('head')[0];
    wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
    wf.async = true;
    h.appendChild(wf);
    return $this;
  }

  /**
   * loadJS
   * This method will request js file and append to HTML at the bottom of body
   * @param {Array.<{url: String,mode: String}>} files
   * @param {String} url mandatory - JS need to load
   * @param {String} mode optional - async | defer | blank - default is async
   */
  loadJS(files) {
    const $this = this;
    const { body } = document;
    files.map((x) => {
      const script = document.createElement('script');
      script.src = x.url;
      if (x.mode === 'async') script.async = true;
      if (x.mode === 'defer') script.defer = true;

      if (typeof x.callback === 'function') {
        script.addEventListener('load', () => {
          x.callback();
        });
      }

      return body.appendChild(script);
    });

    return $this;
  }

  /**
   * loadJS
   * This method will request css file and append to HTML at head
   * @param {Array.<{url: String,rel: String}>} files
   * @param {String} url mandatory - JS need to load
   * @param {String} rel optional - rel attribute of link tag - default is stylesheet
   * @param {String} media optional - media attribute of link tag - default is all
   */
  loadCSS(files) {
    const $this = this;
    const head = document.getElementsByTagName('head')[0];
    files.map((x) => {
      const link = document.createElement('link');
      link.href = x.url;
      link.rel = x.rel || 'stylesheet';
      link.media = x.media || 'all';

      return head.appendChild(link);
    });

    return $this;
  }
}

export default App;
