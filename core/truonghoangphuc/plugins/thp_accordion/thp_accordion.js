import './thp_accordion.scss';
import { convertNodeListToArray } from '../../utils';

let _next;

const _clickHandle = (instance, e) => {
  if (e.target === instance.elements.btn) {
    e.stopPropagation();
    e.preventDefault();
    const { btn } = instance.elements;

    if (btn.classList.contains('opening')) return;

    if (btn.classList.contains('active')) {
      btn.classList.remove('active');
      instance.elements.panel.map((x) => {
        x.classList.add('opening');

        if (typeof instance.setting.events.beforeClose === 'function') instance.setting.events.beforeClose(instance, btn, x);
        x.style.height = '0px';
        return x;
      });
    } else if (instance.elements.siblings.length) {
      const curr = instance.elements.siblings.filter(y => y.classList.contains('active'));

      if (curr[0]) {
        _next = btn;
        curr[0].click();
      } else {
        btn.classList.add('active', 'opening');
        instance.elements.panel.map((x) => {
          x.classList.add('opening');

          if (typeof instance.setting.events.beforeOpen === 'function') instance.setting.events.beforeOpen(instance, btn, x);

          x.style.height = `${x.querySelector('.thp-panel__body').offsetHeight}px`;
          return x;
        });
      }
    } else {
      btn.classList.add('active', 'opening');
      instance.elements.panel.map((x) => {
        x.classList.add('opening');
        if (typeof instance.setting.events.beforeOpen === 'function') instance.setting.events.beforeOpen(instance, btn, x);
        x.style.height = `${x.querySelector('.thp-panel__body').offsetHeight}px`;
        return x;
      });
    }
  }
};

function _bindMethodClickOpen(instance) {
  if (window.thpAccordion !== undefined) {
    window.thpAccordion.map((x) => {
      if (x.element === instance.elements.btn) {
        instance.elements.btn.removeEventListener('click', x.eventHandle);
        instance.elements.btn.addEventListener('click', x.eventHandle);
      }
      return x;
    });
  } else {
    instance.elements.btn.addEventListener('click', e => _clickHandle(instance, e));
  }
}

function _bindPublicMethod(instance) {
  const obj = instance;
  obj.open = () => {
    if (!obj.elements.btn.classList.contains('active')) obj.elements.btn.click();
  };

  obj.close = () => {
    if (obj.elements.btn.classList.contains('active')) obj.elements.btn.click();
  };

  obj.destroy = () => {
    const _arr = [];
    window.thpAccordion.map((x) => {
      if (x.element === obj.elements.btn) {
        obj.elements.btn.removeEventListener('click', x.eventHandle);
      } else {
        _arr.push(x);
      }
      return x;
    });
    window.thpAccordion = _arr;
  };
}

class ThpAccordion {
  /**
   * Class constructor
   * @param {Object} setting setting for new instance plugin.
   * @param {String} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Object} setting.events Define callbacks for events.
   * @param {Function} setting.events.initialized Callback will fire when 1 instance installed
   * @param {Function} setting.events.initializedAll Callback will fire when ALL instances installed
   * @param {Function} setting.events.beforeOpen Callback will fire before collapse instance open
   * @param {Function} setting.events.afterOpen Callback will fire before collapse instance open
   * @param {Function} setting.events.beforeClose Callback will fire before collapse instance open
   * @param {Function} setting.events.afterClose Callback will fire before collapse instance open
  */
  constructor(setting) {
    const defaultSetting = {
      selector: 'button[data-thp-accordion]',
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
    if (window.thpAccordion === undefined) window.thpAccordion = [];

    els.map((x) => {
      const _f = window.thpAccordion.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = {};
        const s = Object.assign({}, $this.setting, x.dataset || {});
        obj.setting = s;

        const panel = convertNodeListToArray(document.querySelectorAll(`.thp-panel${x.dataset.target}`));
        const siblings = convertNodeListToArray(document.querySelectorAll(`.thp-accordion__heading[data-group="${x.dataset.group}"]`));

        panel.map((y, index) => {
          if ('transition' in document.documentElement.style) {
            y.addEventListener('transitionend', (e) => {
              if (e.target === y) {
                e.stopPropagation();

                if (!y.classList.contains('active')) {
                  y.classList.add('active');
                  y.classList.remove('opening');

                  if (index === panel.length - 1) {
                    x.classList.remove('opening');
                  }

                  if (typeof obj.setting.events.afterOpen === 'function') obj.setting.events.afterOpen(obj, x, y);
                } else {
                  y.classList.remove('opening');
                  y.classList.remove('active');
                  if (index === panel.length - 1) {
                    x.classList.remove('opening');
                    if (_next && _next !== x) {
                      setTimeout(() => {
                        _next.click();
                        _next = null;
                      }, 1);
                    }
                  }

                  if (typeof obj.setting.events.afterClose === 'function') obj.setting.events.afterClose(obj, x, y);
                }
              }
            }, false);
          }
          return y;
        });

        obj.elements = {
          btn: x,
          panel,
          siblings,
        };

        window.thpAccordion.push({
          element: x,
          eventHandle: _clickHandle.bind(null, obj),
        });

        _bindMethodClickOpen(obj);
        _bindPublicMethod(obj);

        $this.instances.push(obj);

        if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);

        return obj;
      }
      return x;
    });

    // window.thpAccordion = _arr;

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }
}

export default ThpAccordion;
