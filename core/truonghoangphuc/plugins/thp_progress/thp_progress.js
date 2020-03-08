import './thp_progress.scss';
import { convertNodeListToArray } from '../../utils';

function _bindEvents(instance) {
  instance.elements.progress.addEventListener('change', (e) => {
    if (e.target === instance.elements.progress) {
      if (typeof instance.setting.events.afterChange === 'function') instance.setting.events.afterChange(instance, e.target.value);
    }
  }, false);
}

function _bindPublicMethod(instance) {
  const _instance = instance;

  _instance.update = (value) => {
    _instance.elements.progress.value = value;
  };

  _instance.max = (value) => {
    if (value !== undefined) {
      _instance.elements.progress.max = value;
    }
    return _instance.elements.progress.max;
  };

  _instance.end = () => {
    _instance.elements.progress.value = _instance.elements.progress.max;
  };

  _instance.value = () => {
    return _instance.elements.progress.value;
  };
}

class ThpProgress {
  /**
   * Class constructor
   * @param {Object} setting setting for new instance plugin.
   * @param {String} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Object} setting.events Define callbacks for events.
   * @param {Function} setting.events.initialized Callback will fire when 1 instance installed
   * @param {Function} setting.events.initializedAll Callback will fire when ALL instances installed
   * @param {Function} setting.events.beforeChange Callback will fire before progress change value
   * @param {Function} setting.events.afterChange Callback will fire after progress change value
   * @param {Function} setting.events.beforeEnd Callback will fire before progress go to end
   * @param {Function} setting.events.afterEnd Callback will fire after progress go to end
  */
  constructor(setting) {
    const defaultSetting = {
      selector: 'progress',
      max: 100,
      value: 0,
      autoUpdate: false,
      updateTime: 1000,
      events: {
        initialized() {},
        initializedAll() {},
        beforeChange() {},
        afterChange() {},
        beforeEnd() {},
        afterEnd() {},
      },
    };

    const s = Object.assign({}, defaultSetting, setting || {});
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
      const s = Object.assign({}, $this.setting, x.dataset || {});

      obj.setting = s;

      x.classList.add('thp-progress');
      obj.elements = {
        progress: x,
      };

      obj.data = {};

      _bindEvents(obj);
      _bindPublicMethod(obj);

      $this.instances.push(obj);
      if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);
      return obj;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }
}

export default ThpProgress;
