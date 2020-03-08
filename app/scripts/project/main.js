/* eslint-disable no-console */
/* eslint-disable no-undef */
/**
  * This is the main entry point for a project
* */

// Import main style: webpack will convert into html output as main.min.css when build
import '../../assets/styles/app.scss';
import '../../assets/styles/_internal.scss';

import App from '../../../core/truonghoangphuc/app';
import LazyLoad from '../../../core/truonghoangphuc/plugins/thp_lazy/thp_lazy';
import THPScroll from '../../../core/truonghoangphuc/plugins/thp_scroll/thp_scroll';
import THPDropdown from '../../../core/truonghoangphuc/plugins/thp_dropdown/thp_dropdown';
import THPModal from '../../../core/truonghoangphuc/plugins/thp_modal/thp_modal';

import FirebaseFico from './widgets/firebase_fico';
import {
  setCookie, getCookie, deleteCookie, convertNodeListToArray, processTemplate,
} from '../../../core/truonghoangphuc/utils';

const setting = {
  breakpoints: [768, 992, 1200],
};

window.app = new App(setting);
const html = document.querySelector('html');
let contentPolicy;
let contentBanner;
let btnLucky;
const formSignUp = {};
const formSignIn = {};
const firebaseFico = new FirebaseFico();

function callPageInfo(user) {
  setCookie('user', JSON.stringify(user), 30);
  window.location.href = '/info.html';
}

function callBillInfo(user) {
  firebaseFico.getBills(user, (res) => {
    let total = 0;
    res.map((x) => {
      total += x.total;
      return total;
    });
    if (total >= 200) {
      callPageInfo(iser);
    } else {
      setCookie('user', JSON.stringify(user), 30);
      window.location.href = '/update.html';
    }
  });
}

function afterConnect(provider, data) {
  if (data.phoneNumber !== null) {
    firebaseFico.getUser('phone', data.phoneNumber, (res1) => {
      if (res1.length === 0 && data.email === null) {
        firebaseFico.getUser('email', data.email, (res2) => {
          if (res2.length === 0) {
            const user = {
              cmnd: '',
              email: data.email,
              phone: data.phoneNumber,
              fullname: data.displayName,
              signin: data.metadata.lastSignInTime,
              created: data.metadata.creationTime,
              lucky: 0,
            };
            user[provider] = data.uid;
            firebaseFico.addUser(user, (res) => {
              if (res.id) {
                user.id = res.id;
                app.user = user;
                if (app.user.cmnd === '' || app.user.cmnd === null || app.user.phone === '' || app.user.phone === null) {
                  app.signUp.open();
                }
              }
            });
          }
        });
      }
    });
  } else if (data.email !== null) {
    firebaseFico.getUser('email', data.email, (res2) => {
      const user = {};
      if (res2.length === 0) {
        user.cmnd = '';
        user.email = data.email;
        user.phone = data.phoneNumber;
        user.fullname = data.displayName;
        user.signin = data.metadata.lastSignInTime;
        user.created = data.metadata.creationTime;
        user[provider] = data.uid;
        firebaseFico.addUser(user, (res) => {
          if (res.id) {
            user.id = res.id;
            app.user = user;
            if (app.user.cmnd === '' || app.user.cmnd === null) {
              app.signUp.open();
            }
          }
        });
      } else {
        user.id = res2[0].id;
        user.cmnd = res2[0].cmnd;
        user.email = res2[0].email;
        user.phone = res2[0].phone;
        user.fullname = res2[0].fullname;
        user.signin = res2[0].signin;
        user.created = res2[0].created;
        user.lucky = res2[0].lucky;
        app.user = user;
        if (app.user.cmnd === '' || app.user.cmnd === null || app.user.phone === '' || app.user.phone === null) {
          app.signUp.open();
        } else if (app.user.lucky === 0) {
          callBillInfo(app.user);
        } else {
          callPageInfo(app.user);
        }
      }
    });
  }
}

function appLoading(el, isLoading) {
  if (isLoading) el.classList.add('loading');
  if (!isLoading) el.classList.remove('loading');
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

  btnLucky = document.querySelector('btnLucky');
  contentPolicy = document.querySelector('.content-policy');
  contentBanner = document.querySelector('.main-banner');
  formSignUp.form = document.querySelector('#modalSignUp').querySelector('.form');
  formSignIn.form = document.querySelector('#modalSignUp').querySelector('.form');
  formSignUp.phone = formSignUp.form.querySelector('.input-phone');
  formSignUp.cmnd = formSignUp.form.querySelector('.input-cmnd');
  formSignUp.fullname = formSignUp.form.querySelector('.input-fullname');
  formSignUp.password = formSignUp.form.querySelector('.input-password');
  formSignUp.verifypassword = formSignUp.form.querySelector('.input-verifypassword');
  formSignUp.submit = formSignUp.form.querySelector('#btnSignUp');

  formSignUp.submit.addEventListener('click', (e) => {
    e.preventDefault();

    if (app.user) {
      firebaseFico.updateUser(app.user);
    } else {
      // TODO
    }
  });

  const [modalSignUp] = new THPModal({
    selector: '[data-thp-modal="#modalSignUp"]',
    type: 'inner',
    target: '#modalSignUp',
    events: {
      afterOpen() {
        if (app.user) {
          formSignUp.password.classList.add('hide');
          formSignUp.verifypassword.classList.add('hide');
          formSignUp.fullname.value = app.user.fullname;
          if (app.user.cmnd) formSignUp.cmnd.value = app.user.cmnd;
          if (app.user.phone) formSignUp.phone.value = app.user.phone;
        }
      },
    },
  });

  const [modalSignIn] = new THPModal({
    selector: '[data-thp-modal="#modalSignIn"]',
    type: 'inner',
    target: '#modalSignIn',
  });

  app.menu = menuMain;
  app.lazies = lazies;
  app.signUp = modalSignUp;
  app.signIn = modalSignIn;
  firebaseFico.init();

  const btnFB = convertNodeListToArray(document.querySelectorAll('.btn-facebook'));

  btnFB.map((x) => {
    x.addEventListener('click', () => {
      appLoading(document.body, true);
      firebaseFico.signInPopup('facebook', (res) => {
        console.log(res);
        if (res.user !== null) {
          afterConnect('facebook', res.user);
        }
      });
    });
    return x;
  });

  return app;
});

app.load(() => {
  const _sFAQ = new THPScroll({
    selector: '.content-faq .content__body',
  });

  const _sPolicy = new THPScroll({
    selector: '.content-policy .content__body',
    height: app.Site.viewport === 0 ? '250' : (contentBanner.offsetHeight - contentPolicy.querySelector('.content__heading').offsetHeight - 100).toString(),
  });

  [app.scrollFAQ] = _sFAQ;
  [app.scrollPolicy] = _sPolicy;
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
