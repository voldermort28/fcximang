/* eslint-disable no-restricted-globals */
/* eslint-disable no-alert */
/* eslint-disable no-console */
import {
  ajaxRequest, getCookie, setCookie, fireEvent,
} from '../../../../core/truonghoangphuc/utils';
import THPValidation from '../../../../core/truonghoangphuc/plugins/thp_validation/thp_validation';

import FirebaseFico from '../widgets/firebase_fico';

const firebaseFico = new FirebaseFico();

async function loadCities(cb) {
  try {
    const cities = await ajaxRequest({
      url: './data/vietnam_cities.json',
    });
    cb(cities);
  } catch (error) {
    console.log(error);
  }
}

async function loadDistrict(cb) {
  try {
    const district = await ajaxRequest({
      url: './data/vietnam_districts.json',
    });

    cb(district);
  } catch (error) {
    console.log(error);
  }
}

async function checkIP() {
  try {
    const txt = await ajaxRequest({
      url: 'https://www.cloudflare.com/cdn-cgi/trace',
    });

    return txt.split('\n').join('|');
  } catch (error) {
    console.log(error);
  }
}

function addBill(object) {
  if (object.total >= 200) {
    window.appLoading(document.body, true);
    firebaseFico.addBill(object, () => {
      // firebaseFico.getBills(app.user, (res1) => {
      //   let total = 0;
      //   res1.map((x) => {
      //     total += x.total;
      //     return total;
      //   });
      //   if (total >= 200) {
      //     // window.location.href = '/info.html';
      //     firebaseFico.getMaxLucky((n) => {
      //       console.log(n, total);
      //       window.appLoading(document.body, false);
      //     });
      //   } else {
      //     window.location.href = '/info.html';
      //   }
      // });
      firebaseFico.getMaxLucky((n) => {
        app.user.lucky = n === 0 ? 1001 : (n + 1);

        firebaseFico.updateUser(app.user, () => {
          setCookie('user', JSON.stringify(app.user), 30);
          window.appLoading(document.body, false);
          window.location.href = '/info.html';
        });
      });
    });
  } else if (!isNaN(object.total) && object.total > 0) {
    window.appLoading(document.body, true);
    firebaseFico.addBill(object, () => {
      window.appLoading(document.body, false);
      alert('Cảm ơn bạn đã tham gia chương trình.\nĐáng tiếc bạn chưa đủ 200 bao xi măng để nhận mã rút thăm,\nvui lòng mua đủ và quay lại tiếp tục tham gia');
    });
  }
}

let districtData = [];
let city;
let district;
let form;
let btnBill;
app.ready(() => {
  city = document.querySelector('select#city');
  district = document.querySelector('select#district');

  if (app.user === undefined) {
    app.user = getCookie('user');
    if (app.user === '') app.user = JSON.parse(app.user);
  }

  city.addEventListener('change', (e) => {
    e.preventDefault();
    const _dis = districtData.filter(x => x.Province_Code === e.target.value.split('|')[0]);
    let _html = '<option value="" selected disabled>Quận/Huyện</option>';
    if (_dis) {
      _dis.map((x) => {
        _html += `<option value="${x.District_Code}|${x.District}">${x.District}</option>`;
        return x;
      });
      district.innerHTML = _html;
    }
  });

  loadCities((res) => {
    const data = JSON.parse(res);
    let _html = '';
    if (data.cities) {
      data.cities.map((x) => {
        _html += `<option value="${x.Province_Code}|${x.Province}">${x.Province}</option>`;
        return x;
      });
      city.innerHTML += _html;
    }

    if (app.user) {
      window.appLoading(document.body, true);
      firebaseFico.getBills(app.user, (res1) => {
        if (res1.length) {
          res1.map((x) => {
            if (x.total >= 200) {
              window.location.href = '/info.html';
            }
            return x;
          });

          const auto = res1[res1.length - 1];

          if (auto.city) {
            city.value = auto.city;
            fireEvent(city, 'change');

            district.value = auto.district;
            document.querySelector('[name="street"]').value = auto.street;
            document.querySelector('[name="shop"]').value = auto.shop;
            document.querySelector('[name="shopphone"]').value = auto.shopphone;
          }
        }
        window.appLoading(document.body, false);
      });
    } else {
      window.location.href = '/';
    }
  });

  loadDistrict((res) => {
    const data = JSON.parse(res);
    if (data.districts) {
      districtData = data.districts;
    }
  });

  form = document.querySelector('.form-bill');
  btnBill = document.querySelector('#btnBill');

  const _v = new THPValidation({
    selector: 'form',
  });

  [app.formBillValidate] = _v;

  btnBill.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    app.formBillValidate.validate(false);

    const formData = new FormData(form);
    const object = {};
    formData.forEach((value, key) => { object[key] = value; });

    object.total = parseInt(object.total, 0);
    object.user_id = app.user.id;
    object.created = new Date();

    checkIP().then((logs) => {
      object.logs = logs;
      addBill(object);
    }).catch(() => {
      addBill(object);
    });
    return false;
  });
});
