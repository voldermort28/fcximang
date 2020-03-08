import Handlebars from 'handlebars/dist/cjs/handlebars';

Handlebars.registerHelper('iff', (a, operator, b, options) => {
  let result = false;
  switch (operator) {
    case '===':
      result = a === b;
      break;
    case '!==':
      result = a !== b;
      break;
    case '<':
      result = a < b;
      break;
    case '>':
      result = a > b;
      break;
    case '<=':
      result = a <= b;
      break;
    case '>=':
      result = a >= b;
      break;
    default: {
      // throw new Error(`helper iff: invalid operator: \`${operator}\``);
      return options.fn(this);
    }
  }
  return result ? options.fn(this) : options.inverse(this);
});
// Handlebar Helper for plus and add
Handlebars.registerHelper('plus', (a, b) => parseInt(a, 0) + parseInt(b, 0));

Handlebars.registerHelper('subtract', (a, b) => parseInt(a, 0) - parseInt(b, 0));
// Handlebar Helper for formating number to have comas
Handlebars.registerHelper('addComas', num => (num ? num.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') : 0));

// Handlebar Helper for formating number to have digits, Ex: {{#toFixed 1.234 2} -> 1.23
Handlebars.registerHelper('toFixed', (num, digits) => {
  const _num = parseFloat(num);
  const _digits = parseInt(digits, 0);
  return _num.toFixed(_digits);
});

Handlebars.registerHelper('moduloIf', (indexCount, mod, remain, block) => {
  if (parseInt(indexCount, 0) % mod === remain) {
    return block.fn(this);
  }
  return null;
});

Handlebars.registerHelper('eachLimit', (arr, max, options) => {
  if (!arr || arr.length === 0) return options.inverse(this);
  const result = [];
  for (let i = 0; i < max && i < arr.length; i += 1) { result.push(options.fn(arr[i])); }
  return result.join('');
});

Handlebars.registerHelper('for', (from, to, incr, block) => {
  let accum = '';
  for (let i = from; i < to; i += incr) accum += block.fn(i);
  return accum;
});

export default Handlebars;
