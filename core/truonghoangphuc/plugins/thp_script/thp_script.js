import { convertNodeListToArray } from '../../utils';

function _rescureImport(instance, source) {
  const _instance = instance;
  const script = document.createElement('script');
  script.src = source;

  script.onload = () => {
    if (typeof _instance.setting.events.afterLoaded === 'function') _instance.setting.events.afterLoaded(_instance, source);
  };

  if (typeof _instance.setting.events.beforeLoaded === 'function') _instance.setting.events.beforeLoaded(_instance, source);

  const _scriptCheck = document.querySelectorAll(`script[src="${source}"]`);
  if (_scriptCheck.length === 0) {
    if (_instance.setting.location === 'head') {
      document.querySelector('head').appendChild(script);
    } else {
      document.body.appendChild(script);
    }
  } else if (typeof _instance.setting.events.afterLoaded === 'function') _instance.setting.events.afterLoaded(_instance, source);
}

function _importScript(instance, sourceString) {
  const _instance = instance;

  if (_instance.setting.src.indexOf('|') === -1) {
    _rescureImport(_instance, _instance.setting.src);
  } else if (sourceString === undefined) {
    const _arrScript = _instance.setting.src.split('|');
    _arrScript.map((x) => {
      _importScript(_instance, x);
      return x;
    });
  } else {
    _rescureImport(_instance, sourceString);
  }
}

class ThpScript {
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-thp-script]',
      location: 'body',
      events: {
        beforeLoaded() {},
        afterLoaded() {},
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

      _importScript(obj);

      $this.instances.push(obj);
      return obj;
    });
  }
}

export default ThpScript;
