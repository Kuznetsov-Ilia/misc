import {document} from 'global';
var i;
export default function(el, flag) {
  if (el) {
    if (flag) {
      if (i === undefined) {
        i = document.createElement('i');
        i.className = 'preloader';
      }
      el.appendChild(i);
    } else if (i) {
      i.remove();
    }
  }
}
