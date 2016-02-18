exports.__esModule = true;
exports.toJSON = toJSON;
function toJSON() {
  var form = arguments.length <= 0 || arguments[0] === undefined ? this : arguments[0];

  var vals = {};
  for (var i = 0, l = form.length; i < l; i++) {
    var input = form[i];
    if (!input.name) {
      continue;
    }
    if (input instanceof HTMLInputElement) {
      switch (input.type) {
        case 'checkbox':
          if (input.checked) {
            vals[input.name] = vals[input.name] || [];
            vals[input.name].push(input.value);
          }
          break;
        case 'radio':
          if (input.checked) {
            vals[input.name] = input.value;
          }
          break;
        default:
          if (input.value !== undefined) {
            if (input.type === 'number') {
              vals[input.name] = +input.value;
            } else {
              vals[input.name] = input.value;
            }
          }
          break;
      }
    } else if (input instanceof HTMLTextAreaElement) {
      if (input.value !== undefined) {
        vals[input.name] = input.value;
      }
    } else if (input instanceof HTMLSelectElement) {
      if (input.multiple) {
        vals[i.name] = input.selectedOptions.map(function (i) {
          return i.value;
        }) || [];
        if (vals[i.name].length === 0) {
          delete vals[i.name];
        }
      } else if (input.selectedIndex !== undefined) {
        vals[input.name] = input[input.selectedIndex].value;
      }
    }
  }
  return vals;
}
/*export function toString () {
  return $.param(this.toJSON());
}*/