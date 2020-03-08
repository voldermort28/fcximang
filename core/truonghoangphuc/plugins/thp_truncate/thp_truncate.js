import '../../polyfill';
import { convertNodeListToArray } from '../../utils';

function _truncate(instance) {
  if (instance.setting.length >= instance.data.original.length) return;
  // instance.elements.target.innerText = instance.data.original.substr(0, instance.setting.length);
}

function _initData(instance) {
  const _instance = instance;
  _instance.data = {
    original: _instance.elements.target.innerText,
  };
  _truncate(instance);
}

function _bindPublicMethod(instance) {
  instance.update = () => {
    if (instance.elements.target.children.length) {
      // console.log(instance.elements.target.children[0].innerText);
      [instance.elements.target] = instance.elements.target.children;
    }
    _initData(instance);
  };
}

class ThpDataTruncate {
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-thp-truncate]',
      events: {
        initialized() {},
        initializedAll() {},
      },
    };

    const s = Object.assign({}, defaultSetting, setting || {});
    this.setting = s;
    this.setting.length = parseFloat(this.setting.length);
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

      obj.setting.length = parseFloat(obj.setting.length);

      obj.elements = {
        target: x.children.length > 0 ? x.children[0] : x,
      };
      _initData(obj);
      _bindPublicMethod(obj);

      $this.instances.push(obj);

      if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);

      return obj;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }
}

export default ThpDataTruncate;
