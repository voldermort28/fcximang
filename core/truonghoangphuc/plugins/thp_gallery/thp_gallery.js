import './thp_gallery.scss';
import thpModal from '../thp_modal/thp_modal';
import thpLazyElement from '../thp_lazy/thp_lazy';
import { convertNodeListToArray } from '../../utils';

function _effectTranslateContent(instance) {

}

function _showContent(instance, img) {
  if (instance.setting.type === 'image') {
    if (instance.elements.contentMainTarget.children.length === 0) {
      instance.elements.contentMainTarget.innerHTML = `<img data-thp-lazy src=${instance.setting.loading} alt=${img} data-source=${img}/>`;
    } else {
      instance.elements.contentMainTarget.children[0].src = img;
    }
    const lazies = new thpLazyElement({
      selector: `.${instance.elements.modal.className.split(' ').join('.')} [data-thp-lazy]:not(.loaded)`,
    });
    return lazies;
  }

  if (instance.setting.type === 'ajax') {
    instance.elements.contentMainTarget.innerHTML = '';
    instance.setting.target = instance.data.sources[instance.data.currentIndex].src;
    instance.loadAjax();
  }

  return true;
}

function _contentGoPrev(instance) {
  const i = instance.data.currentIndex;
  let _prev = i;
  if (_prev > 0) {
    _prev = i - 1;
  } else {
    _prev = instance.data.sources.length - 1;
  }
  if (instance.setting.thumbnail && instance.data.sources) {
    instance.elements.photoListImages[_prev].click();
  } else if (!instance.setting.thumbnail) {
    instance.data.currentIndex = _prev;
    _showContent(instance, instance.data.sources[_prev].src);
  }
}

function _contentGoNext(instance) {
  const i = instance.data.currentIndex;
  let _next = i;
  if (_next < instance.data.sources.length - 1) {
    _next = i + 1;
  } else {
    _next = 0;
  }
  if (instance.setting.thumbnail && instance.data.sources) {
    instance.elements.photoListImages[_next].click();
  } else if (!instance.setting.thumbnail) {
    instance.data.currentIndex = _next;
    _showContent(instance, instance.data.sources[_next].src);
  }
}

function _updatePosition(instance, thumbnails, item) {
  let _currentPos = parseFloat(thumbnails.dataset.pos || 0);
  if (item.offsetLeft > thumbnails.parentElement.offsetWidth / 2) {
    let _nextPos = item.offsetLeft - thumbnails.parentElement.offsetWidth / 2;
    const _maxPos = thumbnails.offsetWidth - thumbnails.parentElement.offsetWidth;

    if (_nextPos > _maxPos) {
      _nextPos = _maxPos;
    }
    thumbnails.style.transform = `translate3d(-${_nextPos}px, 0, 0)`;
    _currentPos = _nextPos;
    thumbnails.dataset.pos = _currentPos;
  } else {
    thumbnails.style.transform = 'translate3d(0, 0, 0)';
    thumbnails.dataset.pos = 0;
  }
}

function _updateStatus(instance, thumbnails, item) {
  const _active = thumbnails.querySelector('.active');
  if (_active !== null) _active.classList.remove('active');
  item.classList.add('active');
  if (thumbnails.classList.contains('fluid')) _updatePosition(instance, thumbnails, item);
}

function _buildThumbnailEvent(instance, el) {
  // const _noOfThumbnail = _calcThumbnailItems(el);
  el.addEventListener('click', (e) => {
    if (e.target.nodeName === 'IMG') {
      const _img = e.target.getAttribute('data-origin') || e.target.getAttribute('data-source');
      _updateStatus(instance, el, e.target.parentElement);
      if (instance.setting.type === 'image') {
        _showContent(instance, _img);
        instance.data.currentIndex = convertNodeListToArray(el.querySelectorAll('img')).indexOf(e.target);
      }
    }
  });
  el.classList.add('initialized');
}

function _buildGroupEvent(instance) {
  // const childs = convertNodeListToArray(instance.elements.btn.querySelectorAll(instance.setting.children));
  // console.log(instance);
  instance.elements.btn.addEventListener('click', (e) => {
    if (!e.target.matches(instance.setting.children)) return;
    // if (e.target.nodeName === instance.setting.children.toUpperCase() || instance.setting.groupOfElement.indexOf(e.target) !== -1) {
    if (instance.setting.groupOfElement) instance.data.currentIndex = instance.setting.groupOfElement.indexOf(e.target);
    instance.open();
  }, false);
}

function _buildPhotoList(instance) {
  if (!instance.elements.photoList) {
    let html = '';

    instance.data.sources.map((x) => {
      html += `<span><img src=${x.thumbnail} data-origin=${x.src}/></span>`;
      return x;
    });
    const div = document.createElement('div');
    div.innerHTML = html;
    div.className = 'thp-thumbnail__wrapper';
    instance.elements.modalContent.querySelector('.thp-modal__body').appendChild(div);
    instance.elements.photoList = div;
    instance.elements.photoListImages = convertNodeListToArray(div.querySelectorAll('img'));
  }
}

function _buildMainContentUI(instance) {
  if (!instance.elements.contentMain) {
    const div = document.createElement('div');
    // div.id = 'thpMainPhoto';
    div.classList.add('thp-content__main');
    div.innerHTML = '<div class="thp-content__target"></div><div class="thp-content__nav"><button type="button" title="Previous" class="thp-content__button thp-content__button--prev"></button><button type="button" title="Next" class="thp-content__button thp-content__button--next"></button></div>';
    instance.elements.modalContent.querySelector('.thp-modal__body').appendChild(div);
    instance.elements.contentMain = div;
    instance.elements.contentMainTarget = div.querySelector('.thp-content__target');
    instance.elements.contentMainNav = div.querySelector('.thp-content__nav');
    instance.elements.contentMainNavPrev = div.querySelector('.thp-content__button--prev');
    instance.elements.contentMainNavNext = div.querySelector('.thp-content__button--next');
    if (instance.data.sources.length < 2) {
      instance.elements.contentMainNav.classList.add('d-none');
    }
  }
}

function _buildGalleryEvent(instance) {

  if (instance.setting.type === 'ajax') {
    instance.setting.events.beforeOpen = (_instance) => {
      _instance.elements.contentMainTarget.innerHTML = '';
      _instance.setting.target = _instance.data.sources[_instance.data.currentIndex].src;
    };
  }

  instance.setting.events.afterOpen = (_instance) => {
    if (_instance.setting.thumbnail) {
      const _div = _instance.elements.photoList;
      if (_div.offsetWidth >= _div.parentElement.offsetWidth) {
        _div.classList.add('fluid');
      } else {
        _div.classList.remove('fluid');
      }

      if (!_div.classList.contains('initialized')) {
        _buildThumbnailEvent(_instance, _div);
      }
      if (_instance.data.currentIndex !== undefined) {
        _div.querySelectorAll('img')[_instance.data.currentIndex].click();
      }
    } else if (_instance.data.currentIndex !== undefined) {
      _showContent(_instance, _instance.data.sources[_instance.data.currentIndex].src);
    }
  };

  instance.elements.contentMainNavPrev.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      _contentGoPrev(instance);
    }
  });

  instance.elements.contentMainNavNext.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      _contentGoNext(instance);
    }
  });
}

function _bindPublicMethod(instance) {
  instance.goPrev = () => {
    _contentGoPrev(instance);
  };
  instance.goNext = () => {
    _contentGoNext(instance);
  };
}

class ThpGallery extends thpModal {
  constructor(setting) {
    const defaultSetting = {
      selector: '[data-thp-gallery]',
      type: 'image',
      display: 'fullscreen',
      scrollOverlay: false,
      thumbnail: true,
      children: 'img',
      loading: 'data:image/gif;base64,R0lGODlhIAAgAPMAAP///5aWlufn58zMzODg4NXV1aysrLm5ue7u7vPz8+Li4qKiopeXlwAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAIAAgAAAE5xDISWlhperN52JLhSSdRgwVo1ICQZRUsiwHpTJT4iowNS8vyW2icCF6k8HMMBkCEDskxTBDAZwuAkkqIfxIQyhBQBFvAQSDITM5VDW6XNE4KagNh6Bgwe60smQUB3d4Rz1ZBApnFASDd0hihh12BkE9kjAJVlycXIg7CQIFA6SlnJ87paqbSKiKoqusnbMdmDC2tXQlkUhziYtyWTxIfy6BE8WJt5YJvpJivxNaGmLHT0VnOgSYf0dZXS7APdpB309RnHOG5gDqXGLDaC457D1zZ/V/nmOM82XiHRLYKhKP1oZmADdEAAAh+QQJCgAAACwAAAAAIAAgAAAE6hDISWlZpOrNp1lGNRSdRpDUolIGw5RUYhhHukqFu8DsrEyqnWThGvAmhVlteBvojpTDDBUEIFwMFBRAmBkSgOrBFZogCASwBDEY/CZSg7GSE0gSCjQBMVG023xWBhklAnoEdhQEfyNqMIcKjhRsjEdnezB+A4k8gTwJhFuiW4dokXiloUepBAp5qaKpp6+Ho7aWW54wl7obvEe0kRuoplCGepwSx2jJvqHEmGt6whJpGpfJCHmOoNHKaHx61WiSR92E4lbFoq+B6QDtuetcaBPnW6+O7wDHpIiK9SaVK5GgV543tzjgGcghAgAh+QQJCgAAACwAAAAAIAAgAAAE7hDISSkxpOrN5zFHNWRdhSiVoVLHspRUMoyUakyEe8PTPCATW9A14E0UvuAKMNAZKYUZCiBMuBakSQKG8G2FzUWox2AUtAQFcBKlVQoLgQReZhQlCIJesQXI5B0CBnUMOxMCenoCfTCEWBsJColTMANldx15BGs8B5wlCZ9Po6OJkwmRpnqkqnuSrayqfKmqpLajoiW5HJq7FL1Gr2mMMcKUMIiJgIemy7xZtJsTmsM4xHiKv5KMCXqfyUCJEonXPN2rAOIAmsfB3uPoAK++G+w48edZPK+M6hLJpQg484enXIdQFSS1u6UhksENEQAAIfkECQoAAAAsAAAAACAAIAAABOcQyEmpGKLqzWcZRVUQnZYg1aBSh2GUVEIQ2aQOE+G+cD4ntpWkZQj1JIiZIogDFFyHI0UxQwFugMSOFIPJftfVAEoZLBbcLEFhlQiqGp1Vd140AUklUN3eCA51C1EWMzMCezCBBmkxVIVHBWd3HHl9JQOIJSdSnJ0TDKChCwUJjoWMPaGqDKannasMo6WnM562R5YluZRwur0wpgqZE7NKUm+FNRPIhjBJxKZteWuIBMN4zRMIVIhffcgojwCF117i4nlLnY5ztRLsnOk+aV+oJY7V7m76PdkS4trKcdg0Zc0tTcKkRAAAIfkECQoAAAAsAAAAACAAIAAABO4QyEkpKqjqzScpRaVkXZWQEximw1BSCUEIlDohrft6cpKCk5xid5MNJTaAIkekKGQkWyKHkvhKsR7ARmitkAYDYRIbUQRQjWBwJRzChi9CRlBcY1UN4g0/VNB0AlcvcAYHRyZPdEQFYV8ccwR5HWxEJ02YmRMLnJ1xCYp0Y5idpQuhopmmC2KgojKasUQDk5BNAwwMOh2RtRq5uQuPZKGIJQIGwAwGf6I0JXMpC8C7kXWDBINFMxS4DKMAWVWAGYsAdNqW5uaRxkSKJOZKaU3tPOBZ4DuK2LATgJhkPJMgTwKCdFjyPHEnKxFCDhEAACH5BAkKAAAALAAAAAAgACAAAATzEMhJaVKp6s2nIkolIJ2WkBShpkVRWqqQrhLSEu9MZJKK9y1ZrqYK9WiClmvoUaF8gIQSNeF1Er4MNFn4SRSDARWroAIETg1iVwuHjYB1kYc1mwruwXKC9gmsJXliGxc+XiUCby9ydh1sOSdMkpMTBpaXBzsfhoc5l58Gm5yToAaZhaOUqjkDgCWNHAULCwOLaTmzswadEqggQwgHuQsHIoZCHQMMQgQGubVEcxOPFAcMDAYUA85eWARmfSRQCdcMe0zeP1AAygwLlJtPNAAL19DARdPzBOWSm1brJBi45soRAWQAAkrQIykShQ9wVhHCwCQCACH5BAkKAAAALAAAAAAgACAAAATrEMhJaVKp6s2nIkqFZF2VIBWhUsJaTokqUCoBq+E71SRQeyqUToLA7VxF0JDyIQh/MVVPMt1ECZlfcjZJ9mIKoaTl1MRIl5o4CUKXOwmyrCInCKqcWtvadL2SYhyASyNDJ0uIiRMDjI0Fd30/iI2UA5GSS5UDj2l6NoqgOgN4gksEBgYFf0FDqKgHnyZ9OX8HrgYHdHpcHQULXAS2qKpENRg7eAMLC7kTBaixUYFkKAzWAAnLC7FLVxLWDBLKCwaKTULgEwbLA4hJtOkSBNqITT3xEgfLpBtzE/jiuL04RGEBgwWhShRgQExHBAAh+QQJCgAAACwAAAAAIAAgAAAE7xDISWlSqerNpyJKhWRdlSAVoVLCWk6JKlAqAavhO9UkUHsqlE6CwO1cRdCQ8iEIfzFVTzLdRAmZX3I2SfZiCqGk5dTESJeaOAlClzsJsqwiJwiqnFrb2nS9kmIcgEsjQydLiIlHehhpejaIjzh9eomSjZR+ipslWIRLAgMDOR2DOqKogTB9pCUJBagDBXR6XB0EBkIIsaRsGGMMAxoDBgYHTKJiUYEGDAzHC9EACcUGkIgFzgwZ0QsSBcXHiQvOwgDdEwfFs0sDzt4S6BK4xYjkDOzn0unFeBzOBijIm1Dgmg5YFQwsCMjp1oJ8LyIAACH5BAkKAAAALAAAAAAgACAAAATwEMhJaVKp6s2nIkqFZF2VIBWhUsJaTokqUCoBq+E71SRQeyqUToLA7VxF0JDyIQh/MVVPMt1ECZlfcjZJ9mIKoaTl1MRIl5o4CUKXOwmyrCInCKqcWtvadL2SYhyASyNDJ0uIiUd6GGl6NoiPOH16iZKNlH6KmyWFOggHhEEvAwwMA0N9GBsEC6amhnVcEwavDAazGwIDaH1ipaYLBUTCGgQDA8NdHz0FpqgTBwsLqAbWAAnIA4FWKdMLGdYGEgraigbT0OITBcg5QwPT4xLrROZL6AuQAPUS7bxLpoWidY0JtxLHKhwwMJBTHgPKdEQAACH5BAkKAAAALAAAAAAgACAAAATrEMhJaVKp6s2nIkqFZF2VIBWhUsJaTokqUCoBq+E71SRQeyqUToLA7VxF0JDyIQh/MVVPMt1ECZlfcjZJ9mIKoaTl1MRIl5o4CUKXOwmyrCInCKqcWtvadL2SYhyASyNDJ0uIiUd6GAULDJCRiXo1CpGXDJOUjY+Yip9DhToJA4RBLwMLCwVDfRgbBAaqqoZ1XBMHswsHtxtFaH1iqaoGNgAIxRpbFAgfPQSqpbgGBqUD1wBXeCYp1AYZ19JJOYgH1KwA4UBvQwXUBxPqVD9L3sbp2BNk2xvvFPJd+MFCN6HAAIKgNggY0KtEBAAh+QQJCgAAACwAAAAAIAAgAAAE6BDISWlSqerNpyJKhWRdlSAVoVLCWk6JKlAqAavhO9UkUHsqlE6CwO1cRdCQ8iEIfzFVTzLdRAmZX3I2SfYIDMaAFdTESJeaEDAIMxYFqrOUaNW4E4ObYcCXaiBVEgULe0NJaxxtYksjh2NLkZISgDgJhHthkpU4mW6blRiYmZOlh4JWkDqILwUGBnE6TYEbCgevr0N1gH4At7gHiRpFaLNrrq8HNgAJA70AWxQIH1+vsYMDAzZQPC9VCNkDWUhGkuE5PxJNwiUK4UfLzOlD4WvzAHaoG9nxPi5d+jYUqfAhhykOFwJWiAAAIfkECQoAAAAsAAAAACAAIAAABPAQyElpUqnqzaciSoVkXVUMFaFSwlpOCcMYlErAavhOMnNLNo8KsZsMZItJEIDIFSkLGQoQTNhIsFehRww2CQLKF0tYGKYSg+ygsZIuNqJksKgbfgIGepNo2cIUB3V1B3IvNiBYNQaDSTtfhhx0CwVPI0UJe0+bm4g5VgcGoqOcnjmjqDSdnhgEoamcsZuXO1aWQy8KAwOAuTYYGwi7w5h+Kr0SJ8MFihpNbx+4Erq7BYBuzsdiH1jCAzoSfl0rVirNbRXlBBlLX+BP0XJLAPGzTkAuAOqb0WT5AH7OcdCm5B8TgRwSRKIHQtaLCwg1RAAAOwAAAAAAAAAAAA==',
      // thumbnailWidth: 100,
      // thumbnailHeight: 80,
      events: {
        beforeSlide() {},
        afterSlide() {},
      },
    };
    const s = Object.assign({}, defaultSetting, setting || {});
    // s.thumbnailWidth = parseFloat(s.thumbnailWidth);
    // s.thumbnailHeight = parseFloat(s.thumbnailHeight);
    super(s);
  }

  init(setting) {
    const $this = this;
    super.init(setting);

    $this.instances.map((x) => {
      const obj = x;
      obj.data = obj.data || {};
      obj.data.currentIndex = 0;
      obj.data.sources = [];

      obj.elements.modal.classList.add('thp-modal--gallery');

      if (obj.setting.contentTarget === null || obj.setting.contentTarget === undefined) {
        obj.setting.contentTarget = 'thp-content__target';
      }

      if (!obj.setting.thumbnails) {
        obj.setting.thumbnails = obj.setting.sources;
      }

      if (obj.setting.sources) {
        JSON.parse(obj.setting.sources).map(y => obj.data.sources.push({
          src: y,
          thumbnail: y,
        }));
        JSON.parse(obj.setting.thumbnails).map((y, index) => {
          if (obj.data.sources[index]) {
            obj.data.sources[index].thumbnail = y;
          }
          return true;
        });
      } else {
        obj.setting.groupOfElement = convertNodeListToArray(obj.elements.btn.querySelectorAll(obj.setting.children));
        obj.setting.groupOfElement.map((y) => {
          obj.data.sources.push({
            src: y.getAttribute('data-origin') || y.getAttribute('data-source') || y.getAttribute('href'),
            thumbnail: y.getAttribute('data-thumbnail'),
          });
          return true;
        });
        _buildGroupEvent(obj);
      }

      _buildMainContentUI(obj);
      if (obj.setting.thumbnail) {
        _buildPhotoList(obj);
      }

      _buildGalleryEvent(obj);
      _bindPublicMethod(obj);
      return obj;
    });
  }
}
export default ThpGallery;
