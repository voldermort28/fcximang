/* eslint-disable no-alert */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/**
  * This is the main entry point for a project
* */

// Import main style: webpack will convert into html output as main.min.css when build
import '../../assets/styles/app.scss';
import '../../assets/styles/_internal.scss';

import CryptoJS from 'crypto-js';

import App from '../../../core/truonghoangphuc/app';
import LazyLoad from '../../../core/truonghoangphuc/plugins/thp_lazy/thp_lazy';
import THPScroll from '../../../core/truonghoangphuc/plugins/thp_scroll/thp_scroll';
import THPDropdown from '../../../core/truonghoangphuc/plugins/thp_dropdown/thp_dropdown';
import THPModal from '../../../core/truonghoangphuc/plugins/thp_modal/thp_modal';
import THPValidation from '../../../core/truonghoangphuc/plugins/thp_validation/thp_validation';

import FirebaseFico from './widgets/firebase_fico';
import {
  setCookie, getCookie, convertNodeListToArray, deleteCookie, getUrlQueryString, ajaxRequest,
} from '../../../core/truonghoangphuc/utils';

const setting = {
  breakpoints: [768, 992, 1200],
};

window.app = new App(setting);
const html = document.querySelector('html');
let contentPolicy;
let contentBanner;
let logout;
const formSignUp = {};
const formSignIn = {};
const firebaseFico = new FirebaseFico();
const zaloConfig = {
  appId: '1532536334337506629',
  s: 'eWS5tRPV8UVD1X12i8Jn',
  redirectURL: mode === 'development' ? 'https://thp.test:3200/' : 'https://mienphiximang.fico-ytl.com/',
};
const zaloObject = {};
let linkLucky;

function callPageInfo(user) {
  setCookie('user', JSON.stringify(user), 30);
  window.location.href = '/info.html';
}

function callBillInfo(user) {
  if (user.lucky > 1000) callPageInfo(user);
  firebaseFico.getBills(user, (res) => {
    let totalN = 0;
    if (res.length) {
      res.map((x) => {
        if (totalN < x.total) totalN = x.total;
        return x;
      });
      if (totalN >= 200) {
        callPageInfo(iser);
      } else {
        setCookie('user', JSON.stringify(user), 30);
        // ga('send', 'event', 'detail purchase', 'update', 'after', 'after');
        window.location.href = '/update.html';
      }
    } else {
      setCookie('user', JSON.stringify(user), 30);
      // ga('send', 'event', 'detail purchase', 'update', 'after', 'after');
      window.location.href = '/update.html';
    }
  });
}

window.appLoading = (el, isLoading) => {
  if (isLoading) el.classList.add('loading');
  if (!isLoading) el.classList.remove('loading');
};

function hideUNNeedFields(user) {
  if (user) {
    formSignUp.password.parentElement.classList.add('d-none');
    formSignUp.verifypassword.parentElement.classList.add('d-none');
    formSignUp.socials.map((x) => {
      x.parentElement.classList.add('d-none');
      return x;
    });
    formSignUp.fullname.value = user.fullname;
    if (user.cmnd) formSignUp.cmnd.value = user.cmnd;
    if (user.phone) formSignUp.phone.value = user.phone;
  }
}

function addUser(provider, data) {
  const user = {};
  user.cmnd = '';
  user.email = data.email;
  user.phone = data.phoneNumber;
  user.fullname = data.displayName;
  user.signin = data.metadata.lastSignInTime;
  user.created = data.metadata.creationTime;
  user.lucky = 0;
  user[provider] = data.uid;
  firebaseFico.addUser(user, (res) => {
    if (res.id) {
      user.id = res.id;
      app.user = user;
      if (app.user.cmnd === '' || app.user.cmnd === null || app.user.phone === '' || app.user.phone === null) {
        app.signIn.close();
        app.signUp.open();
        hideUNNeedFields(app.user);
        appLoading(document.body, false);
      }
    } else {
      window.appLoading(document.body, false);
      app.alert.elements.message.innerHTML = '<p>There is an error!!! Please try again later</p>';
      app.alert.open();
    }
  });
}

function afterConnect(provider, data) {
  // console.log(data);
  const user = {};
  if (data.phoneNumber !== null && data.phoneNumber !== '') {
    firebaseFico.getUser('phone', data.phoneNumber, (res1) => {
      if (res1.length === 0 && data.email === null) {
        firebaseFico.getUser('email', data.email, (res2) => {
          if (res2.length === 0) {
            addUser(provider, data);
          }
        });
      }
    });
  } else if (data.email !== null && data.email !== '') {
    firebaseFico.getUser('email', data.email, (res2) => {
      console.log(res2);
      if (res2.length === 0) {
        addUser(provider, data);
      } else {
        user.id = res2[0].id;
        user.cmnd = res2[0].cmnd;
        user.email = res2[0].email;
        user.phone = res2[0].phone;
        user.fullname = res2[0].fullname;
        user.signin = new Date();
        user.created = res2[0].created;
        user[provider] = res2[0][provider];
        user.lucky = res2[0].lucky;
        app.user = user;
        if (app.user.cmnd === '' || app.user.cmnd === null || app.user.phone === '' || app.user.phone === null) {
          app.signIn.close();
          app.signUp.open();
          hideUNNeedFields(app.user);
          appLoading(document.body, false);
        } else if (app.user.lucky === 0) {
          callBillInfo(app.user);
        } else {
          callPageInfo(app.user);
        }
      }
    });
  } else {
    firebaseFico.getUser('zalo', data.uid, (res3) => {
      console.log(res3);
      if (res3.length === 0) {
        addUser(provider, data);
      } else {
        user.id = res3[0].id;
        user.cmnd = res3[0].cmnd;
        user.email = res3[0].email;
        user.phone = res3[0].phone;
        user.fullname = res3[0].fullname;
        user.signin = new Date();
        user.created = res3[0].created;
        user[provider] = res3[0][provider];
        user.lucky = res3[0].lucky;
        app.user = user;
        if (app.user.cmnd === '' || app.user.cmnd === null || app.user.phone === '' || app.user.phone === null) {
          app.signIn.close();
          app.signUp.open();
          hideUNNeedFields(app.user);
          appLoading(document.body, false);
        } else if (app.user.lucky === 0) {
          callBillInfo(app.user);
        } else {
          callPageInfo(app.user);
        }
      }
    });
  }
}

async function zaloRequestData(code, uid) {
  const _data = await ajaxRequest({
    method: 'GET',
    url: `https://cors-anywhere.herokuapp.com/https://graph.zalo.me/v2.0/me?access_token=${code}&fields=id%2Cname%2Cphone`,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });

  const data = JSON.parse(_data);
  const _user = {};
  _user.metadata = {};
  _user.uid = uid;
  _user.cmnd = '';
  _user.email = null;
  _user.phoneNumber = null;
  _user.displayName = data.name;
  _user.metadata.lastSignInTime = new Date();
  _user.metadata.creationTime = new Date();

  afterConnect('zalo', _user);
  appLoading(document.body, false);
}

async function zaloRedirect() {
  zaloObject.uid = getUrlQueryString('uid');
  zaloObject.code = getUrlQueryString('code');

  if (zaloObject.code) {
    setCookie('fzalo', zaloObject.code);
    const _z = await ajaxRequest({
      method: 'GET',
      url: `https://cors-anywhere.herokuapp.com/https://oauth.zaloapp.com/v3/access_token?app_id=${zaloConfig.appId}&app_secret=${zaloConfig.s}&code=${zaloObject.code}`,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
    const z = JSON.parse(_z);
    setCookie('fzaloaccess', z.access_token);
    zaloRequestData(z.access_token, zaloObject.uid);
  }
}


app.ready(() => {
  const lazies = new LazyLoad({
    type: 'delay',
    delay: 1000,
  });

  const menuMain = new THPDropdown({
    selector: '.hamburger-menu[data-thp-dropdown]',
    events: {
      beforeOpen() {
        if (html.classList.contains('ios')) {
          window.app.iosTopWindow = window.scrollY;
        }
      },
      afterOpen() {
        html.classList.add('menu-opened');
      },
      afterClose() {
        html.classList.remove('menu-opened');
        if (html.classList.contains('ios')) {
          window.scrollTo(0, window.app.iosTopWindow);
        }
      },
    },
  });

  linkLucky = document.querySelector('#linkLucky');
  if (app.user === undefined) {
    app.user = getCookie('user');
    if (app.user !== '') {
      app.user = JSON.parse(app.user);
      convertNodeListToArray(document.querySelectorAll('.none-logged')).map((x) => {
        x.classList.add('d-none');
        return x;
      });

      convertNodeListToArray(document.querySelectorAll('.logged')).map((x) => {
        x.classList.remove('d-none');
        return x;
      });

      if (app.user.lucky <= 1000 && linkLucky !== null) {
        linkLucky.href = 'update.html';
        linkLucky.innerText = 'Cập nhật thông tin mua hàng';
        linkLucky.click = () => {
          ga('send', 'event', 'detail purchase', 'update', 'before', 'before');
        };
      }
    }
  }

  logout = document.querySelector('.logout');

  contentPolicy = document.querySelector('.content-policy');
  contentBanner = document.querySelector('.main-banner');

  formSignIn.form = document.querySelector('#modalSignIn').querySelector('.form');
  formSignIn.submit = formSignIn.form.querySelector('#btnSignIn');
  formSignIn.phone = formSignIn.form.querySelector('.input-phone');
  formSignIn.password = formSignIn.form.querySelector('.input-password');

  formSignUp.form = document.querySelector('#modalSignUp').querySelector('.form');
  formSignUp.socials = convertNodeListToArray(formSignUp.form.querySelectorAll('.btn-ico--text'));
  formSignUp.phone = formSignUp.form.querySelector('.input-phone');
  formSignUp.cmnd = formSignUp.form.querySelector('.input-cmnd');
  formSignUp.fullname = formSignUp.form.querySelector('.input-fullname');
  formSignUp.password = formSignUp.form.querySelector('.input-password');
  formSignUp.verifypassword = formSignUp.form.querySelector('.input-verifypassword');
  formSignUp.submit = formSignUp.form.querySelector('#btnSignUp');

  logout.addEventListener('click', (e) => {
    e.preventDefault();

    deleteCookie('user');
    window.location.href = '/';
  });

  const _signup = new THPValidation({
    selector: '#modalSignUp form',
  });

  const _signin = new THPValidation({
    selector: '#modalSignIn form',
  });

  [app.formSignUpValidate] = _signup;
  [app.formSignInValidate] = _signin;

  formSignUp.submit.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (app.user) {
      formSignUp.password = '....';
      formSignUp.verifypassword = '....';

      app.formSignUpValidate.validate(false);
      app.user.cmnd = formSignUp.cmnd.value.trim();
      app.user.phone = formSignUp.phone.value.trim();

      if (app.user.lucky === undefined) app.user.lucky = 0;

      if (app.user.phone !== '' && app.user.cmnd !== '') {
        appLoading(document.body, true);
        firebaseFico.getUser('phone', app.user.phone, (res) => {
          if (res.length === 0) {
            firebaseFico.getUser('cmnd', app.user.cmnd, (res2) => {
              if (res2.length === 0) {
                firebaseFico.updateUser(app.user, () => {
                  // console.log('....');
                  callBillInfo(app.user);
                });
              } else {
                appLoading(document.body, false);
                return alert('Đã có tài khoản sử dụng CMND này');
              }
              return true;
            });
          } else {
            appLoading(document.body, false);
            return alert('Đã có tài khoản sử dụng số điện thoai này');
          }
          return true;
        });
      }
    } else {
      app.formSignUpValidate.validate(false);
      if (formSignUp.password.value === formSignUp.verifypassword.value && (formSignUp.password.value !== '')) {
        appLoading(document.body, true);
        const object = {};
        object.phone = formSignUp.phone.value.trim();
        object.cmnd = formSignUp.cmnd.value.trim();
        object.fullname = formSignUp.fullname.value.trim();
        object.password = CryptoJS.AES.encrypt(formSignUp.password.value.trim(), CryptoJS.enc.Utf8.parse('ficoximang2020'), { iv: CryptoJS.enc.Base64.parse('ficoximang2020') }).toString();
        firebaseFico.getUser('phone', object.phone, (res) => {
          if (res.length === 0) {
            firebaseFico.getUser('cmnd', object.cmnd, (res2) => {
              if (res2.length === 0) {
                object.created = new Date();
                object.signin = new Date();
                object.lucky = 0;
                firebaseFico.signUpPhone(object, (res3) => {
                  if (res3.id) {
                    object.id = res3.id;
                    app.user = object;
                    firebaseFico.updateUser(app.user, () => {
                      // console.log('....');
                      callBillInfo(app.user);
                    });
                  }
                });
              } else {
                appLoading(document.body, false);
                return alert('Đã có tài khoản sử dụng CMND này');
              }
            });
          } else {
            appLoading(document.body, false);
            return alert('Đã có tài khoản sử dụng số điện thoai này');
          }
        });
      } else if (formSignUp.password.value !== '') {
        appLoading(document.body, false);
        return alert('Mật khẩu không khớp !!!');
      }
    }

    return this;
  });

  formSignIn.submit.addEventListener('click', (e) => {
    e.preventDefault();
    app.formSignInValidate.validate(false);
    if (formSignIn.phone.value.trim() !== '' && formSignIn.phone.value.password !== '') {
      const object = {};
      object.phone = formSignIn.phone.value.trim();
      object.password = CryptoJS.AES.encrypt(formSignIn.password.value.trim(), CryptoJS.enc.Utf8.parse('ficoximang2020'), { iv: CryptoJS.enc.Base64.parse('ficoximang2020') }).toString();

      appLoading(document.body, true);
      firebaseFico.signInPhone(object, (res) => {
        if (res[0]) {
          [app.user] = res;
          app.user.signin = new Date();
          firebaseFico.updateUser(app.user, () => {
            appLoading(document.body, false);
            callBillInfo(app.user);
          });
        } else {
          appLoading(document.body, false);
        }
      });
    }
  });

  const [modalSignUp] = new THPModal({
    selector: '[data-thp-modal="#modalSignUp"]',
    type: 'inner',
    target: '#modalSignUp',
    events: {
      beforeOpen() {
        menuMain[0].close();
        hideUNNeedFields(app.user);
      },
    },
  });

  const [modalSignIn] = new THPModal({
    selector: '[data-thp-modal="#modalSignIn"]',
    type: 'inner',
    target: '#modalSignIn',
    close: true,
    events: {
      beforeOpen() {
        menuMain[0].close();
      },
    },
  });

  const [modalAlert] = new THPModal({
    selector: '[data-thp-modal="#modalBox"]',
    type: 'inner',
    target: '#modalBox',
  });

  app.menu = menuMain;
  app.lazies = lazies;
  app.signUp = modalSignUp;
  app.signIn = modalSignIn;
  app.scrollPolicy = {};
  app.alert = modalAlert;
  app.alert.elements.message = document.querySelector('#modalBox').querySelector('#message');

  document.querySelector('#closeAlert').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#modalBox').click();
  });

  firebaseFico.init();

  const btnFB = convertNodeListToArray(document.querySelectorAll('.btn-facebook'));
  const btnG = convertNodeListToArray(document.querySelectorAll('.btn-google'));
  const btnZ = convertNodeListToArray(document.querySelectorAll('.btn-zalo'));

  // Facebook
  btnFB.map((x) => {
    x.addEventListener('click', (e) => {
      e.preventDefault();
      appLoading(document.body, true);
      firebaseFico.signInPopup('facebook', (res) => {
        console.log(res);
        if (res.user) {
          afterConnect('facebook', res.user);
          // appLoading(document.body, false);
        } else if (res.message) {
          alert(res.message);
          appLoading(document.body, false);
        }
      });
    });
    return x;
  });

  // Google
  btnG.map((x) => {
    x.addEventListener('click', (e) => {
      e.preventDefault();
      appLoading(document.body, true);
      firebaseFico.signInPopup('google', (res) => {
        // console.log(res);
        if (res.user) {
          afterConnect('google', res.user);
          // appLoading(document.body, false);
        } else if (res.message) {
          alert(res.message);
          appLoading(document.body, false);
        }
      });
    });
    return x;
  });

  // Zalo
  btnZ.map((x) => {
    x.addEventListener('click', (e) => {
      e.preventDefault();
      appLoading(document.body, true);
      window.location.href = `https://oauth.zaloapp.com/v3/permission?app_id=${zaloConfig.appId}&redirect_uri=${encodeURI(zaloConfig.redirectURL)}&state=zalo`;
    });
    return x;
  });

  return app;
});

app.load(() => {
  const _sFAQ = new THPScroll({
    selector: '.content-faq .content__body',
  });

  const _mainBanner = new LazyLoad({
    selector: '#needTrigger',
    type: 'delay',
    delay: 300,
    events: {
      afterLoad() {
        const _sPolicy = new THPScroll({
          selector: '.content-policy .content__body',
          height: app.Site.viewport === 0 ? '250' : (contentBanner.offsetHeight - contentPolicy.querySelector('.content__heading').offsetHeight - 100).toString(),
        });

        [app.scrollPolicy] = _sPolicy;
      },
    },
  });

  [app.scrollFAQ] = _sFAQ;
  [app.mainBanner] = _mainBanner;

  const _isZaloRedirect = getUrlQueryString('state') === 'zalo';

  if (_isZaloRedirect) {
    appLoading(document.body, true);
    zaloRedirect();
  }
});

app.resize(() => {
  setTimeout(() => {
    app.scrollPolicy.destroy();
    [app.scrollPolicy] = new THPScroll({
      selector: '.content-policy .content__body',
      height: app.Site.viewport === 0 ? '250' : (contentBanner.offsetHeight - contentPolicy.querySelector('.content__heading').offsetHeight - 100).toString(),
    });
  }, 100);
}, () => {

});
