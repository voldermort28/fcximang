import './thp_validation.scss';
import { convertNodeListToArray, insertAfter, getSelectors } from '../../utils';

function _checkRequireField(el, instance) {
  // if (el.value === null || el.value === '' || el.value === undefined) {
  //   return false;
  // }
  // return true;
  if (el.type !== 'checkbox' && el.type !== 'radio') {
    if (el.value === null || el.value === '' || el.value === undefined) {
      return false;
    }
  } else if (el.type === 'checkbox') {
    return el.checked;
  } else if (el.type === 'radio') {
    const _group = convertNodeListToArray(instance.elements.form.querySelectorAll(`input[name="${el.name}"]`));

    let _r = false;

    _group.map((x) => {
      if (x.checked) {
        _r = true;
      }
      return x;
    });
    return _r;
  }

  return true;
}

function _checkPatternField(el) {
  if (el.value !== null && el.value !== '' && el.value !== undefined) {
    return (new RegExp(`^(${el.pattern})$`).test(el.value));
  }
  return true;
}

function _showError(el, type) {
  let _errEl = el.nextElementSibling;
  let _radioWrapper;
  let _blsSelectWrapper;
  let isCustomSelect = false;
  if (el.type === 'checkbox') _errEl = el.parentElement.nextElementSibling;
  if (el.type === 'radio') {
    _radioWrapper = el.parentElement;
    if (_radioWrapper.nodeName === 'LABEL') {
      _radioWrapper = el.parentElement.parentElement;
    }
    _errEl = _radioWrapper.nextElementSibling;
  }
  if (el.type.indexOf('select-') !== -1) {
    _blsSelectWrapper = el.parentElement;
    if (_blsSelectWrapper.classList.contains('bls-select')) {
      _errEl = _blsSelectWrapper.nextElementSibling;
      isCustomSelect = true;
    }
  }

  let _needCreateErrorElement = _errEl === null;

  if (_errEl !== null) {
    if (!_errEl.classList) _needCreateErrorElement = true;
  }

  if (_needCreateErrorElement) {
    _errEl = document.createElement('div');

    _errEl.classList.add('error');

    if (el.type === 'checkbox') {
      insertAfter(el.parentElement, _errEl);
    } else if (el.type === 'radio') {
      insertAfter(_radioWrapper, _errEl);
    } else if (isCustomSelect) {
      insertAfter(_blsSelectWrapper, _errEl);
    } else {
      insertAfter(el, _errEl);
    }
  }
  _errEl.innerText = el.dataset[`error${type}`];
  el.classList.remove('success');
  el.classList.add('invalid');
  if (el.type === 'checkbox') {
    el.parentElement.classList.add('invalid');
  }
  if (el.type === 'radio') {
    _radioWrapper.classList.add('invalid');
  }
  if (isCustomSelect) {
    _blsSelectWrapper.classList.add('invalid');
  }
}

function _showSuccess(el) {
  el.classList.remove('invalid');
  el.classList.add('success');
  let _errEl = el.nextElementSibling;

  if (el.type === 'checkbox') {
    el.parentElement.classList.remove('invalid');
  }

  let _radioWrapper;
  if (el.type === 'radio') {
    _radioWrapper = el.parentElement;
    if (_radioWrapper.nodeName === 'LABEL') {
      _radioWrapper = el.parentElement.parentElement;
    }
    _radioWrapper.classList.remove('invalid');
  }

  let _blsSelectWrapper;
  if (el.type.indexOf('select-') !== -1) {
    _blsSelectWrapper = el.parentElement;
    if (_blsSelectWrapper.classList.contains('bls-select')) {
      _errEl = _blsSelectWrapper.nextElementSibling;
      _blsSelectWrapper.classList.remove('invalid');
    }
  }

  if (el.type === 'checkbox') _errEl = el.parentElement.nextElementSibling;
  if (el.type === 'radio') _errEl = _radioWrapper.nextElementSibling;
  if (_errEl === null) return;
  _errEl.innerText = '';
}

function _doSubmit(instance) {
  if (typeof instance.setting.events.beforeDoSuccess === 'function') instance.setting.events.beforeDoSuccess(instance);
  if (typeof instance.setting.events.doSuccess === 'function') {
    instance.setting.events.doSuccess(instance);
  } else {
    instance.elements.form.submit();
  }
}

function _displayValidateResult(instance, isSubmitRequest) {
  const _instance = instance;

  if (_instance.data.errorRequires.length === 0 && _instance.data.errorPatterns.length === 0) {
    if (isSubmitRequest) {
      _doSubmit(instance);
    }
  } else {
    _instance.data.errorRequires.map(x => _showError(x, 'Require'));
    _instance.data.errorPatterns.map(x => _showError(x, 'Pattern'));
  }
}

function _checkAttribute(field, attribute) {
  if (attribute === 'required') {
    return field.getAttribute(attribute) !== null && field.getAttribute(attribute) !== undefined;
  }

  return field.getAttribute(attribute) !== null && field.getAttribute(attribute) !== undefined && field.getAttribute(attribute) !== '';
}

function _validateForm(instance, isSubmitRequest) {
  const _instance = instance;
  _instance.data.errorRequires = [];
  _instance.data.errorPatterns = [];

  _instance.elements.requires.map((x) => {
    if (_checkAttribute(x, 'required')) {
      if (!_checkRequireField(x, _instance)) {
        _instance.data.errorRequires.push(x);
      }
    }
    return x;
  });

  _instance.elements.patterns.map((x) => {
    if (_checkAttribute(x, 'pattern')) {
      if (!_checkPatternField(x)) {
        _instance.data.errorPatterns.push(x);
      }
    }
    return x;
  });

  _displayValidateResult(_instance, isSubmitRequest);
}

function _validateField(instance, field) {
  if (field.nodeName === 'INPUT' || field.nodeName === 'SELECT' || field.nodeName === 'TEXTAREA') {
    const _instance = instance;
    const _el = field;
    let _selector = field.dataset.refRequire;
    let _condition = field.dataset.refCondition;
    let _mess = field.dataset.refRequireMessage || 'This is required field';

    if (field.type === 'radio') {
      let _radioWrapper = field.parentElement;
      if (_radioWrapper.nodeName === 'LABEL') {
        _radioWrapper = field.parentElement.parentElement;
      }
      _selector = _radioWrapper.dataset.refRequire;
      _condition = _radioWrapper.dataset.refCondition;
      _mess = _radioWrapper.dataset.refRequireMessage || 'This is required field';
    }

    if (_checkAttribute(field, 'required')) {
      const _errorRequires = _instance.data.errorRequires.filter(x => x === field);

      if (!_checkRequireField(field, _instance)) {
        if (_errorRequires.length === 0) _instance.data.errorRequires.push(field);
      } else if (_errorRequires.length > 0) {
        const _newErrorRequires = _instance.data.errorRequires.filter(x => x !== field);
        _instance.data.errorRequires = _newErrorRequires;
        _showSuccess(field, _instance);
      } else {
        _showSuccess(field, _instance);
      }
    } else {
      const _errorRequires = _instance.data.errorRequires.filter(x => x === field);
      if (_errorRequires.length !== 0) {
        const _newErrorRequires = _instance.data.errorRequires.filter(x => x !== field);
        _instance.data.errorRequires = _newErrorRequires;
      }
      _showSuccess(field, _instance);
    }

    if (_checkAttribute(field, 'pattern')) {
      const _errorPatterns = _instance.data.errorPatterns.filter(x => x === field);
      if (!_checkPatternField(field)) {
        if (_errorPatterns.length === 0) {
          _instance.data.errorPatterns.push(field);
        }
      } else if (_errorPatterns.length) {
        const _newErrorPatterns = _instance.data.errorPatterns.filter(x => x !== field);
        _instance.data.errorPatterns = _newErrorPatterns;
        _showSuccess(field, _instance);
      }
    } else {
      _showSuccess(field, _instance);
    }

    if (_selector !== undefined && _selector !== '') {
      try {
        const _refEl = document.querySelector(_selector);
        if (_refEl !== null) {
          if (_el.value === _condition) {
            _refEl.required = true;
            _refEl.dataset.errorRequire = _mess;
            _instance.elements.requires.push(_refEl);
            _validateField(_instance, _refEl);
          } else {
            _refEl.required = false;
            _refEl.dataset.errorRequire = '';
            const _arr = [];
            _instance.elements.requires.map((x) => {
              if (x !== _refEl) {
                _arr.push(x);
              }
              return x;
            });
            _instance.elements.requires = _arr;
            _validateField(_instance, _refEl);
          }
        }
      } catch (error) {
        _displayValidateResult(_instance, false);
        return;
      }
    }

    _displayValidateResult(_instance, false);
  }
}

function _bindEvents(instance) {
  instance.elements.form.addEventListener('submit', (e) => {
    if (e.target === instance.elements.form) {
      e.preventDefault();
      e.stopPropagation();

      _validateForm(instance, true);
    }
  });

  instance.elements.form.addEventListener('input', (e) => {
    _validateField(instance, e.target);
  });

  instance.elements.form.addEventListener('focusout', (e) => {
    _validateField(instance, e.target);
  });

  instance.elements.form.addEventListener('change', (e) => {
    _validateField(instance, e.target);
  });
}

function _bindPublicMethod(instance) {
  const obj = instance;

  obj.validate = (isSubmitRequest) => {
    _validateForm(obj, isSubmitRequest);
  };
}

class ThpValidation {
  /**
   * Class constructor
   * @param {Object} setting setting for new instance plugin.
   * @param {String} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Object} setting.events Define callbacks for events.
   * @param {Function} setting.events.initialized Callback will fire when 1 instance installed
   * @param {Function} setting.events.initializedAll Callback will fire when ALL instances installed
  */
  constructor(setting) {
    const defaultSetting = {
      selector: 'form[data-thp-validation]',
      events: {
        initialized() {},
        initializedAll() {},
        beforeDoSuccess() {},
        // doSuccess() {},
        // doError() {},
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
    const els = getSelectors(setting.selector);

    els.map((x) => {
      const obj = {};
      const s = Object.assign({}, $this.setting, x.dataset || {});

      obj.setting = s;

      obj.elements = {
        form: x,
        requires: convertNodeListToArray(x.querySelectorAll('[required]')),
        patterns: convertNodeListToArray(x.querySelectorAll('[pattern]')),
      };

      obj.data = {
        errorRequires: [],
        errorPatterns: [],
      };

      // Avoid HTML5 buit-in validation
      x.setAttribute('novalidate', '');

      _bindEvents(obj);
      _bindPublicMethod(obj);
      $this.instances.push(obj);

      if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);
      return obj;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }
}

export default ThpValidation;
