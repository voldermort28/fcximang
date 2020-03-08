import './thp_dropdown.scss';
import { convertNodeListToArray } from '../../utils';

/* Private Method */
const _clickEventHandle = (instance, e) => {
  if (e.target === instance.elements.control) {
    e.stopPropagation();
    if (instance.elements.wrapper.classList.contains('open')) {
      if (typeof instance.setting.events.beforeClose === 'function') instance.setting.events.beforeClose(instance);

      instance.elements.control.classList.remove('open');
      instance.elements.menu.classList.remove('open');
      instance.elements.wrapper.classList.remove('open');

      if (typeof instance.setting.events.afterClose === 'function') instance.setting.events.afterClose(instance);
    } else {
      if (typeof instance.setting.events.beforeOpen === 'function') instance.setting.events.beforeOpen(instance);

      instance.elements.control.classList.add('open');
      instance.elements.menu.classList.add('open');
      instance.elements.wrapper.classList.add('open');

      if (typeof instance.setting.events.afterOpen === 'function') instance.setting.events.afterOpen(instance);
    }
  }
};

const _clickOutsideHandle = (e) => {
  e.stopPropagation();
  window.thpDropdown.map((x) => {
    if (x.elements.control.classList.contains('open')) {
      x.instance.close();
    }
    return x;
  });
};

function _bindMethodClickOpen(instance) {
  if (window.thpDropdown !== undefined) {
    window.thpDropdown.map((x) => {
      if (x.element === instance.elements.control) {
        instance.elements.control.removeEventListener('click', x.clickEventHandle);
        instance.elements.control.addEventListener('click', x.clickEventHandle);
      }
      return x;
    });
  } else {
    instance.elements.control.addEventListener('click', e => _clickEventHandle(e));
  }
}

function _bindEventClickOutside() {
  document.addEventListener('click', _clickOutsideHandle);
}

function _buildPublicMethod(instance) {
  const _instance = instance;
  _instance.open = () => {
    if (!_instance.elements.wrapper.classList.contains('open')) {
      _instance.elements.control.click();
    }
  };

  _instance.close = () => {
    if (_instance.elements.wrapper.classList.contains('open')) {
      _instance.elements.control.click();
    }
  };

  _instance.destroy = () => {
    const _arr = [];
    window.thpDropdown.map((x) => {
      if (x.element === instance.elements.control) {
        instance.elements.control.removeEventListener('click', x.clickEventHandle);
      } else {
        _arr.push(x);
      }
      return x;
    });
    window.thpDropdown = _arr;
  };
}

/* End private method */

class ThpDropdown {
  /**
   * Class constructor
   * @param {Object=} setting setting for new instance plugin.
   * @param {String=} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Object=} setting.events Define callbacks for events.
   * @param {Function=} setting.events.beforeOpen Callback will fire before dropdown instance open
   * @param {Function=} setting.events.afterOpen Callback will fire before dropdown instance open
   * @param {Function=} setting.events.beforeClose Callback will fire before dropdown instance close
   * @param {Function=} setting.events.afterClose Callback will fire before dropdown instance close
  */
  constructor(setting) {
    const defaultSetting = {
      selector: 'button[data-thp-dropdown]',
      events: {
        initialized() {},
        initializedAll() {},
        beforeOpen() {},
        afterOpen() {},
        beforeClose() {},
        afterClose() {},
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
    if (window.thpDropdown === undefined) window.thpDropdown = [];
    const _firstTime = window.thpDropdown.length === 0;
    // const _arr = window.thpDropdown === undefined ? [] : window.thpDropdown;
    els.map((x) => {
      const _f = window.thpDropdown.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = { value: null };
        // redefine setting for each instance here
        const s = Object.assign({}, $this.setting, x.dataset || {});

        obj.setting = s;

        obj.elements = {
          control: x,
          menu: document.querySelector(obj.setting.target),
        };

        if (obj.elements.menu === null) {
          obj.elements.menu = x.nextElementSibling;
        }

        obj.elements.wrapper = obj.elements.menu.parentNode;
        obj.elements.menuItems = convertNodeListToArray(obj.elements.menu.children);

        if (!obj.elements.menu.classList.contains('thp-dropdown__menu')) {
          obj.elements.menu.classList.add('thp-dropdown__menu');
        }

        if (!obj.elements.wrapper.classList.contains('thp-dropdown')) {
          obj.elements.wrapper.classList.add('thp-dropdown');
        }

        window.thpDropdown.push({
          element: x,
          elements: obj.elements,
          instance: obj,
          clickEventHandle: _clickEventHandle.bind(null, obj),
        });

        _bindMethodClickOpen(obj);
        _buildPublicMethod(obj);

        $this.instances.push(obj);
        // _arr.push(obj);

        if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);
        return obj;
      }
      return x;
    });
    // window.thpDropdown = _arr;

    if (_firstTime) _bindEventClickOutside();
    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll($this.instances);
  }
}

export default ThpDropdown;
