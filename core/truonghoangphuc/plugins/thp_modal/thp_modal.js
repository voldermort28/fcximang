import './thp_modal.scss';

import {
  convertNodeListToArray, getScrollbarWidth, ajaxRequest, loadTemplate, processTemplate,
} from '../../utils';

const _classModalBody = 'thp-modal__body';
const _classModalHeader = 'thp-modal__header';
const _classClose = 'thp-btn__close';

function _removeEffectInScene(instance) {
  instance.elements.modalContent.classList.add('stop-transition');
}

function _addEffectInScene(instance) {
  instance.elements.modalContent.classList.remove('stop-transition');
}

function _loading(instance) {
  instance.elements.modalContent.classList.add('loading');
}

function _loaded(instance) {
  instance.elements.modalContent.classList.remove('loading');
}

function _closeModal(instance) {
  if (instance.elements.modal.classList.contains('shown')) {
    if (typeof instance.setting.events.beforeClose === 'function') instance.setting.events.beforeClose(instance);

    instance.elements.modal.classList.add('closing');
    if (!instance.setting.effectOut || instance.setting.effectOut === instance.setting.effectIn) {
      instance.elements.modalContent.classList.remove('shown');
    }
  }
}

function _loadAjax(instance) {
  if (typeof instance.setting.events.beforeContentLoad === 'function') instance.setting.events.beforeContentLoad(instance);
  _loading(instance);

  const ajaxEl = document.createElement('div');
  ajaxEl.classList.add('ajax-content');

  const _ajaxProcess = (async function _asyncProcess() {
    try {
      const content = await ajaxRequest({
        method: 'GET',
        url: instance.setting.target,
      });
      if (instance.setting.template) {
        const template = await loadTemplate(instance.setting.template);
        if (template !== '') {
          const html = processTemplate(template, JSON.parse(content));
          instance.elements.modalContent.classList.add('resizing');
          ajaxEl.innerHTML = html;
          _loaded(instance);
          if (typeof instance.setting.events.afterContentLoad === 'function') instance.setting.events.afterContentLoad(instance);
        } else {
          instance.elements.modalContent.classList.add('resizing');
          ajaxEl.innerHTML = content;
          _loaded(instance);
          if (typeof instance.setting.events.afterContentLoad === 'function') instance.setting.events.afterContentLoad(instance);
        }
      } else {
        instance.elements.modalContent.classList.add('resizing');
        ajaxEl.innerHTML = content;
        _loaded(instance);
        if (typeof instance.setting.events.afterContentLoad === 'function') instance.setting.events.afterContentLoad(instance);
      }
    } catch (error) {
      console.log(error);
      if (typeof instance.setting.events.afterContentLoad === 'function') instance.setting.events.afterContentLoad(instance, error);
    }
  });

  _ajaxProcess();
  if (instance.setting.contentTarget === null) {
    instance.elements.modalContent.querySelector(`.${_classModalBody}`).appendChild(ajaxEl);
  } else {
    instance.elements.modalContent.querySelector(`.${instance.setting.contentTarget}`).appendChild(ajaxEl);
  }
}

function _loadIFrame(instance) {
  if (typeof instance.setting.events.beforeContentLoad === 'function') instance.setting.events.beforeContentLoad(instance);

  _loading(instance);

  const iframe = document.createElement('iframe');
  iframe.src = instance.setting.target;
  iframe.setAttribute('allowfullscreen', '');
  iframe.onload = function iframeLoad() {
    _loaded(instance);
    if (typeof instance.setting.events.afterContentLoad === 'function') instance.setting.events.afterContentLoad(instance);
  };

  // instance.elements.modalContent.querySelector(`.${_classModalBody}`).appendChild(iframe);
  if (instance.setting.contentTarget === null) {
    instance.elements.modalContent.querySelector(`.${_classModalBody}`).appendChild(iframe);
  } else {
    instance.elements.modalContent.querySelector(`.${instance.setting.contentTarget}`).appendChild(iframe);
  }
}

function _openModal(instance) {
  if (!instance.elements.modal.classList.contains('shown')) {
    if (typeof instance.setting.events.beforeOpen === 'function') instance.setting.events.beforeOpen(instance);

    switch (instance.setting.type) {
      case 'iframe':
        // Check iframe existing?
        if (instance.elements.modalContent && !instance.elements.modalContent.querySelector('iframe')) {
          _loadIFrame(instance);
          instance.elements.modal.classList.add('opening');
          instance.elements.modal.classList.add('shown');
        } else if (instance.elements.modalContent.querySelector('iframe')) {
          instance.elements.modal.classList.add('opening');
          instance.elements.modal.classList.add('shown');
        }
        break;
      case 'ajax':
        if (instance.elements.modalContent && !instance.elements.modalContent.querySelector('.ajax-content')) {
          _loadAjax(instance);
          instance.elements.modal.classList.add('opening');
          instance.elements.modal.classList.add('shown');
        } else if (instance.elements.modalContent.querySelector('.ajax-content')) {
          instance.elements.modal.classList.add('opening');
          instance.elements.modal.classList.add('shown');
        }
        break;
      case 'video':
        break;
      default: // inner
        instance.elements.modal.classList.add('opening');
        instance.elements.modal.classList.add('shown');
    }
  }
}

function _buildTargetUI(instance, index) {
  const clone = instance;

  if (!clone.elements.modal) {
    const modal = document.createElement('div');
    modal.classList.add(
      'thp-modal',
      `thp-modal-${index}`,
      `thp-modal--${clone.setting.type}`,
    );
    if (clone.setting.scrollOverlay) modal.classList.add('thp-modal--scroll');
    const modalContent = document.createElement('div');
    modalContent.classList.add('thp-modal__instance');

    if (clone.setting.close) {
      const html = `<div class="${_classModalHeader}"><a class="${_classClose}" href="javascript:void" title="Close"></a></div><div class=${_classModalBody}></div>`;
      modalContent.innerHTML = html;
    }

    modal.appendChild(modalContent);

    document.body.appendChild(modal);
    clone.elements.modal = modal;
  }
}

const _openHandle = (instance, e) => {
  e.stopPropagation();
  e.preventDefault();
  if (e.target === instance.elements.btn) {
    _openModal(instance);
  }
};

const _closeOverlayHandle = (instance, e) => {
  e.preventDefault();
  e.stopPropagation();

  if (instance.setting.overlay) {
    if (e.target === instance.elements.modal) _closeModal(instance);
  }
};

const _closeHandle = (instance, e) => {
  e.preventDefault();
  e.stopPropagation();

  _closeModal(instance);
};

const _modalHandle = (instance, e) => {
  const _setting = instance.setting;
  e.preventDefault();
  e.stopPropagation();

  if (instance.elements.modal.classList.contains('closing')) {
    setTimeout(() => {
      if (_setting.effectOut && (_setting.effectOut !== _setting.effectIn)) {
        instance.elements.modalContent.classList.remove(`out-${_setting.effectOut}`);
        _addEffectInScene(instance);
      }
      document.body.classList.remove('thp-modal--open');
      document.body.style.paddingRight = `${0}px`;
      instance.elements.modal.classList.remove('closing');
      if (typeof _setting.events.afterClose === 'function') _setting.events.afterClose(instance);
    }, 1);
  }

  if (instance.elements.modal.classList.contains('opening')) {
    setTimeout(() => {
      instance.elements.modalContent.classList.add('shown');

      if (_setting.effectOut && (_setting.effectOut !== _setting.effectIn)) {
        instance.elements.modalContent.classList.add(`out-${_setting.effectOut}`);
      }
    }, 1);
  }
};

const _contentHandle = (instance, e) => {
  const _setting = instance.setting;
  e.preventDefault();
  e.stopPropagation();

  if (e.target === instance.elements.modalContent) {
    if (instance.elements.modal.classList.contains('closing')) {
      if (_setting.effectOut && (_setting.effectOut !== _setting.effectIn)) {
        _removeEffectInScene(instance);
        instance.elements.modalContent.classList.remove('shown');
        instance.elements.modal.classList.remove('shown');
      } else {
        instance.elements.modal.classList.remove('shown');
      }
    }

    if (instance.elements.modal.classList.contains('opening')) {
      document.body.classList.add('thp-modal--open');
      document.body.style.paddingRight = `${getScrollbarWidth()}px`;
      instance.elements.modal.classList.remove('opening');
      if (typeof _setting.events.afterOpen === 'function') _setting.events.afterOpen(instance);
    }

    if (instance.elements.modalContent.classList.contains('resizing')) {
      instance.elements.modalContent.classList.remove('resizing');
    }
  }
};

function _bindMethodClickOpen(instance) {
  if (window.thpModal !== undefined) {
    window.thpModal.map((x) => {
      if (x.element === instance.elements.btn) {
        instance.elements.btn.removeEventListener('click', x.openHandle);
        instance.elements.btn.addEventListener('click', x.openHandle);
      }
    });
  } else {
    instance.elements.btn.addEventListener('click', e => _openHandle(instance, e));
  }
}

function _buildEvents(instance) {
  if (window.thpModal !== undefined) {
    window.thpModal.map((x) => {
      if (x.element === instance.elements.btn) {
        instance.elements.modal.removeEventListener('click', x.closeOverlayHandle);
        instance.elements.modal.addEventListener('click', x.closeOverlayHandle);
        instance.elements.close.map((close) => {
          close.removeEventListener('click', x.closeHandle);
          close.addEventListener('click', x.closeHandle);
          return close;
        });
        instance.elements.modal.removeEventListener('transitionend', x.modalHandle);
        instance.elements.modal.addEventListener('transitionend', x.modalHandle);
        instance.elements.modalContent.removeEventListener('transitionend', x.contentHandle);
        instance.elements.modalContent.addEventListener('transitionend', x.contentHandle);
      }
      return x;
    });
  } else {
    instance.elements.modal.addEventListener('click', e => _closeOverlayHandle(instance, e));
    instance.elements.close.map(close => close.addEventListener('click', e => _closeHandle(instance, e)));
    instance.elements.modal.addEventListener('transitionend', e => _modalHandle(instance, e));
    instance.elements.modalContent.addEventListener('transitionend', e => _contentHandle(instance, e));
  }
}

function _buildPublicMethod(instance) {
  instance.open = () => {
    if (instance.elements.btn) {
      instance.elements.btn.click();
    }
  };

  instance.close = () => {
    if (instance.elements.close) {
      instance.elements.close[0].click();
    }
  };

  instance.loadAjax = () => {
    _loadAjax(instance);
  };

  instance.loadIFrame = () => {
    _loadIFrame(instance);
  };

  instance.destroy = () => {
    const _arr = [];
    window.thpModal.map((x) => {
      if (x.element === instance.elements.btn) {
        instance.elements.btn.removeEventListener('click', x.openHandle);
        instance.elements.modal.removeEventListener('click', x.closeOverlayHandle);
        instance.elements.close.map((close) => {
          close.removeEventListener('click', x.closeHandle);
          return close;
        });
        instance.elements.modal.removeEventListener('transitionend', x.modalHandle);
        instance.elements.modalContent.removeEventListener('transitionend', x.contentHandle);
        instance.elements.modal.parentElement.removeChild(instance.elements.modal);
      } else {
        _arr.push(x);
      }
      return x;
    });
    window.thpModal = _arr;
  };
}

class ThpModal {
  /**
   * Class constructor
   * @param {Object} setting setting for new instance plugin.
   * @param {String} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {String=} setting.type Type of modal, support: inner, iframe, ajax, video
   * @param {String=} setting.display Mode alignment of modal, support: fix, center, fullscreen
   * @param {Boolean=} setting.overlay True: close when click on overlay
   * @param {Boolean=} setting.scrollOverlay True: show scrollbar when modal longer than screen
   * @param {Boolean=} setting.close True: show close button
   * @param {String=} setting.effectIn Animation effect of modal when open, support: fade, slidetop, slidebottom
   * @param {String=} setting.effectOut Animation effect of modal when close, support: fade, slidetop, slidebottom
   * @param {Object} setting.events Define callbacks for events.
   * @param {Function} setting.events.initialized Callback will fire when 1 instance installed
   * @param {Function} setting.events.initializedAll Callback will fire when ALL instances installed
   * @param {Function} setting.events.beforeOpen Callback will fire before modal instance open
   * @param {Function} setting.events.afterOpen Callback will fire before modal instance open
   * @param {Function} setting.events.beforeClose Callback will fire before modal instance open
   * @param {Function} setting.events.afterClose Callback will fire before modal instance open
   * @param {Function} setting.events.beforeAnimation Callback will fire before modal instance open
   * @param {Function} setting.events.afterAnimation Callback will fire before modal instance open
   * @param {Function} setting.events.beforeContentLoad Callback will fire before modal instance open
   * @param {Function} setting.events.afterContentLoad Callback will fire before modal instance open
  */
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-thp-modal]',
      type: 'inner',
      display: 'fix',
      overlay: true,
      scrollOverlay: true,
      close: true,
      effectIn: 'fade',
      contentTarget: null,
      events: {
        initialized() {},
        initializedAll() {},
        beforeOpen() {},
        afterOpen() {},
        beforeClose() {},
        afterClose() {},
        beforeAnimation() {},
        afterAnimation() {},
        beforeContentLoad() {},
        afterContentLoad() {},
        afterContentLoadFail() {},
      },
    };

    const s = Object.assign({}, defaultSetting, setting || {});

    this.setting = s;
    this.instances = [];
    this.init(s);

    return this.instances;
  }

  init(setting) {
    // console.log(setting);
    const $this = this;
    const els = convertNodeListToArray(document.querySelectorAll(setting.selector));
    if (window.thpModal === undefined) window.thpModal = [];

    // buildBackdrop();
    const _totalModal = document.querySelectorAll('.thp-modal').length;
    els.map((x, index) => {
      const _f = window.thpModal.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = {};
        // redefine setting for each instance here
        const s = Object.assign({}, $this.setting, x.dataset || {});

        obj.setting = s;

        obj.elements = {
          btn: x,
          modal: obj.setting.type === 'inner' ? document.querySelector(obj.setting.target) : null,
        };

        window.thpModal.push({
          element: x,
          openHandle: _openHandle.bind(null, obj),
          closeOverlayHandle: _closeOverlayHandle.bind(null, obj),
          closeHandle: _closeHandle.bind(null, obj),
          modalHandle: _modalHandle.bind(null, obj),
          contentHandle: _contentHandle.bind(null, obj),
        });

        if (!obj.elements.modal) _buildTargetUI(obj, _totalModal + index);

        if (obj.elements.modal) {
          [obj.elements.modalContent] = obj.elements.modal.children;
          obj.elements.modalContent.classList.add(obj.setting.effectIn, obj.setting.display);

          obj.elements.close = convertNodeListToArray(obj.elements.modal.querySelectorAll(`.${_classClose}`));

          _buildEvents(obj);
        }


        // Default behaviour
        _bindMethodClickOpen(obj);

        // Define public methods
        _buildPublicMethod(obj);

        $this.instances.push(obj);
        if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);

        return obj;
      }
      return x;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }
}

export default ThpModal;
