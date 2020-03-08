import {
  processTemplate, getCookie,
} from '../../../../core/truonghoangphuc/utils';

app.ready(() => {
  if (app.user === undefined) {
    app.user = getCookie('user');
    if (app.user !== '') {
      app.user = JSON.parse(app.user);
      processTemplate(document.querySelector('.template[data-template="true"]'), app.user);
    } else {
      window.location.href = '/';
    }
  }
});
