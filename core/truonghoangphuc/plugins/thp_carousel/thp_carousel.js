import Hammer from 'hammerjs';

import './thp_carousel.scss';
import {
  convertNodeListToArray, wrap, prepend, debounce, unWrap,
} from '../../utils';
import thpLazyElement from '../thp_lazy/thp_lazy';

function _calculateUI(instance) {
  if (instance.setting.width) {
    instance.elements.wrapper.style.width = instance.setting.width;
  }

  const _itemWidth = (instance.elements.wrapper.offsetWidth / instance.setting.items);
  const _padding = instance.setting.spacing;
  const _arr = instance.setting.loop ? instance.elements.slideItems : instance.elements.originalItems;

  _arr.map((x) => {
    x.style.width = `${_itemWidth}px`;
    x.style.paddingLeft = `${(_padding / 2)}px`;
    x.style.paddingRight = `${(_padding / 2)}px`;
    return x;
  });

  instance.data.position = 0;
  instance.data.unit = _itemWidth;
  instance.data.width = _itemWidth * instance.elements.slider.children.length;
  instance.data.carouselWidth = parseFloat(instance.elements.wrapper.offsetWidth);
  instance.data.availableDistance = instance.data.width - instance.data.carouselWidth;

  instance.elements.slider.style.width = `${instance.data.width}px`;

  if (instance.setting.independHeight) {
    setTimeout(() => {
      instance.elements.slider.style.height = `${instance.data.itemActiveFirst.x.offsetHeight}px`;
    }, 300);
  }

  // Need to move to first original item after cloned
  if (instance.setting.loop && instance.data.pages.active === 0) {
    const _distance = (instance.elements.slideItems.length - instance.elements.originalItems.length) / 2 * _itemWidth * -1;
    instance.elements.slider.style.transform = `translate3d(${_distance}px,0px,0px)`;
    instance.data.position = _distance;
  }
}

function _reCalculateUI(instance) {
  if (!instance.setting.width) {
    const _itemWidth = (instance.elements.wrapper.offsetWidth / instance.setting.items);
    const _padding = instance.setting.spacing;
    const _arr = instance.setting.loop ? instance.elements.slideItems : instance.elements.originalItems;

    _arr.map((x) => {
      x.style.width = `${_itemWidth}px`;
      x.style.paddingLeft = `${(_padding / 2)}px`;
      x.style.paddingRight = `${(_padding / 2)}px`;
      return x;
    });

    instance.data.unit = _itemWidth;
    instance.data.width = _itemWidth * instance.elements.slider.children.length;
    instance.data.carouselWidth = parseFloat(instance.elements.wrapper.offsetWidth);
    instance.data.availableDistance = instance.data.width - instance.data.carouselWidth;

    instance.elements.slider.style.width = `${instance.data.width}px`;

    if (instance.setting.loop) {
      const _distance = (instance.elements.slideItems.length - instance.elements.originalItems.length) / 2 * _itemWidth * -1;
      instance.elements.slider.style.transform = `translate3d(${_distance}px,0px,0px)`;
      instance.data.position = _distance;
    } else {
      instance.data.position = 0;
    }

    const _p = instance.data.pages.active;
    instance.data.pages.active = 0;
    instance.data.itemInView = [];
    instance.data.itemActive = [];
    instance.data.canGoNext = true;

    instance.elements.originalItems.map((x, index) => {
      x.classList.add('thp-carousel__item');
      if (index < instance.setting.items) {
        instance.data.itemInView.push({ x, index });
        x.classList.add('in-view');
      }
      if (index < instance.setting.itemsMove) {
        instance.data.itemActive.push({ x, index });
        x.classList.add('active');
      }
      return x;
    });
    [instance.data.itemActiveFirst] = instance.data.itemActive;
    instance.data.itemActiveLast = instance.data.itemActive[instance.data.itemActive.length - 1];

    instance.goToPage(_p);
    if (_p === 0 && !instance.setting.loop) {
      if (instance.setting.independHeight) {
        setTimeout(() => {
          instance.elements.slider.style.height = `${instance.data.itemActiveFirst.x.offsetHeight}px`;
        }, 100);
      }
    }
  }
}

function _buildDots(instance) {
  const _instance = instance;
  const dots = document.createElement('div');
  dots.className = 'thp-carousel__dots';

  let pages = Math.ceil((_instance.elements.originalItems.length - _instance.setting.items) / _instance.setting.itemsMove) + 1;
  if (_instance.setting.loop) {
    pages = Math.ceil((_instance.elements.originalItems.length) / _instance.setting.itemsMove);
  }

  [...Array(pages).keys()].map((x, index) => {
    dots.innerHTML += `<button type="button" class="thp-carousel__dot ${index === _instance.data.pages.active ? 'active' : ''}">${x}</button>`;
    return x;
  });

  _instance.elements.wrapper.appendChild(dots);
  _instance.elements.dots = dots;
  _instance.elements.dots.childs = convertNodeListToArray(dots.children);

  _instance.data.pages.total = _instance.elements.dots.childs.length;

  if (!_instance.setting.dots) {
    _instance.elements.dots.style.display = 'none';
  }
}

function _cloneItems(instance) {
  if (!instance.setting.loop) return false;

  const _instance = instance;
  const _prevFragment = document.createDocumentFragment();
  const _nextFragment = document.createDocumentFragment();

  // Calculate previous objects
  let _clone;
  for (let i = 0; i < _instance.setting.items; i += 1) {
    _clone = _instance.elements.originalItems[_instance.elements.originalItems.length - 1 - i].cloneNode(true);
    _clone.classList.add('thp-cloned');
    _prevFragment.prepend(_clone);

    _clone = _instance.elements.originalItems[i].cloneNode(true);
    _clone.classList.add('thp-cloned');
    _clone.classList.remove('in-view', 'active');
    _nextFragment.appendChild(_clone);
  }

  if (Object.prototype.hasOwnProperty.call(Document, 'prepend')) {
    _instance.elements.slider.prepend(_prevFragment);
  } else {
    prepend(_instance.elements.slider, _prevFragment);
  }
  _instance.elements.slider.appendChild(_nextFragment);

  const _cloneLazy = new thpLazyElement({
    force: true,
    events: {
      afterLoad() {
        if (_instance.setting.independHeight) {
          setTimeout(() => {
            _instance.elements.slider.style.height = `${_instance.data.itemActiveFirst.x.offsetHeight}px`;
            if (typeof _instance.setting.events.resizeHeight === 'function') _instance.setting.events.resizeHeight(_instance);
          }, 300);
        }
      },
    },
  });

  _instance.elements.cloneLazy = _cloneLazy;
  _instance.elements.slideItems = convertNodeListToArray(_instance.elements.slider.children);

  return _instance;
}

function _buildUI(instance) {
  // if (!instance.setting.loop && instance.setting.items >= instance.elements.slider.children.length) return false;

  const _instance = instance;
  const wrapper = document.createElement('div');

  wrap(wrapper, _instance.elements.slider);
  wrapper.classList.add('thp-carousel');
  if (_instance.setting.class) {
    wrapper.className += ` ${_instance.setting.class}`;
  }

  _instance.elements.wrapper = wrapper;

  if (_instance.setting.timeSlide !== undefined) {
    _instance.elements.slider.style.transitionDuration = `${_instance.setting.timeSlide}ms`;
  }

  _instance.data = {
    itemInView: [],
    itemActive: [],
    itemActiveFirst: null,
    itemActiveLast: null,
    itemActiveFirstRev: null,
    itemActiveLastRev: null,
    canGoNext: true,
    canGoPrev: _instance.setting.loop,
    pages: {
      total: 1,
      active: 0,
    },
  };

  _instance.elements.originalItems.map((x, index) => {
    x.classList.add('thp-carousel__item');
    if (index < _instance.setting.items) {
      _instance.data.itemInView.push({ x, index });
      x.classList.add('in-view');
    }
    if (index < _instance.setting.itemsMove) {
      _instance.data.itemActive.push({ x, index });
      x.classList.add('active');
    }
    return x;
  });

  if (_instance.setting.loop) {
    _cloneItems(_instance);
  } else if (_instance.setting.independHeight) {
    const imgs = convertNodeListToArray(_instance.elements.wrapper.querySelectorAll('img[data-thp-lazy]'));
    imgs.map(x => x.addEventListener('load', () => {
      setTimeout(() => {
        _instance.elements.slider.style.height = `${_instance.data.itemActiveFirst.x.offsetHeight}px`;
        if (typeof _instance.setting.events.resizeHeight === 'function') _instance.setting.events.resizeHeight(_instance);
      }, 300);
    }));
  }

  const nav = document.createElement('div');
  const navPrev = document.createElement('button');
  const navNext = document.createElement('button');
  navPrev.type = 'button';
  navPrev.title = 'Previous';
  navPrev.className = 'thp-carousel__button thp-carousel__button--prev';

  if (!_instance.setting.loop) {
    navPrev.classList.add('disabled');
  }

  navNext.type = 'button';
  navNext.title = 'Next';
  navNext.className = 'thp-carousel__button thp-carousel__button--next';

  nav.appendChild(navPrev);
  nav.appendChild(navNext);

  nav.classList.add('thp-carousel__nav');

  wrapper.appendChild(nav);
  _instance.elements.nav = nav;
  _instance.elements.navPrev = navPrev;
  _instance.elements.navNext = navNext;

  if (!_instance.setting.nav) {
    _instance.elements.nav.style.display = 'none';
  }

  _buildDots(_instance);

  [_instance.data.itemActiveFirst] = _instance.data.itemActive;
  _instance.data.itemActiveLast = _instance.data.itemActive[_instance.data.itemActive.length - 1];

  _calculateUI(_instance);
  return true;
}

function _moveRoundSlide(instance, direction, steps) {
  const _instance = instance;
  const _direction = direction;
  const _steps = steps;

  if (typeof instance.setting.events.beforeChange === 'function') instance.setting.events.beforeChange(instance);
  _instance.data.isMoving = true;

  let _distance = (_steps * _instance.data.unit * _direction) + _instance.data.position;
  let _nextFirstIndex = _instance.data.itemActiveFirst.index + _direction * _steps * -1;
  let _nextLastIndex = _instance.data.itemActiveLast.index + _direction * _steps * -1;
  // let _nextFirstIndexRev = _instance.data.itemActiveFirst.index;
  // let _nextLastIndexRev = _instance.data.itemActiveLast.index;

  if (!_instance.setting.loop) {
    if (_distance < 0) {
      _instance.data.canGoPrev = true;
      _instance.elements.navPrev.classList.remove('disabled');
    } else {
      _distance = 0;
      _instance.data.canGoPrev = false;
      _instance.elements.navPrev.classList.add('disabled');
    }
    if (_distance <= (_instance.data.availableDistance * -1)) {
      _distance = _instance.data.availableDistance * -1;
      _instance.data.canGoNext = false;
      _instance.elements.navNext.classList.add('disabled');
    } else {
      _instance.data.canGoNext = true;
      _instance.elements.navNext.classList.remove('disabled');
    }
  } else if (_nextFirstIndex > _instance.elements.originalItems.length - 1) {
    _nextFirstIndex = 0;
    _nextLastIndex = _nextFirstIndex + _instance.setting.itemsMove - 1;
  }

  _instance.data.itemActive.map(x => x.x.classList.remove('active'));
  _instance.data.itemInView.map(x => x.x.classList.remove('in-view'));
  _instance.data.itemActive = [];
  _instance.data.itemInView = [];
  _instance.data.itemActiveFirstRev = _instance.data.itemActiveFirst;
  _instance.data.itemActiveLastRev = _instance.data.itemActiveLast;
  _instance.elements.originalItems.map((x, index) => {
    if (index === _nextFirstIndex) {
      _instance.data.itemActiveFirst = { x, index };
    }
    if (index === _nextLastIndex) {
      _instance.data.itemActiveLast = { x, index };
    }
    if (index >= _nextFirstIndex && index <= _nextLastIndex) {
      x.classList.add('active');
      _instance.data.itemActive.push({ x, index });
    }

    if (index >= _nextFirstIndex && index <= ((_nextFirstIndex - 1) + _instance.setting.items)) {
      x.classList.add('in-view');
      _instance.data.itemInView.push({ x, index });
    }
    return x;
  });
  // _instance.data.itemInView.push(_instance.data.itemActiveFirst);
  // _instance.data.itemActive.push(_instance.data.itemActiveFirst);

  _instance.elements.dots.childs[_instance.data.pages.active].classList.remove('active');
  _instance.data.pages.active += (_steps / _instance.setting.itemsMove * -1 / _direction);

  if (_instance.setting.loop) {
    if (_instance.data.pages.active < 0) {
      _instance.data.pages.active = _instance.data.pages.total - 1;
    }
    if (_instance.data.pages.active >= _instance.data.pages.total) {
      _instance.data.pages.active = 0;
    }
  }
  _instance.elements.dots.childs[_instance.data.pages.active].classList.add('active');

  // Animate here
  _instance.elements.slider.style.transform = `translate3d(${_distance}px,0px,0px)`;
  _instance.data.position = _distance;
  _instance.data.direction = _direction;
}

function _moveRemainderSlide(instance, direction, steps) {
  const _instance = instance;
  const _direction = direction;
  const _steps = steps;

  if (typeof instance.setting.events.beforeChange === 'function') instance.setting.events.beforeChange(instance);
  _instance.data.isMoving = true;

  let _distance = (_steps * _instance.data.unit * _direction) + _instance.data.position;
  const _nextFirstIndex = _instance.data.itemActiveFirst.index + _direction * _steps * -1;
  let _nextLastIndex = _instance.data.itemActiveLast.index + _direction * _steps * -1;
  let _nextFirstIndexRev = _instance.data.itemActiveFirst.index;
  let _nextLastIndexRev = _instance.data.itemActiveLast.index;
  const _useRev = _nextLastIndexRev === _instance.elements.originalItems.length - 1;

  const _remainderNumber = _instance.elements.originalItems.length % _instance.setting.itemsMove;

  if (!_instance.setting.loop) {
    if (_distance < 0) {
      _instance.data.canGoPrev = true;
      _instance.elements.navPrev.classList.remove('disabled');
    } else {
      _distance = 0;
      _instance.data.canGoPrev = false;
      _instance.elements.navPrev.classList.add('disabled');
    }
    if (_distance <= (_instance.data.availableDistance * -1)) {
      _distance = _instance.data.availableDistance * -1;
      _instance.data.canGoNext = false;
      _instance.elements.navNext.classList.add('disabled');
    } else {
      _instance.data.canGoNext = true;
      _instance.elements.navNext.classList.remove('disabled');
    }
    if (_nextLastIndex >= _instance.elements.originalItems.length - 1) {
      _nextLastIndex = _instance.elements.originalItems.length - 1;
      // _nextFirstIndex = _nextLastIndex - (_instance.setting.itemsMove - 1);
    }
    if (_useRev) {
      _distance = (_remainderNumber * _instance.data.unit * _direction) + _instance.data.position;
    }
  } else if (_instance.data.pages.active === _instance.data.pages.total - 1) {
    _distance = ((_instance.setting.items - (_instance.setting.items - _remainderNumber)) * _instance.data.unit * _direction) + _instance.data.position;
  }

  _instance.data.itemActive.map(x => x.x.classList.remove('active'));
  _instance.data.itemInView.map(x => x.x.classList.remove('in-view'));
  _instance.data.itemActive = [];
  _instance.data.itemInView = [];

  if (!_useRev) {
    _instance.elements.originalItems.map((x, index) => {
      if (index === _nextFirstIndex) {
        _instance.data.itemActiveFirst = { x, index };
      }
      if (index === _nextLastIndex) {
        _instance.data.itemActiveLast = { x, index };
      }
      if (index >= _nextFirstIndex && index <= _nextLastIndex) {
        x.classList.add('active');
        _instance.data.itemActive.push({ x, index });
      }

      if (index >= _nextFirstIndex && index <= ((_nextFirstIndex - 1) + _instance.setting.items)) {
        x.classList.add('in-view');
        _instance.data.itemInView.push({ x, index });
      }
      return x;
    });
  } else {
    const _remainderItems = [];
    _instance.elements.originalItems.map((x, index) => {
      if (index >= _instance.elements.originalItems.length - _remainderNumber) {
        _remainderItems.push({ x, index });
      }
      return x;
    });

    if (_nextLastIndexRev === _remainderItems[_remainderNumber - 1].index) {
      _nextLastIndexRev = _remainderItems[0].index - 1;
      _nextFirstIndexRev = _nextLastIndexRev - (_instance.setting.itemsMove - 1);
    }

    _instance.elements.originalItems.map((x, index) => {
      if (index === _nextFirstIndexRev) {
        _instance.data.itemActiveFirst = { x, index };
      }
      if (index === _nextLastIndexRev) {
        _instance.data.itemActiveLast = { x, index };
      }
      if (index >= _nextFirstIndexRev && index <= _nextLastIndexRev) {
        x.classList.add('active');
        _instance.data.itemActive.push({ x, index });
      }

      if (index >= _nextFirstIndexRev && index <= ((_nextFirstIndexRev - 1) + _instance.setting.items)) {
        x.classList.add('in-view');
        _instance.data.itemInView.push({ x, index });
      }
      return x;
    });
  }

  _instance.elements.dots.childs[_instance.data.pages.active].classList.remove('active');
  _instance.data.pages.active += (_steps / _instance.setting.itemsMove * -1 / _direction);

  if (_instance.setting.loop) {
    if (_instance.data.pages.active < 0) {
      _instance.data.pages.active = _instance.data.pages.total - 1;
    }
    if (_instance.data.pages.active >= _instance.data.pages.total) {
      _instance.data.pages.active = 0;
    }
  }
  _instance.elements.dots.childs[_instance.data.pages.active].classList.add('active');

  // Animate here
  _instance.elements.slider.style.transform = `translate3d(${_distance}px,0px,0px)`;
  _instance.data.position = _distance;
  _instance.data.direction = _direction;
}

function _moveSlide(instance, direction, steps) {
  const _instance = instance;
  let _direction = direction;
  let _steps = steps;

  _direction = (direction === undefined || direction === null || direction >= 1) ? -1 : 1;
  if (_direction === -1 && !_instance.data.canGoNext) return false;
  if (_direction === 1 && !_instance.data.canGoPrev) return false;

  if (steps === undefined || steps === null) _steps = _instance.setting.itemsMove;

  if (_instance.setting.items === 1 || _instance.elements.originalItems.length % _instance.setting.itemsMove === 0) {
    _moveRoundSlide(_instance, _direction, _steps);
  }

  if (_instance.elements.originalItems.length % _instance.setting.itemsMove !== 0) {
    _moveRemainderSlide(_instance, _direction, _steps);
  }

  return _instance;
}

function _goToPage(instance, page) {
  if (page < 0 || page > instance.data.pages.total) return false;
  if (page === instance.data.pages.active) return false;
  const _direction = instance.data.pages.active < page ? 1 : -1;
  _moveSlide(instance, _direction, Math.abs((page * instance.setting.itemsMove) - (instance.data.pages.active * instance.setting.itemsMove)));
  instance.data.pages.active = page;
  return instance;
}

function _afterLoopInfinite(instance) {
  instance.data.itemActive.map(x => x.x.classList.remove('active', 'in-view'));
  instance.data.itemActive = [];
  instance.data.itemInView = [];

  let _nextFirstIndex = 0;
  if (instance.data.direction === 1) {
    _nextFirstIndex = instance.elements.originalItems.length - instance.setting.itemsMove;
  }
  const _nextLastIndex = (_nextFirstIndex - 1) + instance.setting.itemsMove;

  instance.elements.originalItems.map((x, index) => {
    if (index === _nextFirstIndex) {
      instance.data.itemActiveFirst = { x, index };
    }

    if (index === _nextLastIndex) {
      instance.data.itemActiveLast = { x, index };
    }

    if (index >= _nextFirstIndex && index <= _nextLastIndex) {
      x.classList.add('active');
      instance.data.itemActive.push({ x, index });
    }

    if (index >= _nextFirstIndex && index <= ((_nextFirstIndex - 1) + instance.setting.items)) {
      x.classList.add('in-view');
      instance.data.itemInView.push({ x, index });
    }

    return x;
  });
}

function _loopRoundInfinite(instance) {
  if (instance.setting.loop) {
    if (instance.data.pages.active === 0 && instance.data.direction === -1) {
      instance.elements.slider.classList.add('stop-transition');
      const _loopRootDistance = (instance.elements.slideItems.length - instance.elements.originalItems.length) / 2 * instance.data.unit * -1;
      instance.elements.slider.style.transform = `translate3d(${_loopRootDistance}px,0px,0px)`;
      instance.data.position = _loopRootDistance;
      setTimeout(() => instance.elements.slider.classList.remove('stop-transition'), 100);
      _afterLoopInfinite(instance);
    }

    if (instance.data.pages.active === (instance.data.pages.total - 1) && instance.data.direction === 1) {
      instance.elements.slider.classList.add('stop-transition');
      const _loopLastDistance = (instance.elements.originalItems.length) * instance.data.unit * -1;
      instance.elements.slider.style.transform = `translate3d(${_loopLastDistance}px,0px,0px)`;
      instance.data.position = _loopLastDistance;
      setTimeout(() => instance.elements.slider.classList.remove('stop-transition'), 100);
      _afterLoopInfinite(instance);
    }
    instance.data.isMoving = false;
  }
}

const _loadHandle = (instance) => {
  _calculateUI(instance);
};

const _resizeHandle = (instance) => {
  if (instance.elements.wrapper.offsetWidth !== instance.data.carouselWidth) {
    debounce(_reCalculateUI(instance));
  }
};

const _navHandle = (instance, e) => {
  e.preventDefault();
  e.stopPropagation();
  if (instance.data.isMoving) return false;
  if (e.target.classList.contains('thp-carousel__button--prev')) {
    _moveSlide(instance, -1);
    return true;
  }

  if (e.target.classList.contains('thp-carousel__button--next')) {
    _moveSlide(instance, 1);
    return true;
  }

  return true;
};

const _dotHandle = (instance, e) => {
  const el = e.target;
  if (el.classList.contains('thp-carousel__dot')) {
    e.preventDefault();
    e.stopPropagation();
    if (instance.data.isMoving) return false;
    if (el.classList.contains('active')) return false;

    _goToPage(instance, instance.elements.dots.childs.indexOf(el));
  }

  return true;
};

const _slideHandle = (instance, e) => {
  e.stopPropagation();
  if (e.target === instance.elements.slider && instance.data.isMoving) {
    setTimeout(() => {
      // _loopInfinite(instance);
      if (instance.setting.items === 1 || instance.elements.originalItems.length % instance.setting.itemsMove === 0) _loopRoundInfinite(instance);

      if (instance.elements.originalItems.length % instance.setting.itemsMove !== 0) _loopRoundInfinite(instance);

      if (instance.setting.independHeight) {
        setTimeout(() => {
          instance.elements.slider.style.height = `${instance.data.itemActiveFirst.x.offsetHeight}px`;
        }, 100);
      }
      instance.data.isMoving = false;
      if (typeof instance.setting.events.afterChange === 'function') instance.setting.events.afterChange(instance);
    }, 1);
  }
};

function _bindEvents(instance) {
  // need update layout when content fully loaded
  if (window.thpCarousel !== undefined) {
    window.thpCarousel.map((x) => {
      if (x.element === instance.elements.slider) {
        window.removeEventListener('load', x.loadHandle);
        window.addEventListener('load', x.loadHandle);
        window.removeEventListener('resize', x.resizeHandle);
        window.addEventListener('resize', x.resizeHandle);
        instance.elements.nav.removeEventListener('click', x.navHandle);
        instance.elements.nav.addEventListener('click', x.navHandle);
        instance.elements.dots.removeEventListener('click', x.dotHandle);
        instance.elements.dots.addEventListener('click', x.dotHandle);
        instance.elements.slider.removeEventListener('transitionend', x.sliderHandle);
        instance.elements.slider.addEventListener('transitionend', x.sliderHandle);

        x.mc = new Hammer(instance.elements.wrapper);
        if ('ontouchstart' in document.documentElement) {
          x.mc.on('swipeleft swiperight', (e) => {
            if (e.isFinal) {
              if (e.type === 'swipeleft') {
                instance.goNext();
              } else if (e.type === 'swiperight') {
                instance.goPrevious();
              }
            }
            return true;
          });
        } else {
          x.mc.on('panleft panright', (e) => {
            if (e.isFinal) {
              if (e.type === 'panleft') {
                instance.goNext();
              } else if (e.type === 'panright') {
                instance.goPrevious();
              }
            }
            return true;
          });
        }
      }
      return x;
    });
  } else {
    window.addEventListener('load', () => _loadHandle(instance));
    window.addEventListener('resize', () => _resizeHandle(instance));
    instance.elements.nav.addEventListener('click', e => _navHandle(instance, e));
    instance.elements.dots.addEventListener('click', e => _dotHandle(instance, e));
    instance.elements.slider.addEventListener('transitionend', e => _slideHandle(instance, e));
    instance.mc = new Hammer(instance.elements.wrapper);
    if ('ontouchstart' in document.documentElement) {
      instance.mc.on('swipeleft swiperight', (e) => {
        if (e.isFinal) {
          if (e.type === 'swipeleft') {
            instance.goNext();
          } else if (e.type === 'swiperight') {
            instance.goPrevious();
          }
        }
        return true;
      });
    } else {
      instance.mc.on('panleft panright', (e) => {
        if (e.isFinal) {
          if (e.type === 'panleft') {
            instance.goNext();
          } else if (e.type === 'panright') {
            instance.goPrevious();
          }
        }
        return true;
      });
    }
  }
}

// Public method define below
function _bindPublicMethod(instance) {
  const _instance = instance;
  _instance.goNext = () => {
    _moveSlide(_instance, 1);
  };

  _instance.goPrevious = () => {
    _moveSlide(_instance, -1);
  };

  _instance.goToPage = (page) => {
    _goToPage(_instance, page);
  };

  _instance.refresh = () => {
    setTimeout(() => {
      _instance.elements.slider.style.height = `${_instance.data.itemActiveFirst.x.offsetHeight}px`;
    }, 10);
  };
  _instance.destroy = () => {
    const _arr = [];
    window.thpCarousel.map((x) => {
      if (x.element === _instance.elements.slider) {
        window.removeEventListener('load', x.loadHandle);
        window.removeEventListener('resize', x.resizeHandle);
        instance.elements.nav.removeEventListener('click', x.navHandle);
        instance.elements.dots.removeEventListener('click', x.dotHandle);
        instance.elements.slider.removeEventListener('transitionend', x.sliderHandle);
        if (x.mc) x.mc.destroy();

        _instance.elements.wrapper.removeChild(_instance.elements.nav);
        _instance.elements.wrapper.removeChild(_instance.elements.dots);

        if (_instance.elements.slideItems) {
          _instance.elements.slideItems.map((y) => {
            if (y.classList.contains('thp-cloned')) {
              _instance.elements.slider.removeChild(y);
            }
            return y;
          });
        }

        _instance.elements.originalItems.map((z) => {
          z.classList.remove('active');
          z.classList.remove('in-view');
          z.removeAttribute('style');
          return z;
        });

        unWrap(_instance.elements.wrapper);
        _instance.elements.slider.removeAttribute('style');
      } else {
        _arr.push(x);
      }
      return x;
    });

    window.thpCarousel = _arr;
  };
}

class ThpCarousel {
  /**
   * Class constructor
   * @param {Object} setting setting for new instance plugin.
   * @param {String=} setting.selector The css selector query to get DOM elements will apply this plugin.
   * @param {Boolean=} setting.nav Default: true - Show button prev & next or NOT
   * @param {Boolean=} setting.806s Default: true - Show dots nav or NOT
   * @param {String=} setting.width Default: null = 100% - Width of slider in px or percent
   * @param {Number=} setting.items Default: 1 - Number of item(s) display in view
   * @param {Number=} setting.itemsMove Default: 1 - Number of item(s) move to view each slide
   * @param {Number=} setting.spacing Default: 0 - Spacing between 2 items.
   * @param {Boolean=} setting.loop Default: false - Infinite loop
   * @param {Boolean=} setting.auto Default: false - Autoplay or NOT
   * @param {Number=} setting.timeShow Default: 3000 - Time (in milliseconds) pause before go to next slide (only usefull when autoplay = true)
   * @param {Number=} setting.timeSlide Default: 300 - Time (in milliseconds) for each transtion of slide
   * @param {Object=} setting.events Define callbacks for events.
   * @param {Function=} setting.events.initialized Callback will fire when 1 instance installed
   * @param {Function=} setting.events.initializedAll Callback will fire when ALL instances installed
   * @param {Function=} setting.events.beforeChange Callback will fire before carousel move to new item(s)
   * @param {Function=} setting.events.afterChange Callback will fire after carousel moved to new item(s)
   * @param {Function=} setting.events.resizeHeight Callback will fire after active slide item resize completed
  */
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-thp-carousel]',
      nav: true,
      dots: true,
      items: 1,
      itemsMove: 1,
      spacing: 0,
      auto: false,
      loop: false,
      forceLoop: false,
      timeShow: 3000,
      // timeSlide: 300,
      independHeight: false,
      events: {
        initialized() {},
        initializedAll() {},
        beforeChange() {},
        afterChange() {},
        resizeHeight() {},
      },
    };

    const s = Object.assign({}, defaultSetting, setting || {});

    if (s.itemsMove > s.items) s.itemsMove = s.items;
    s.forceLoop = (s.forceLoop === '1' || s.forceLoop === 'true' || s.forceLoop === 1 || s.forceLoop === true);
    s.loop = (s.loop === '1' || s.loop === 'true' || s.loop === 1 || s.loop === true);
    s.auto = (s.auto === '1' || s.auto === 'true' || s.auto === 1 || s.auto === true);

    this.setting = s;
    this.instances = [];
    this.init(s);

    return this.instances;
  }

  init(setting) {
    const $this = this;
    const els = convertNodeListToArray(document.querySelectorAll(setting.selector));
    if (window.thpCarousel === undefined) window.thpCarousel = [];

    els.map((x) => {
      const _f = window.thpCarousel.filter(y => y.element === x);
      if (_f.length === 0) {
        const obj = {};
        // redefine setting for each instance here
        const s = Object.assign({}, $this.setting, x.dataset || {});
        s.items = parseInt(s.items, 0);
        s.itemsMove = parseInt(s.itemsMove, 0);
        s.spacing = parseInt(s.spacing, 0);
        s.timeShow = parseInt(s.timeShow, 0);
        s.timeSlide = parseInt(s.timeSlide, 0);
        s.forceLoop = (s.forceLoop === '1' || s.forceLoop === 'true' || s.forceLoop === 1 || s.forceLoop === true);
        s.loop = (s.loop === '1' || s.loop === 'true' || s.loop === 1 || s.loop === true);
        s.auto = (s.auto === '1' || s.auto === 'true' || s.auto === 1 || s.auto === true);

        obj.setting = s;

        obj.elements = {
          slider: x,
          originalItems: convertNodeListToArray(x.children),
        };

        let initCarousel = false;

        if (obj.setting.forceLoop) {
          if (obj.setting.items <= obj.elements.slider.children.length) {
            initCarousel = true;
          }
        } else if (obj.setting.items < obj.elements.slider.children.length) {
          initCarousel = true;
        }

        if (x.parentElement.classList.contains('thp-carousel')) {
          initCarousel = false;
        }

        if (initCarousel) {
          window.thpCarousel.push({
            element: x,
            loadHandle: _loadHandle.bind(null, obj),
            resizeHandle: _resizeHandle.bind(null, obj),
            navHandle: _navHandle.bind(null, obj),
            dotHandle: _dotHandle.bind(null, obj),
            sliderHandle: _slideHandle.bind(null, obj),
          });

          obj.elements.slider.classList.add('thp-carousel__slider');

          _buildUI(obj);
          _bindEvents(obj);
          _bindPublicMethod(obj);

          $this.instances.push(obj);
          if (typeof obj.setting.events.initialized === 'function') obj.setting.events.initialized(obj);
        } else {
          x.classList.add('no-thp-carousel');
        }
        return obj;
      }
      return x;
    });

    if (typeof $this.setting.events.initializedAll === 'function') $this.setting.events.initializedAll($this.instances);
  }
}

export default ThpCarousel;
