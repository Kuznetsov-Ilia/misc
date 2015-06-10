var template = document.createElement('template');
var div = document.createElement('div');
var fragment = document.createDocumentFragment();
var textNode = document.createTextNode('');

export default class Template {
  constructor (data, root) {
    this.init();
    this.render(data, root);
  }

  set (key, value) {
    if (key in this.keys) {
      if (this.keys[key] === 'text') {
        if (this.prev[key] !== value) {
          this.el[key].nodeValue = value;
          this.prev[key] = value;
        }
      } else if (this.keys[key] === 'attr') {
        if (this.prev[key] !== value) {
          var attr = this.attr.filter(function(a){ return a.key.indexOf(key) !== -1; })[0];
          var val;
          //var _this = this;
          this.prev[key] = value;
          if (attr.isComplex) {
            if (attr.key) {
              /*attr.key.forEach(function(key){
                _this.prev[key]
              })*/
              val = attr.key.reduce(replaceAttr(this), attr.tmpl);
            }
          } else {
            val = value;
          }
          this.el[key].setAttribute(attr.name, val);
        }
      } else if (this.keys[key] === 'html') {
        if (this.prev[key] !== value) {
          var newChild = div.cloneNode(false);
          newChild.innerHTML = value;
          var oldChild = this.el[key];
          oldChild.parentNode.replaceChild(newChild, oldChild);
          this.el[key] = newChild;
          this.prev[key] = value;
        }
      }
    } else {
      return console.error('unknown key', key);
    }
  }

  get (key) {
    if (key in this.keys) {
      if (this.keys[key] === 'text') {
        return this.el[key];
      }
    } else {
      return console.error('unknown key', key);
    }
  }

  render(data, root) {
    root.appendChild(this.root);
    for (var key in this.keys) {
      if (this.keys[key] === 'text') {
        var newChild = textNode.cloneNode(false);
        var oldChild = this.el[key];
        oldChild.parentNode.replaceChild(newChild, oldChild);
        this.el[key] = newChild;
        this.prev[key] = oldChild;
      }
    }
  }

  getValue (key) {
    return this.prev[key];
  }

  static load (strHTML) {
    var root = template.cloneNode(false);
    root.innerHTML = strHTML;
    return root.content || templateFallback(root);
  }
}

function replaceAttr(_this) {
  return function(tmpl, key) {
    return tmpl.replace('{' + key + '}', _this.prev[key]);
  };
}
function templateFallback(root) {
  var f = fragment.cloneNode(false);
  var child;
  while (child = root.firstElementChild) {
    f.appendChild(child);
  }
  return f;
}
