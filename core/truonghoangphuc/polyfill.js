/* eslint-disable */
(function () {
  if (typeof window.CustomEvent === 'function') return false; // If not IE
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
}());

// Source: https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/prepend()/prepend().md
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('prepend')) {
      return;
    }
    Object.defineProperty(item, 'prepend', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function prepend() {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();

        argArr.forEach(function (argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });

        this.insertBefore(docFrag, this.firstChild);
      }
    });
  });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

// Source: https://developer.mozilla.org/vi/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (typeof Object.assign != 'function') {
  Object.assign = function(target, varArgs) { // .length của function là 2
    'use strict';
    if (target == null) { // TypeError nếu undefined hoặc null
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) { // Bỏ qua nếu undefined hoặc null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Source: https://github.com/discontinued/element-dataset/blob/master/src/index.js
(function () {
  if (!document.documentElement.dataset &&
    (
      !Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'dataset') ||
      !Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'dataset').get
    )
  ) {
    const descriptor = {}

    descriptor.enumerable = true

    descriptor.get = function get () {
      const element = this
      const map = {}
      const attributes = this.attributes

      function toUpperCase (n0) {
        return n0.charAt(1).toUpperCase()
      }

      function getter () {
        return this.value
      }

      function setter (name, value) {
        if (typeof value !== 'undefined') {
          this.setAttribute(name, value)
        } else {
          this.removeAttribute(name)
        }
      }

      for (let i = 0; i < attributes.length; i += 1) {
        const attribute = attributes[i]

        // This test really should allow any XML Name without
        // colons (and non-uppercase for XHTML)

        if (attribute && attribute.name && (/^data-\w[\w-]*$/).test(attribute.name)) {
          const name = attribute.name
          const value = attribute.value

          // Change to CamelCase

          const propName = name.substr(5).replace(/-./g, toUpperCase)

          Object.defineProperty(map, propName, {
            enumerable: descriptor.enumerable,
            get: getter.bind({ value: value || '' }),
            set: setter.bind(element, name)
          })
        }
      }
      return map
    }

    Object.defineProperty(HTMLElement.prototype, 'dataset', descriptor)
  }
})();

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function () {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function (callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
}());