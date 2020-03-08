import './thp_lazy.scss';
import { convertNodeListToArray } from '../../utils';

// let observer;
function _fetchImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = resolve;
    image.onerror = reject;
  });
}

function _loadImage(img) {
  const image = img;
  const url = image.dataset.source;
  _fetchImage(url).then(() => {
    image.src = url;
    image.classList.add('loaded');
    image.classList.add('shown');
  }).catch(() => {
    image.classList.add('shown', 'error');
  });
}

function handleIntersection(entries, observer) {
  entries.map((entry) => {
    const img = entry.target;
    // if (entry.intersectionRatio > 0.2) {
    if (entry.isIntersecting) {
      _loadImage(img);
      observer.unobserve(img);
    }
    // }
    return img;
  });
}

function _initLazyImage(els, options) {
  els.instances.map(x => x.elements.el.addEventListener('load', () => {
    if (typeof els.setting.events.afterLoad === 'function') els.setting.events.afterLoad(x);
  }));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(handleIntersection, options);
    els.instances.map((x) => {
      observer.observe(x.elements.el);
      x.elements.el.classList.add('monitored');
      return x;
    });
  } else {
    els.instances.map(x => _loadImage(x.elements.el));
  }

  if (els.setting.type === 'delay') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        els.instances.map(x => _loadImage(x.elements.el));
      }, els.setting.delay);
    });
  }
}

class ThpLazyElement {
  /**
   * Class constructor
   * @param {Object} setting setting for new instance plugin.
   * @param {String=} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Object=} setting.events Define callbacks for events.
   * @param {Function=} setting.events.afterLoad Callback will fire when 1 instance installed
  */
  constructor(setting) {
    const defaultSetting = {
      selector: 'img[data-thp-lazy]',
      delay: 1000,
      offset: '0px',
      threshold: 0.2,
      type: 'scroll',
      force: false,
      events: {
        afterLoad() {},
      },
    };

    const s = Object.assign({}, defaultSetting, setting || {});
    s.delay = parseFloat(s.delay);
    this.setting = s;
    this.instances = [];
    this.init(s);

    return this.instances;
  }

  init(setting) {
    const $this = this;
    const els = convertNodeListToArray(document.querySelectorAll(setting.selector));

    els.map((x) => {
      const obj = {};
      // redefine setting for each instance here
      // const s = Object.assign({}, $this.setting, x.dataset || {});

      // obj.setting = s;
      if (!setting.force) {
        if (!x.classList.contains('monitored')) {
          obj.elements = {
            el: x,
          };
          $this.instances.push(obj);
        }
      } else {
        obj.elements = {
          el: x,
        };
        $this.instances.push(obj);
      }

      return obj;
    });

    const options = {
      rootMargin: setting.offset,
      threshold: setting.threshold,
    };

    _initLazyImage($this, options);
  }
}

export default ThpLazyElement;
