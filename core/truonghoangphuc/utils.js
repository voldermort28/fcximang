import UAParser from 'ua-parser-js';
import smoothscroll from 'smoothscroll-polyfill';
import Handlebars from './handlebars_extend';
import './polyfill';

smoothscroll.polyfill();

class Utils {
  static setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
  }

  static getCookie(cname) {
    const name = `${cname}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i += 1) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  static checkCookie(cname) {
    const cookie = Utils.getCookie(cname);
    if (cookie !== '') {
      return true;
    }
    return false;
  }

  static deleteCookie(cname) {
    document.cookie = `${cname}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }

  static getLocalData(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return '';
    }
  }

  static setLocalData(key, value) {
    try {
      return window.localStorage.setItem(key, value);
    } catch (error) {
      return '';
    }
  }

  static getUrlQueryString(name, str) {
    const _name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp(`[\\?&]${_name}=([^&#]*)`);
    const results = regex.exec(str || window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  static getSystemInformation() {
    const parser = new UAParser();

    return parser.getResult();
  }

  static fireEvent(node, eventName) {
    // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
    let doc;
    if (node.ownerDocument) {
      doc = node.ownerDocument;
    } else if (node.nodeType === 9) {
      // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
      doc = node;
    } else {
      throw new Error(`Invalid node passed to fireEvent: ${node.id}`);
    }

    if (node.dispatchEvent) {
      // Gecko-style approach (now the standard) takes more work
      let eventClass = '';

      // Different events have different event classes. If this switch statement can't
      // map an eventName to an eventClass, the event firing is going to fail.
      switch (eventName) {
        case 'click': // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
        case 'mousedown':
        case 'mouseup':
          eventClass = 'MouseEvents';
          break;
        case 'input':
        case 'focus':
        case 'focusout':
        case 'change':
        case 'blur':
        case 'select':
        case 'transitionrun':
        case 'transitionstart':
        case 'transitioncancel':
        case 'transitionend':
        case 'load':
          eventClass = 'HTMLEvents';
          break;

        default:
          throw new Error(`fireEvent: Couldn't find an event class for event ${eventName}.`);
      }
      const event = doc.createEvent(eventClass);
      event.initEvent(eventName, true, true); // All events created as bubbling and cancelable.

      event.synthetic = true; // allow detection of synthetic events
      // The second parameter says go ahead with the default action
      node.dispatchEvent(event, true);
    } else if (node.fireEvent) {
      // IE-old school style, you can drop this if you don't need to support IE8 and
      // lower
      const event = doc.createEventObject();
      event.synthetic = true; // allow detection of synthetic events
      node.fireEvent(`on${eventName}`, event);
    }
  }

  static convertNodeListToArray(nodeList) {
    if (Array.from) {
      return Array.from(nodeList);
    }
    return Array.prototype.slice.call(nodeList);
  }

  /**
   * Wrap the target into wrapper
   * @param {HTMLElement} wrapper - wrap element
   * @param {HTMLElement} target - node element will be wrapped
   * */
  static wrap(wrapper, target) {
    try {
      target.parentNode.insertBefore(wrapper, target);
      wrapper.appendChild(target);
      return wrapper;
    } catch (error) {
      return error;
    }
  }

  static unWrap(wrapper) {
    // place childNodes in document fragment
    const docFrag = document.createDocumentFragment();
    while (wrapper.firstChild) {
      const child = wrapper.removeChild(wrapper.firstChild);
      docFrag.appendChild(child);
    }

    // replace wrapper with document fragment
    wrapper.parentNode.replaceChild(docFrag, wrapper);
  }

  static getScrollbarWidth() {
    // Creating invisible container
    try {
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll'; // forcing scrollbar to appear
      outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
      document.body.appendChild(outer);

      // Creating inner element and placing it in the container
      const inner = document.createElement('div');
      outer.appendChild(inner);

      // Calculating difference between container's full width and the child width
      const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

      // Removing temporary elements from the DOM
      outer.parentNode.removeChild(outer);

      return scrollbarWidth;
    } catch (error) {
      // console.log(error);
      return 0;
    }
  }

  static ajaxRequest(request) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(request.method || 'GET', request.url);
      if (request.headers) {
        Object
          .keys(request.headers)
          .forEach((key) => {
            xhr.setRequestHeader(key, request.headers[key]);
          });
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(new Error(`${xhr.status} ${xhr.statusText}`));
        }
      };
      xhr.onerror = () => reject(new Error(`${xhr.status}:${xhr.statusText}`));
      xhr.send(request.body);
    });
  }

  static async loadTemplate(file) {
    if (window.templateCache) {
      const cache = window.templateCache.filter(x => x.name === file);
      if (cache[0]) return cache[0].data;
    }

    try {
      const data = await Utils.ajaxRequest({
        method: 'GET',
        url: file,
      });

      if (window.templateCache === undefined) window.templateCache = [];
      window.templateCache.push({
        name: file,
        data,
      });
      return data;
    } catch (error) {
      return '';
    }
  }

  static processTemplate(source, data) {
    const template = Handlebars.compile(source);

    return template(data);
  }

  static prepend(target, source) {
    try {
      return target.insertBefore(source, target.firstChild);
    } catch (error) {
      return error;
    }
  }

  static insertAfter(target, source) {
    try {
      return target.parentElement.insertBefore(source, target.nextSibling);
    } catch (error) {
      return error;
    }
  }

  /**
   * Debounce functions for better performance
   * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
   * @param  {Function} fn The function to debounce
   */
  static debounce(fn) {
    // Return a function to run debounced
    // Setup the arguments
    if (typeof fn === 'function') {
      let timeout;
      const context = this;
      // eslint-disable-next-line prefer-rest-params
      const args = arguments;
      // If there's a timer, cancel it
      if (timeout) {
        window.cancelAnimationFrame(timeout);
      }
      // Setup the new requestAnimationFrame()
      timeout = window.requestAnimationFrame(() => {
        fn.apply(context, args);
      });
    }
  }

  // https://stackoverflow.com/questions/21474678/scrolltop-animation-without-jquery
  static scrollToTop(scrollDuration) {
    const cosParameter = window.scrollY / 2;
    let scrollCount = 0;
    let oldTimestamp = window.performance.now();
    function step(newTimestamp) {
      scrollCount += Math.PI / (scrollDuration / (newTimestamp - oldTimestamp));
      if (scrollCount >= Math.PI) window.scrollTo(0, 0);
      if (window.scrollY === 0) return;
      window.scrollTo(0, Math.round(cosParameter + cosParameter * Math.cos(scrollCount)));
      oldTimestamp = newTimestamp;
      window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  static scrollToElement(target, isScrollHorizontal) {
    window.scrollTo({
      top: isScrollHorizontal !== 1 ? target.offsetTop : 0,
      left: isScrollHorizontal !== 0 && isScrollHorizontal !== undefined ? target.offsetLeft : 0,
      behavior: 'smooth',
    });
  }

  static getElementStyle(element, property) {
    if (!property) {
      return window.getComputedStyle(element, null);
    }
    return window.getComputedStyle(element, null).getPropertyValue(property);
  }

  static requestInterval(fn, delay) {
    if (!window.requestAnimationFrame
      && !window.webkitRequestAnimationFrame
      && !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) // Firefox 5 ships without cancel support
      && !window.oRequestAnimationFrame
      && !window.msRequestAnimationFrame) return window.setInterval(fn, delay);

    let start = new Date().getTime();
    let handle;

    function loop() {
      const current = new Date().getTime();
      const delta = current - start;

      if (delta >= delay) {
        fn.call();
        start = new Date().getTime();
      }

      handle = window.requestAnimationFrame(loop);
    }

    handle = window.requestAnimationFrame(loop);
    return handle;
  }

  static clearRequestInterval(handle) {
    if (window.cancelAnimationFrame) {
      window.cancelAnimationFrame(handle);
    } else if (window.webkitCancelAnimationFrame) {
      window.webkitCancelAnimationFrame(handle);
    } else if (window.webkitCancelRequestAnimationFrame) {
      window.webkitCancelRequestAnimationFrame(handle);
    } else if (window.mozCancelRequestAnimationFrame) {
      window.mozCancelRequestAnimationFrame(handle);
    } else if (window.oCancelRequestAnimationFrame) {
      window.oCancelRequestAnimationFrame(handle);
    } else if (window.msCancelRequestAnimationFrame) {
      window.msCancelRequestAnimationFrame(handle);
    } else {
      clearInterval(handle);
    }
  }

  static getAllDatesInMonth(year, month) {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }

  static isToday(someDate) {
    const today = new Date();
    return someDate.getDate() === today.getDate() && someDate.getMonth() === today.getMonth() && someDate.getFullYear() === today.getFullYear();
  }

  static getSelectors(selector) {
    const _arr = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;

    let els = Utils.convertNodeListToArray(_arr);
    if (els.length === 0 && typeof selector !== 'string') {
      els = [_arr];
    }

    return els;
  }
}

export default Utils;

export const { setCookie } = Utils;
export const { getCookie } = Utils;
export const { checkCookie } = Utils;
export const { deleteCookie } = Utils;
export const { getLocalData } = Utils;
export const { setLocalData } = Utils;
export const { getSystemInformation } = Utils;
export const { getUrlQueryString } = Utils;
export const { fireEvent } = Utils;
export const { getScrollbarWidth } = Utils;
export const { convertNodeListToArray } = Utils;
export const { ajaxRequest } = Utils;
export const { loadTemplate } = Utils;
export const { processTemplate } = Utils;
export const { wrap } = Utils;
export const { unWrap } = Utils;
export const { prepend } = Utils;
export const { debounce } = Utils;
export const { scrollToTop } = Utils;
export const { scrollToElement } = Utils;
export const { insertAfter } = Utils;
export const { getElementStyle } = Utils;
export const { requestInterval } = Utils;
export const { clearRequestInterval } = Utils;
export const { getAllDatesInMonth } = Utils;
export const { isToday } = Utils;
export const { getSelectors } = Utils;
