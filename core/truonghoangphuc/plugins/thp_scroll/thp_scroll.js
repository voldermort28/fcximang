import Hammer from 'hammerjs';
import './thp_scroll.scss';
import {
  convertNodeListToArray, debounce, wrap, unWrap,
} from '../../utils';

const eventReachTop = new CustomEvent('thpScroll.ToTop', { bubbles: false, cancelable: false });
const eventReachBottom = new CustomEvent('thpScroll.ToBottom', { bubbles: false, cancelable: false });
const eventReachLeft = new CustomEvent('thpScroll.ToLeft', { bubbles: false, cancelable: false });
const eventReachRight = new CustomEvent('thpScroll.ToRight', { bubbles: false, cancelable: false });


function _calculateData(instance) {
  const _instance = instance;

  // ensure the origin has correct height to show full content
  if (_instance.setting.type === 'vertical' || _instance.setting.type === 'both') {
    const _wayLongV = _instance.elements.origin.offsetHeight - _instance.elements.container.offsetHeight;
    const _totalLinesV = Math.ceil(_wayLongV / _instance.setting.lineToScroll);
    const _topV = _instance.elements.container.offsetHeight - _totalLinesV;

    _instance.elements.thumbV.style.height = `${(_instance.elements.container.offsetHeight / _instance.elements.origin.offsetHeight) * _instance.elements.container.offsetHeight}px`;
    _instance.data.wayV = _wayLongV;
    _instance.data.topV = _topV;
    _instance.data.currentTop = 0;

    if (_instance.elements.thumbV.offsetHeight === _instance.elements.container.offsetHeight) {
      _instance.data.needVertical = false;
      _instance.elements.wrapper.classList.add('no-vertical');
    } else {
      _instance.data.needVertical = true;
      _instance.elements.wrapper.classList.remove('no-vertical');
    }
  }
  if (_instance.setting.type === 'horizontal' || _instance.setting.type === 'both') {
    const _wayLongH = _instance.elements.origin.offsetWidth - _instance.elements.container.offsetWidth;
    const _totalLinesH = Math.ceil(_wayLongH / _instance.setting.lineToScroll);
    const _leftH = _instance.elements.container.offsetWidth - _totalLinesH;

    _instance.elements.thumbH.style.width = `${(_instance.elements.container.offsetWidth / _instance.elements.origin.offsetWidth) * _instance.elements.container.offsetWidth}px`;
    _instance.data.wayH = _wayLongH;
    _instance.data.leftH = _leftH;
    _instance.data.currentLeft = 0;

    if (_instance.elements.thumbH.offsetWidth === _instance.elements.container.offsetWidth) {
      _instance.data.needHorizontal = false;
      _instance.elements.wrapper.classList.add('no-horizontal');
    } else {
      _instance.data.needHorizontal = true;
      _instance.elements.wrapper.classList.remove('no-horizontal');
    }
  }
}

function _buildUIScrollbar(instance) {
  const _instance = instance;

  if (_instance.setting.type === 'vertical' || _instance.setting.type === 'both') {
    const _barV = document.createElement('div');
    const _thumbV = document.createElement('div');

    _barV.className = 'thp-scroll__bar thp-scroll__bar--vertical';
    _thumbV.className = 'thp-scroll__thumb thp-scroll__thumb--vertical';

    _barV.appendChild(_thumbV);
    _instance.elements.wrapper.appendChild(_barV);
    _instance.elements.barV = _barV;
    _instance.elements.thumbV = _thumbV;
  }

  if (_instance.setting.type === 'horizontal' || _instance.setting.type === 'both') {
    const _barH = document.createElement('div');
    const _thumbH = document.createElement('div');

    _barH.className = 'thp-scroll__bar thp-scroll__bar--horizontal';
    _thumbH.className = 'thp-scroll__thumb thp-scroll__thumb--horizontal';

    _barH.appendChild(_thumbH);
    _instance.elements.wrapper.appendChild(_barH);
    _instance.elements.barH = _barH;
    _instance.elements.thumbH = _thumbH;
  }

  setTimeout(() => {
    _calculateData(_instance);
  }, 300);
}

function _buildUI(instance) {
  const _instance = instance;

  const wrapper = document.createElement('div');
  wrapper.className = _instance.setting.class || '';
  wrapper.classList.add('thp-scroll');
  wrapper.setAttribute('tabindex', 0);

  const scroll = document.createElement('div');
  scroll.className = _instance.setting.class || '';
  scroll.classList.add('thp-scroll__container');

  if (_instance.setting.type === 'vertical' || _instance.setting.type === 'both') {
    if (_instance.setting.height.includes('%')) {
      wrapper.style.height = `${_instance.setting.height}`;
    } else {
      wrapper.style.height = `${_instance.setting.height || 250}px`;
    }
  }

  if (_instance.setting.type === 'horizontal' || _instance.setting.type === 'both') {
    if (_instance.setting.width.includes('%')) {
      wrapper.style.width = `${_instance.setting.width}`;
    } else {
      wrapper.style.width = `${_instance.setting.width || 250}px`;
    }
  }

  if (window.app.Device.type === 'mobile') {
    wrapper.classList.add('thp-scroll__mobile');
  }

  wrap(scroll, _instance.elements.origin);
  wrap(wrapper, scroll);

  _instance.elements.container = scroll;
  _instance.elements.wrapper = wrapper;

  _instance.data.currentWidth = wrapper.offsetWidth;
  _instance.data.currentHeight = wrapper.offsetHeight;

  _buildUIScrollbar(_instance);
}

function _handleScrollVertical(instance, event, direction, pos) {
  const _instance = instance;
  if (_instance.setting.type === 'vertical' || _instance.setting.type === 'both') {
    if (pos !== undefined) {
      _instance.elements.container.scrollTop = pos;
    } else if (direction) {
      // debounce(() => {
      if (_instance.elements.container.scrollTop <= 0) {
        instance.elements.wrapper.dispatchEvent(eventReachTop);
        return;
      }
      _instance.elements.container.scrollTop -= _instance.setting.lineToScroll;
      // });
    } else {
      // debounce(() => {
      if (_instance.elements.container.scrollTop >= _instance.data.wayV) {
        instance.elements.wrapper.dispatchEvent(eventReachBottom);
        return;
      }
      _instance.elements.container.scrollTop += _instance.setting.lineToScroll;
      // });
    }
    _instance.elements.thumbV.style.top = `${_instance.elements.container.scrollTop * (_instance.elements.container.offsetHeight - _instance.elements.thumbV.offsetHeight) / _instance.data.wayV}px`;
  }
}

function _handleScrollHorizontal(instance, event, direction, pos) {
  const _instance = instance;
  if (_instance.setting.type === 'horizontal' || _instance.setting.type === 'both') {
    if (pos !== undefined) {
      _instance.elements.container.scrollLeft = pos;
    } else if (direction) {
      // debounce(() => {
      if (_instance.elements.container.scrollLeft <= 0) {
        instance.elements.wrapper.dispatchEvent(eventReachLeft);
        return;
      }
      _instance.elements.container.scrollLeft -= _instance.setting.lineToScroll;
      // });
    } else {
      // debounce(() => {
      if (_instance.elements.container.scrollLeft >= _instance.data.wayH) {
        instance.elements.wrapper.dispatchEvent(eventReachRight);
        return;
      }
      _instance.elements.container.scrollLeft += _instance.setting.lineToScroll;
      // });
    }
    _instance.elements.thumbH.style.left = `${_instance.elements.container.scrollLeft * (_instance.elements.container.offsetWidth - _instance.elements.thumbH.offsetWidth) / _instance.data.wayH}px`;
  }
}

const _handleWheel = (instance, e) => {
  if (e.currentTarget === instance.elements.wrapper) {
    if (window.app.Device.type === 'pc') {
      // e.preventDefault();
      if (e.deltaY < 0) {
        _handleScrollVertical(instance, e, 1);
      } else if (e.deltaY > 0) {
        _handleScrollVertical(instance, e, 0);
      }
      if (e.deltaX < 0) {
        _handleScrollHorizontal(instance, e, 1);
      } else if (e.deltaX > 0) {
        _handleScrollHorizontal(instance, e, 0);
      }
      if (instance.elements.thumbV !== undefined) {
        if (instance.elements.container.scrollTop < instance.data.wayV && instance.elements.container.scrollTop > 0) {
          e.preventDefault();
        }
      }
      if (instance.elements.thumbH !== undefined) {
        if (instance.elements.container.scrollLeft < instance.data.wayH && instance.elements.container.scrollLeft > 0) {
          e.preventDefault();
        }
      }
    }
  }
  return true;
};

const _handleKeydown = (instance, e) => {
  if (e.currentTarget === instance.elements.wrapper) {
    if (window.app.Device.type === 'pc') {
      // e.preventDefault();
      switch (e.keyCode) {
        case 35:
          if (instance.elements.thumbH !== undefined) {
            instance.scrollToRight();
          }
          if (instance.elements.thumbV !== undefined) {
            instance.scrollToBottom();
          }
          e.preventDefault();
          break;
        case 36:
          if (instance.elements.thumbH !== undefined) {
            instance.scrollToLeft();
          }
          if (instance.elements.thumbV !== undefined) {
            instance.scrollToTop();
          }
          e.preventDefault();
          break;
        case 37:
          _handleScrollHorizontal(instance, e, 1);
          if (instance.elements.thumbH !== undefined) {
            if (instance.elements.container.scrollLeft < instance.data.wayH && instance.elements.container.scrollLeft > 0) {
              e.preventDefault();
            }
          }
          break;
        case 38:
          _handleScrollVertical(instance, e, 1);
          if (instance.elements.thumbV !== undefined) {
            if (instance.elements.container.scrollTop < instance.data.wayV && instance.elements.container.scrollTop > 0) {
              e.preventDefault();
            }
          }
          break;
        case 39:
          _handleScrollHorizontal(instance, e, 0);
          if (instance.elements.thumbH !== undefined) {
            if (instance.elements.container.scrollLeft < instance.data.wayH && instance.elements.container.scrollLeft > 0) {
              e.preventDefault();
            }
          }
          break;
        case 40:
          _handleScrollVertical(instance, e, 0);
          if (instance.elements.thumbV !== undefined) {
            if (instance.elements.container.scrollTop < instance.data.wayV && instance.elements.container.scrollTop > 0) {
              e.preventDefault();
            }
          }
          break;
        default:
          break;
      }
    }
  }
  return true;
};

const _resizeHandle = (instance) => {
  if (instance.elements.wrapper.offsetWidth !== instance.data.currentWidth || instance.elements.wrapper.offsetHeight !== instance.data.currentHeight) {
    debounce(_calculateData(instance));
  }
};

function _bindEvents(instance) {
  const _instance = instance;
  const _verticalScroll = {
    x: 0,
    y: 0,
    isDragging: false,
  };
  const _horizontalScroll = {
    x: 0,
    y: 0,
    isDragging: false,
  };

  const _endDrag = (type) => {
    type.isDragging = false;
  };

  const _startDrag = (element, type) => {
    type.isDragging = true;
    type.x = element.offsetLeft;
    type.y = element.offsetTop;
  };

  const _handleDragV = (event) => {
    const _thumbV = _instance.elements.thumbV;
    if (!_verticalScroll.isDragging) {
      _startDrag(_thumbV, _verticalScroll);
    }

    if (_verticalScroll.y >= 0 && _verticalScroll.y <= _instance.elements.container.offsetHeight - _instance.elements.thumbV.offsetHeight) {
      const posX = _verticalScroll.x;
      let posY = event.deltaY + _verticalScroll.y;
      if (posY < 0) posY = 0;
      if (posY > _instance.elements.container.offsetHeight - _instance.elements.thumbV.offsetHeight) posY = _instance.elements.container.offsetHeight - _instance.elements.thumbV.offsetHeight;
      _thumbV.style.left = `${posX}px`;
      _thumbV.style.top = `${posY}px`;
      _instance.elements.container.scrollTop = _instance.data.wayV * posY / (_instance.elements.container.offsetHeight - _instance.elements.thumbV.offsetHeight);
    }

    if (event.isFinal) {
      _endDrag(_verticalScroll);
    }
  };

  const _handlePressV = () => {
    _endDrag(_verticalScroll);
  };

  const _handlePressUpV = () => {
    _endDrag(_verticalScroll);
  };

  const _handleDragH = (event) => {
    const _thumbH = _instance.elements.thumbH;
    if (!_thumbH.isDragging) {
      _startDrag(_thumbH, _horizontalScroll);
    }

    if (_horizontalScroll.x >= 0 && _horizontalScroll.x <= _instance.elements.container.offsetWidth - _instance.elements.thumbH.offsetWidth) {
      let posX = event.deltaX + _horizontalScroll.x;
      // console.log(event.deltaX);
      const posY = _horizontalScroll.y;

      if (posX < 0) posX = 0;
      if (posX > _instance.elements.container.offsetWidth - _instance.elements.thumbH.offsetWidth) posX = _instance.elements.container.offsetWidth - _instance.elements.thumbH.offsetWidth;

      _thumbH.style.left = `${posX}px`;
      _thumbH.style.top = `${posY}px`;
      _instance.elements.container.scrollLeft = _instance.data.wayH * posX / (_instance.elements.container.offsetWidth - _instance.elements.thumbH.offsetWidth);
    }
    if (event.isFinal) {
      _endDrag(_horizontalScroll);
    }
  };

  const _handlePressH = () => {
    _endDrag(_horizontalScroll);
  };

  const _handlePressUpH = () => {
    _endDrag(_horizontalScroll);
  };
  if (window.thpScroll !== undefined) {
    window.thpScroll.map((x) => {
      if (x.element === instance.elements.origin) {
        _instance.elements.wrapper.removeEventListener('wheel', x.handleWheel);
        _instance.elements.wrapper.addEventListener('wheel', x.handleWheel);
        _instance.elements.wrapper.removeEventListener('keydown', x.handleKeydown);
        _instance.elements.wrapper.addEventListener('keydown', x.handleWheel);
        window.removeEventListener('resize', x.resizeHandle);
        window.addEventListener('resize', x.resizeHandle);
        if (_instance.setting.type === 'vertical' || _instance.setting.type === 'both') {
          x.mcV = new Hammer(instance.elements.barV);
          x.mcV.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
          x.mcV.add(new Hammer.Press({ time: 0 }));

          x.mcV.on('pan', _handleDragV);
          x.mcV.on('press', _handlePressV);
          x.mcV.on('pressup', _handlePressUpV);
        }

        if (_instance.setting.type === 'horizontal' || _instance.setting.type === 'both') {
          x.mcH = new Hammer(instance.elements.barH);
          x.mcH.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
          x.mcH.add(new Hammer.Press({ time: 0 }));

          x.mcH.on('pan', _handleDragH);
          x.mcH.on('press', _handlePressH);
          x.mcH.on('pressup', _handlePressUpH);
        }
      }
      return x;
    });
  } else {
    _instance.elements.wrapper.addEventListener('wheel', () => _handleWheel(instance));
    _instance.elements.wrapper.addEventListener('keydown', e => _handleKeydown(instance, e));
    window.addEventListener('resize', () => _resizeHandle(instance));
    if (_instance.setting.type === 'vertical' || _instance.setting.type === 'both') {
      _instance.mcV = new Hammer(instance.elements.barV);
      _instance.mcV.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
      _instance.mcV.add(new Hammer.Press({ time: 0 }));

      _instance.mcV.on('pan', _handleDragV);
      _instance.mcV.on('press', _handlePressV);
      _instance.mcV.on('pressup', _handlePressUpV);
    }

    if (_instance.setting.type === 'horizontal' || _instance.setting.type === 'both') {
      _instance.mcH = new Hammer(instance.elements.barH);
      _instance.mcH.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
      _instance.mcH.add(new Hammer.Press({ time: 0 }));

      _instance.mcH.on('pan', _handleDragH);
      _instance.mcH.on('press', _handlePressH);
      _instance.mcH.on('pressup', _handlePressUpH);
    }
  }

  // _instance.elements.wrapper.addEventListener('wheel', (e) => {
  //   if (e.currentTarget === _instance.elements.wrapper) {
  //     if (window.app.Device.type === 'pc') {
  //       // e.preventDefault();
  //       if (e.deltaY < 0) {
  //         _handleScrollVertical(instance, e, 1);
  //       } else if (e.deltaY > 0) {
  //         _handleScrollVertical(instance, e, 0);
  //       }
  //       if (e.deltaX < 0) {
  //         _handleScrollHorizontal(instance, e, 1);
  //       } else if (e.deltaX > 0) {
  //         _handleScrollHorizontal(instance, e, 0);
  //       }
  //       if (_instance.elements.thumbV !== undefined) {
  //         if (_instance.elements.container.scrollTop < _instance.data.wayV && _instance.elements.container.scrollTop > 0) {
  //           e.preventDefault();
  //         }
  //       }
  //       if (_instance.elements.thumbH !== undefined) {
  //         if (_instance.elements.container.scrollLeft < _instance.data.wayH && _instance.elements.container.scrollLeft > 0) {
  //           e.preventDefault();
  //         }
  //       }
  //     }
  //   }
  //   return true;
  // });

  // _instance.elements.wrapper.addEventListener('keydown', (e) => {
  //   if (e.currentTarget === _instance.elements.wrapper) {
  //     if (window.app.Device.type === 'pc') {
  //       // e.preventDefault();
  //       switch (e.keyCode) {
  //         case 35:
  //           if (_instance.elements.thumbH !== undefined) {
  //             _instance.scrollToRight();
  //           }
  //           if (_instance.elements.thumbV !== undefined) {
  //             _instance.scrollToBottom();
  //           }
  //           e.preventDefault();
  //           break;
  //         case 36:
  //           if (_instance.elements.thumbH !== undefined) {
  //             _instance.scrollToLeft();
  //           }
  //           if (_instance.elements.thumbV !== undefined) {
  //             _instance.scrollToTop();
  //           }
  //           e.preventDefault();
  //           break;
  //         case 37:
  //           _handleScrollHorizontal(instance, e, 1);
  //           if (_instance.elements.thumbH !== undefined) {
  //             if (_instance.elements.container.scrollLeft < _instance.data.wayH && _instance.elements.container.scrollLeft > 0) {
  //               e.preventDefault();
  //             }
  //           }
  //           break;
  //         case 38:
  //           _handleScrollVertical(instance, e, 1);
  //           if (_instance.elements.thumbV !== undefined) {
  //             if (_instance.elements.container.scrollTop < _instance.data.wayV && _instance.elements.container.scrollTop > 0) {
  //               e.preventDefault();
  //             }
  //           }
  //           break;
  //         case 39:
  //           _handleScrollHorizontal(instance, e, 0);
  //           if (_instance.elements.thumbH !== undefined) {
  //             if (_instance.elements.container.scrollLeft < _instance.data.wayH && _instance.elements.container.scrollLeft > 0) {
  //               e.preventDefault();
  //             }
  //           }
  //           break;
  //         case 40:
  //           _handleScrollVertical(instance, e, 0);
  //           if (_instance.elements.thumbV !== undefined) {
  //             if (_instance.elements.container.scrollTop < _instance.data.wayV && _instance.elements.container.scrollTop > 0) {
  //               e.preventDefault();
  //             }
  //           }
  //           break;
  //         default:
  //           break;
  //       }
  //     }
  //   }
  //   return true;
  // }, true);

  // _instance.data.scrolling = false;
  // _instance.elements.container.addEventListener('scroll', () => {
  //   if (!_instance.data.scrolling) {
  //     debounce(() => {
  //       _instance.data.scrolling = false;
  //     });
  //     _instance.data.scrolling = true;
  //   }
  // });

  // window.addEventListener('resize', () => {
  //   if (_instance.elements.wrapper.offsetWidth !== _instance.data.currentWidth || _instance.elements.wrapper.offsetHeight !== _instance.data.currentHeight) {
  //     debounce(_calculateData(instance));
  //   }
  // });
}

function _buildPublicMethod(instance) {
  instance.scrollTop = () => instance.elements.container.scrollTop;
  instance.scrollLeft = () => instance.elements.container.scrollLeft;

  instance.scrollTo = (left, top) => {
    // instance.elements.container.scrollTo({
    //   left,
    //   top,
    //   behavior: 'smooth',
    // });
    let _t = top;
    if (_t > instance.data.wayV) _t = instance.data.wayV;
    const _stepT = Math.abs(Math.ceil(_t - instance.elements.container.scrollTop) / instance.setting.lineToScroll);
    let _stepTC = 0;
    const _d = instance.elements.container.scrollTop > _t ? 0 : 1;
    const t = setInterval(() => {
      if (_stepTC < _stepT) {
        _stepTC += 1;
        _handleScrollVertical(instance, null, _d, instance.elements.container.scrollTop + (_d === 0 ? instance.setting.lineToScroll * -1 : instance.setting.lineToScroll));
      } else {
        clearInterval(t);
      }
    }, (15 / 60));

    let _l = left;
    if (_l > instance.data.wayH) _l = instance.data.wayH;
    const _stepL = Math.abs(Math.ceil(_l - instance.elements.container.scrollLeft) / instance.setting.lineToScroll);
    let _stepLC = 0;
    const _dl = instance.elements.container.scrollTop > _l ? 0 : 1;
    const l = setInterval(() => {
      if (_stepLC < _stepL) {
        _stepLC += 1;
        _handleScrollHorizontal(instance, null, _dl, instance.elements.container.scrollLeft + (_dl === 0 ? instance.setting.lineToScroll * -1 : instance.setting.lineToScroll));
      } else {
        clearInterval(l);
      }
    }, (15 / 60));
  };

  instance.scrollToTop = () => {
    const t = setInterval(() => {
      if (instance.elements.container.scrollTop > 0) {
        _handleScrollVertical(instance, null, 1);
      } else {
        clearInterval(t);
        instance.elements.wrapper.dispatchEvent(eventReachTop);
      }
    }, (15 / 60));
  };

  instance.scrollToBottom = () => {
    // instance.elements.container.scrollTo({
    //   top: instance.data.wayV,
    // });
    const t = setInterval(() => {
      if (instance.elements.container.scrollTop < instance.data.wayV) {
        _handleScrollVertical(instance, null, 0);
      } else {
        clearInterval(t);
        instance.elements.wrapper.dispatchEvent(eventReachBottom);
      }
    }, (15 / 60));
    // instance.elements.thumbV.style.top = `${instance.elements.container.scrollTop * (instance.elements.container.offsetHeight - instance.elements.thumbV.offsetHeight) / instance.data.wayV}px`;
  };

  instance.scrollToLeft = () => {
    const t = setInterval(() => {
      if (instance.elements.container.scrollLeft > 0) {
        _handleScrollHorizontal(instance, null, 1);
      } else {
        clearInterval(t);
        instance.elements.wrapper.dispatchEvent(eventReachLeft);
      }
    }, (15 / 60));
  };

  instance.scrollToRight = () => {
    const t = setInterval(() => {
      if (instance.elements.container.scrollLeft < instance.data.wayH) {
        _handleScrollHorizontal(instance, null, 0);
      } else {
        clearInterval(t);
        instance.elements.wrapper.dispatchEvent(eventReachRight);
      }
    }, (15 / 60));
    // instance.elements.thumbV.style.top = `${instance.elements.container.scrollTop * (instance.elements.container.offsetHeight - instance.elements.thumbV.offsetHeight) / instance.data.wayV}px`;
  };

  instance.update = () => {
    _calculateData(instance);
  };

  instance.addEventListener = (event, fn) => {
    if (instance.elements.wrapper !== undefined) instance.elements.wrapper.addEventListener(event, fn);
  };

  instance.destroy = () => {
    const _arr = [];
    window.thpScroll.map((x) => {
      if (x.element === instance.elements.origin) {
        instance.elements.wrapper.removeEventListener('wheel', x.handleWheel);
        instance.elements.wrapper.removeEventListener('keydown', x.handleKeydown);
        window.removeEventListener('reize', x.resizeHandle);
        if (x.mcH) x.mcH.destroy();
        if (x.mcV) x.mcV.destroy();

        if (instance.elements.barV !== undefined) instance.elements.wrapper.removeChild(instance.elements.barV);
        if (instance.elements.barH !== undefined) instance.elements.wrapper.removeChild(instance.elements.barH);
        unWrap(instance.elements.container);
        unWrap(instance.elements.wrapper);
      } else {
        _arr.push(x);
      }
      return x;
    });

    window.thpScroll = _arr;
  };
}

class ThpScroll {
  /**
   * Class constructor
   * @param {Object} setting setting for new instance plugin.
   * @param {String} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {String} setting.backColor Color for scrollbar - default is transparent
   * @param {String} setting.thumbColor Color for scroll's thumb - default is #adb5bd
   * @param {Object} setting.events Define callbacks for events.
   * @param {Function} setting.events.initialized Callback will fire when 1 instance installed
   * @param {Function} setting.events.initializedAll Callback will fire when ALL instances installed
  */
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-thp-scroll]',
      // backColor: 'rgba(0,0,0,0)',
      // thumbColor: '#adb5bd',
      type: 'vertical',
      height: '250',
      width: '250',
      lineToScroll: 10,
      thumbSize: 'dynamic',
      events: {
        initialized() {},
        initializedAll() {},
        beforeScroll() {},
        afterScroll() {},
        afterResize() {},
      },
    };

    const s = Object.assign({}, defaultSetting, setting || {});
    s.lineToScroll = parseInt(s.lineToScroll, 0);
    this.setting = s;
    this.instances = [];
    this.init(s);

    return this.instances;
  }

  init(setting) {
    const $this = this;
    const els = convertNodeListToArray(document.querySelectorAll(setting.selector));
    if (window.thpScroll === undefined) window.thpScroll = [];
    els.map((x) => {
      const _f = window.thpScroll.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = {};
        const s = Object.assign({}, $this.setting, x.dataset || {});
        s.lineToScroll = parseInt(s.lineToScroll, 0);

        obj.setting = s;

        obj.elements = {
          origin: x,
        };

        obj.data = {};

        let initScroll = false;

        if (obj.setting.type === 'vertical' || obj.setting.type === 'both') {
          if (obj.setting.height.includes('%')) {
            initScroll = x.offsetHeight > parseFloat(x.parentElement.offsetHeight * parseFloat(obj.setting.height) / 100);
          } else {
            initScroll = x.offsetHeight > parseFloat(obj.setting.height);
          }
        }

        if (obj.setting.type === 'horizontal' || obj.setting.type === 'both') {
          if (obj.setting.width.includes('%')) {
            initScroll = x.offsetWidth > parseFloat(x.parentElement.offsetWidth * parseFloat(obj.setting.width) / 100);
          } else {
            initScroll = x.offsetWidth > parseFloat(obj.setting.width);
          }
        }

        if (initScroll) {
          window.thpScroll.push({
            element: x,
            handleWheel: _handleWheel.bind(null, obj),
            resizeHandle: _resizeHandle.bind(null, obj),
          });

          _buildUI(obj);
          _bindEvents(obj);
          _buildPublicMethod(obj);
          $this.instances.push(obj);

          if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);
        } else {
          x.classList.add('no-thp-scroll');
        }
        return obj;
      }
      return x;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll(els);
  }
}

export default ThpScroll;
