
export function isBrowser() {
  return typeof window !== 'undefined';
}

export function isFunction(fn) {
  return typeof fn === 'function';
}

export function isPlainObject(obj) {
  return obj && Object.prototype.toString.call(obj) === '[object Object]';
}

export function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

export function isDOM(obj) {
  if (typeof HTMLElement === 'object') {
    return obj instanceof HTMLElement;
  } else {
    return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
  }
}

export function toArray(args){
  return Array.prototype.concat.apply([],args).slice();
}

export function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function uuid() {
  var cached = uuid.cached = uuid.cached || {};
  var id = Math.random().toString(36).slice(2, 10);
  return cached[id] ? uuid() : (cached[id] = id);
}

export function removeEmpty(arr) {
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == '' || arr[i] == undefined || arr[i] == null) {
      arr.splice(i, 1);
    }
  }
  return arr;
}

export function attr(elem, name) {
  return elem.getAttribute(name) || '';
}

export function pathToArr(path) {
  if (!path) {
    return [];
  }
  if (!path.match) {
    return [path];
  }
  if (!path.match(/\[|\]/)) {
    return path.split(/\./);
  }
  var s = path.replace(/\[|\].|\]/g, '.').replace(/\.$/, '');
  return s.split(/\./);
}

export function extend() {
  var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false;
  if (typeof target === "boolean") {
    deep = target;
    target = arguments[1] || {};
    i = 2;
  }
  if (typeof target !== "object" && !isFunction(target)) {
    target = {};
  }
  if (length === i) {
    target = this;
    --i;
  }
  for (; i < length; i++) {
    if ((options = arguments[i]) != null) {
      for (name in options) {
        if (ignoreProperty(name))
          continue;

        src = target[name];
        copy = options[name];
        if (target === copy) {
          continue;
        }
        if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && isArray(src) ? src : [];
          } else {
            clone = src && isPlainObject(src) ? src : {};
          }
          target[name] = extend(deep, clone, copy);
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }
  return target;
}
 
var ignores = ['__ob__','$watch','$value'];
export function ignoreProperty(name){
  return ignores.indexOf(name)>-1;
}
 
export function addEvent(element, type, callback, useCapture) { 
  if (element.addEventListener) {  
    element.addEventListener(type, callback, useCapture);
  }else if (element.attachEvent) {  
    element.attachEvent('on'+type, callback);
  }
}
