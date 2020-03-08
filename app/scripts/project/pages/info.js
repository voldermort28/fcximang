import {
  processTemplate, getCookie, loadTemplate,
} from '../../../../core/truonghoangphuc/utils';

async function renderInfo(_template, _jsonData) {
  const templateDesc = await loadTemplate(_template);
  console.log(_jsonData);
  if (templateDesc !== '') {
    const html = processTemplate(templateDesc, _jsonData);
    document.querySelector('.template-target').innerHTML = html;
  }
}

app.ready(() => {
  if (app.user === undefined) {
    app.user = getCookie('user');
    app.user = JSON.parse(app.user);
  }

  if (app.user) {
    // eslint-disable-next-line no-undef
    renderInfo(`${templatePath}info.html`, app.user);
  } else {
    window.location.href = '/';
  }
});
