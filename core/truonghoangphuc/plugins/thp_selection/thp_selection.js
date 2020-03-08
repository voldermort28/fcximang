import './thp_selection.scss';
import '../../polyfill';
import { convertNodeListToArray, fireEvent, unWrap } from '../../utils';

/* Private Method */
const eventOpen = new CustomEvent('thpSelection.Open', { bubbles: false, cancelable: false });
const eventClose = new CustomEvent('thpSelection.Close', { bubbles: false, cancelable: false });
let cmdPressed = false;

const _changeEventHandle = (instance) => {
  if (instance.elements) {
    if (instance.setting.multiple) {
      instance.elements.btn.innerText = convertNodeListToArray(instance.elements.options.querySelectorAll('.selected')).map(x => x.innerText);
    } else {
      instance.elements.btn.innerText = instance.elements.options.querySelector('.selected').innerText;
    }
  }
};

const _openEventHandle = (e) => {
  const els = document.querySelectorAll('.thp-select.open');
  convertNodeListToArray(els).map(x => (x !== e.target) && (x.classList.remove('open')));
};

const _clickEventHandle = (instance, e) => {
  e.stopPropagation();
  if (instance.elements.wrapper.classList.contains('open')) {
    if (typeof instance.setting.events.beforeClose === 'function') instance.setting.events.beforeClose(instance);

    instance.elements.wrapper.classList.remove('open');
    instance.elements.wrapper.dispatchEvent(eventClose);

    if (typeof instance.setting.events.afterClose === 'function') instance.setting.events.afterClose(instance);
  } else {
    if (typeof instance.setting.events.beforeOpen === 'function') instance.setting.events.beforeOpen(instance);

    instance.elements.wrapper.classList.add('open');

    instance.elements.wrapper.dispatchEvent(eventOpen);

    if (typeof instance.setting.events.afterOpen === 'function') instance.setting.events.afterOpen(instance);
  }
};

const _clickOutsideHandle = (e) => {
  e.stopPropagation();
  const els = document.querySelectorAll('.thp-select');
  convertNodeListToArray(els).map(x => x.classList.contains('open') && (x.classList.remove('open')));
};


function _bindEventChange(instance) {
  // instance.elements.select.addEventListener('change', () => _changeEventHandle(instance));
  if (window.thpSelection !== undefined) {
    window.thpSelection.map((x) => {
      if (x.element === instance.elements.select) {
        instance.elements.select.removeEventListener('change', x.changeEventHandle);
        instance.elements.select.addEventListener('change', x.changeEventHandle);
      }
      return x;
    });
  } else {
    instance.elements.select.addEventListener('change', () => _changeEventHandle(instance));
  }
}

function _bindEventOpen(instance) {
  // instance.elements.wrapper.addEventListener('thpSelection.Open', (e) => {
  //   const els = document.querySelectorAll('.thp-select.open');
  //   convertNodeListToArray(els).map(x => (x !== e.target) && (x.classList.remove('open')));
  // }, false);
  if (window.thpSelection !== undefined) {
    window.thpSelection.map((x) => {
      if (x.element === instance.elements.select) {
        instance.elements.wrapper.removeEventListener('thpSelection.Open', x.openEventHandle);
        instance.elements.wrapper.addEventListener('thpSelection.Open', x.openEventHandle);
      }
      return x;
    });
  } else {
    instance.elements.wrapper.addEventListener('thpSelection.Open', e => _openEventHandle(e));
  }
}

// function _bindEventClose(instance) {
//   instance.elements.wrapper.addEventListener('thpSelection.Close', () => {

//   }, false);
// }

function _bindMethodClickOpen(instance) {
  if (window.thpSelection !== undefined) {
    window.thpSelection.map((x) => {
      if (x.element === instance.elements.select) {
        instance.elements.btn.removeEventListener('click', x.clickEventHandle);
        instance.elements.btn.addEventListener('click', x.clickEventHandle);
      }
      return x;
    });
  } else {
    instance.elements.btn.addEventListener('click', e => _clickEventHandle(e));
  }
  // instance.elements.btn.addEventListener('click', (e) => {
  //   e.stopPropagation();
  //   if (instance.elements.wrapper.classList.contains('open')) {
  //     if (typeof instance.setting.events.beforeClose === 'function') instance.setting.events.beforeClose(instance);

  //     instance.elements.wrapper.classList.remove('open');
  //     instance.elements.wrapper.dispatchEvent(eventClose);

  //     if (typeof instance.setting.events.afterClose === 'function') instance.setting.events.afterClose(instance);
  //   } else {
  //     if (typeof instance.setting.events.beforeOpen === 'function') instance.setting.events.beforeOpen(instance);

  //     instance.elements.wrapper.classList.add('open');

  //     instance.elements.wrapper.dispatchEvent(eventOpen);

  //     if (typeof instance.setting.events.afterOpen === 'function') instance.setting.events.afterOpen(instance);
  //   }
  // }, false);
}

function _bindMethodClickSelect(instance) {
  instance.elements.options.addEventListener('click', (e) => {
    // e.stopPropagation();
    const el = e.target;
    if (el.tagName === 'LI') {
      const options = convertNodeListToArray(instance.elements.options.children);
      if (instance.setting.multiple) {
        let selectedItems = convertNodeListToArray(instance.elements.options.querySelectorAll('.selected') || []);
        const selectedOptions = convertNodeListToArray(instance.elements.select.querySelectorAll('[selected]') || []);

        if (e.shiftKey) {
          e.preventDefault();
          document.getSelection().removeAllRanges();

          const selectedIndex = options.indexOf(el);
          const firstPointSelected = instance.firstPointSelected || options.indexOf(selectedItems[0]);

          selectedItems.map(x => x.classList.remove('selected'));

          if (selectedIndex <= firstPointSelected) {
            for (let i = selectedIndex; i <= firstPointSelected; i += 1) {
              instance.elements.options.children[i].classList.add('selected');
            }
          } else {
            for (let i = firstPointSelected; i <= selectedIndex; i += 1) {
              instance.elements.options.children[i].classList.add('selected');
            }
          }
        }

        if (e.metaKey || e.ctrlKey || cmdPressed) {
          if (el.classList.contains('selected')) {
            el.classList.remove('selected');
          } else {
            el.classList.add('selected');
          }
        }

        if (!e.shiftKey && !e.metaKey && !e.ctrlKey && !cmdPressed) {
          selectedItems.map(x => x.classList.remove('selected'));
          instance.firstPointSelected = options.indexOf(el);
          el.classList.add('selected');
        }

        // Change selections in real DOM elements.
        if (typeof instance.setting.events.beforeUnSelect === 'function') instance.setting.events.beforeUnSelect(instance);
        selectedOptions.map(x => x.removeAttribute('selected'));
        if (typeof instance.setting.events.afterUnSelect === 'function') instance.setting.events.afterUnSelect(instance);
        if (typeof instance.setting.events.beforeSelect === 'function') instance.setting.events.beforeSelect(instance);

        selectedItems = convertNodeListToArray(instance.elements.options.querySelectorAll('.selected') || []);
        instance.value = [];
        selectedItems.map((x) => {
          const tmp = instance.elements.select.querySelector(`option[value="${x.dataset.value}"]`);
          if (tmp !== null) {
            tmp.setAttribute('selected', '');
            instance.value.push(tmp.value);
          }
          return x;
        });

        fireEvent(instance.elements.select, 'change');
        if (typeof instance.setting.events.afterSelect === 'function') instance.setting.events.afterSelect(instance);
      } else {
        if (el.classList.contains('selected')) {
          // For single option, we don't allow to change from selected to non-select
          return true;
        }

        const current = instance.elements.options.querySelector('.selected');
        if (current) {
          current.classList.remove('selected');
        }

        if (typeof instance.setting.events.beforeSelect === 'function') instance.setting.events.beforeSelect(instance);

        el.classList.add('selected');
        instance.elements.select.value = el.dataset.value;
        instance.value = el.dataset.value;

        fireEvent(instance.elements.select, 'change');

        if (typeof instance.setting.events.afterSelect === 'function') instance.setting.events.afterSelect(instance);
      }
    }
    return true;
  }, false);
}

function _bindEventClickOutside() {
  document.addEventListener('click', _clickOutsideHandle);
}

function _buildPublicMethod(instance) {
  // const obj = instance;
  instance.open = () => {
    if (!instance.elements.wrapper.classList.contains('open')) {
      instance.elements.btn.click();
    }
  };

  instance.close = () => {
    if (instance.elements.wrapper.classList.contains('open')) {
      instance.elements.btn.click();
    }
  };

  /**
   * @param {string\|number|Array=} value - If null return current value else it will set value as parameters
   */
  instance.selected = (value) => {
    if (value !== undefined) {
      const options = convertNodeListToArray(instance.elements.options.children);

      if (instance.setting.multiple && Array.isArray(value)) {
        const els = options.filter(x => value.includes(x.dataset.value));

        if (typeof instance.setting.events.beforeUnSelect === 'function') instance.setting.events.beforeUnSelect(instance);
        options.map(x => x.classList.remove('selected'));
        if (typeof instance.setting.events.afterUnSelect === 'function') instance.setting.events.afterUnSelect(instance);
        cmdPressed = true;
        els.map(x => x.click());
        cmdPressed = false;
      } else {
        const el = options.filter(x => x.dataset.value === value);
        if (el[0]) {
          el[0].click();
        }
      }
    }
    return instance.value;
  };

  instance.selectedIndex = (index) => {
    if (index !== undefined) {
      const options = convertNodeListToArray(instance.elements.options.children);

      if (instance.setting.multiple && Array.isArray(index)) {
        const els = options.filter((x, i) => index.includes(i));

        if (typeof instance.setting.events.beforeUnSelect === 'function') instance.setting.events.beforeUnSelect(instance);
        options.map(x => x.classList.remove('selected'));
        if (typeof instance.setting.events.afterUnSelect === 'function') instance.setting.events.afterUnSelect(instance);
        cmdPressed = true;
        els.map(x => x.click());
        cmdPressed = false;
      } else {
        const el = options.filter((x, i) => i === index);
        if (el[0]) {
          el[0].click();
        }
      }
    }
    return instance.value;
  };

  instance.currentIndex = () => {
    const options = convertNodeListToArray(instance.elements.options.children);
    return options.indexOf(instance.elements.options.querySelector('.selected'));
  };

  // obj.update = () => {

  // };

  instance.addEventListener = (event, fn) => {
    instance.elements.wrapper.addEventListener(event, fn);
  };

  instance.destroy = () => {
    // instance.elements.select.onChange = () => {
    //   // e.preventDefault();
    //   return false;
    // };
    // instance.elements = null;
    // instance.setting = null;
    // instance.open = () => {};
    // instance.close = () => {};
    // instance.currentIndex = () => {};
    // instance.selected = () => {};
    // instance.destroy = () => {};
    const _arr = [];
    window.thpSelection.map((x) => {
      if (x.element === instance.elements.select) {
        instance.elements.select.removeEventListener('change', x.changeEventHandle);
        instance.elements.wrapper.removeEventListener('thpSelection.Open', x.openEventHandle);
        instance.elements.btn.removeEventListener('click', x.clickEventHandle);
        instance.elements.btn.remove();
        instance.elements.options.remove();
        unWrap(instance.elements.wrapper);
        instance.elements.select.classList.remove('invisible');
      } else {
        _arr.push(x);
      }
      return x;
    });
    window.thpSelection = _arr;
  };
}

/* End private method */

class ThpSelection {
  /**
   * Class constructor
   * @param {Object=} setting setting for new instance plugin.
   * @param {String=} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Object=} setting.events Define callbacks for events.
   * @param {Function=} setting.events.beforeOpen Callback will fire before select instance open
   * @param {Function=} setting.events.afterOpen Callback will fire before select instance open
   * @param {Function=} setting.events.beforeClose Callback will fire before select instance open
   * @param {Function=} setting.events.afterClose Callback will fire before select instance open
   * @param {Function=} setting.events.beforeSelect Callback will fire before select instance open
   * @param {Function=} setting.events.afterSelect Callback will fire before select instance open
   * @param {Function=} setting.events.beforeUnSelect Callback will fire before select instance open
   * @param {Function=} setting.events.afterUnSelect Callback will fire before select instance open
  */
  constructor(setting) {
    const defaultSetting = {
      selector: 'select[data-thp-selection]',
      placeholder: '',
      events: {
        initialized() {},
        initializedAll() {},
        beforeOpen() {},
        afterOpen() {},
        beforeClose() {},
        afterClose() {},
        beforeSelect() {},
        afterSelect() {},
        beforeUnSelect() {},
        afterUnSelect() {},
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
    if (window.thpSelection === undefined) window.thpSelection = [];

    els.map((x) => {
      const _f = window.thpSelection.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = { value: null };
        // redefine setting for each instance here
        const s = Object.assign({}, $this.setting, x.dataset || {});
        const valueText = [];

        if (x.getAttribute('multiple') !== null && x.getAttribute('multiple') !== undefined) {
          s.multiple = true;
          obj.value = [];
        }

        obj.setting = s;

        // add wrapper
        const wrapper = document.createElement('div');
        wrapper.classList.add('thp-select');
        x.parentNode.insertBefore(wrapper, x);
        wrapper.appendChild(x);

        // add UI element
        const thpText = document.createElement('div');
        const ul = document.createElement('ul');
        let ulString = '';

        thpText.className = `${x.className} btn btn-select thp-select-text`;
        thpText.innerText = obj.setting.placeholder;

        convertNodeListToArray(x.querySelectorAll('option')).map((y) => {
          ulString += `<li data-value=${y.value}`;
          if (y.getAttribute('selected') !== null) {
            if (obj.setting.multiple) {
              obj.value.push(y.value);
            } else {
              obj.value = y.value;
            }
            valueText.push(y.innerText);
            ulString += ' class="selected"';
          }
          ulString += `>${y.innerText}</li>`;
          return ulString;
        });

        if (valueText.length) thpText.innerText = valueText.join();

        ul.innerHTML = ulString;
        ul.classList.add('thp-options');

        wrapper.appendChild(thpText);
        wrapper.appendChild(ul);

        obj.elements = {
          select: x,
          wrapper,
          btn: thpText,
          options: ul,
        };

        window.thpSelection.push({
          element: x,
          changeEventHandle: _changeEventHandle.bind(null, obj),
          openEventHandle: _openEventHandle.bind(null),
          clickEventHandle: _clickEventHandle.bind(null, obj),
        });

        // Wrap - Hide real element
        x.classList.add('invisible');

        _bindEventChange(obj);
        _bindEventOpen(obj);
        // _bindEventClose(obj);
        _bindMethodClickOpen(obj);
        _bindMethodClickSelect(obj);

        _buildPublicMethod(obj);

        $this.instances.push(obj);
        if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);
        return obj;
      }
      return x;
    });

    _bindEventClickOutside();
    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }
}

export default ThpSelection;
