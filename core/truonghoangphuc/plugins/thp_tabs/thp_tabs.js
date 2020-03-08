import './thp_tabs.scss';
import { convertNodeListToArray } from '../../utils';

const _clickEventHandle = (instance, e) => {
  e.stopPropagation();
  e.preventDefault();

  const li = e.target.parentNode;

  if (e.target.classList.contains('thp-tab__link')) {
    if (!li.classList.contains('active')) {
      const curr = instance.elements.nav.ul.querySelector('.thp-tab__item.active');

      instance.elements.panels.map((x) => {
        if (x.classList.contains('active')) {
          if (typeof instance.setting.events.beforeClose === 'function') instance.setting.events.beforeClose(instance, curr, x);
          curr.classList.remove('active');
          x.classList.remove('active');
          if (typeof instance.setting.events.afterClose === 'function') instance.setting.events.afterClose(instance, curr, x);
        }
        if (x.id === e.target.getAttribute('href').replace('#', '')) {
          if (typeof instance.setting.events.beforeOpen === 'function') instance.setting.events.beforeOpen(instance, li, x);
          li.classList.add('active');
          x.classList.add('active');
          if (typeof instance.setting.events.afterOpen === 'function') instance.setting.events.afterOpen(instance, li, x);
        }
        return x;
      });
    }
  }
};

function _bindMethodClickOpen(instance) {
  if (window.thpTab !== undefined) {
    window.thpTab.map((x) => {
      if (x.element === instance.elements.nav.ul) {
        instance.elements.nav.ul.removeEventListener('click', x.clickEventHandle);
        instance.elements.nav.ul.addEventListener('click', x.clickEventHandle);
      }
      return x;
    });
  } else {
    instance.elements.wrapper.addEventListener('click', e => _clickEventHandle(e));
  }
}

function _bindPublicMethod(instance) {
  const obj = instance;

  obj.open = (index) => {
    obj.elements.nav.li[index].click();
  };

  obj.destroy = () => {
    const _arr = [];
    window.thpTab.map((x) => {
      if (x.element === instance.elements.nav.ul) {
        instance.elements.nav.ul.removeEventListener('click', x.clickEventHandle);
      } else {
        _arr.push(x);
      }
      return x;
    });
    window.thpTab = _arr;
  };
}

class ThpTab {
  /**
   * Class constructor
   * @param {Object} setting setting for new instance plugin.
   * @param {String} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Object} setting.events Define callbacks for events.
   * @param {Function} setting.events.initialized Callback will fire when 1 instance installed
   * @param {Function} setting.events.initializedAll Callback will fire when ALL instances installed
   * @param {Function} setting.events.beforeOpen Callback will fire before tab instance open
   * @param {Function} setting.events.afterOpen Callback will fire before tab instance open
   * @param {Function} setting.events.beforeClose Callback will fire before tab instance open
   * @param {Function} setting.events.afterClose Callback will fire before tab instance open
  */
  constructor(setting) {
    const defaultSetting = {
      selector: 'ul[data-thp-tabs]',
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
    if (window.thpTab === undefined) window.thpTab = [];
    els.map((x) => {
      const _f = window.thpTab.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = {};
        const s = Object.assign({}, $this.setting, x.dataset || {});

        obj.setting = s;

        const lis = convertNodeListToArray(x.querySelectorAll('.thp-tab__link'));
        const panels = [];
        lis.map((y) => {
          const p = document.querySelector(`.thp-panel${y.getAttribute('href')}`);
          if (p !== null) {
            panels.push(p);
          }
          return y;
        });

        obj.elements = {
          nav: {
            ul: x,
            li: lis,
          },
          panels,
        };

        window.thpTab.push({
          element: x,
          clickEventHandle: _clickEventHandle.bind(null, obj),
        });

        _bindMethodClickOpen(obj);
        _bindPublicMethod(obj);

        $this.instances.push(obj);
        if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);
        return obj;
      }
      return x;
    });
    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }
}

export default ThpTab;
