import {ignoreProperty} from './util.js'

function supportIE() {
  if (!Object.create) {
    Object.create = function (o) {
      function F() { }
      F.prototype = o;
      return new F();
    };
  }

  if (!Object.keys) {
    Object.keys = function (obj) {
      var arr = [];
      for (var k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k) && !ignoreProperty(k))
          arr.push(k);
      }
      return arr;
    };
  }

  if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function (obj) {
      return Object.keys(obj);
    };
  }

  if (!Array.isArray) {
    Array.isArray = function (vArg) {
      return Object.prototype.toString.call(vArg) === "[object Array]";
    };
  }

  if (typeof Array.prototype.forEach != "function") {
    Array.prototype.forEach = function (fn, scope) {
      var i, len;
      for (i = 0, len = this.length; i < len; ++i) {
        if (i in this) {
          fn.call(scope, this[i], i, this);
        }
      }
    };
  }

  if (typeof Array.prototype.indexOf != "function") {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
      var index = -1;
      fromIndex = fromIndex * 1 || 0;

      for (var k = 0, length = this.length; k < length; k++) {
        if (k >= fromIndex && this[k] === searchElement) {
          index = k;
          break;
        }
      }
      return index;
    };
  }

  if (typeof Array.prototype.lastIndexOf != "function") {
    Array.prototype.lastIndexOf = function (searchElement, fromIndex) {
      var index = -1, length = this.length;
      fromIndex = fromIndex * 1 || length - 1;

      for (var k = length - 1; k > -1; k -= 1) {
        if (k <= fromIndex && this[k] === searchElement) {
          index = k;
          break;
        }
      }
      return index;
    };
  }

  if (!isSupportDefineProperty()) {
    if ('__defineGetter__' in {}) {
      Object.defineProperty = function (obj, prop, desc) {
        if ('value' in desc) {
          obj[prop] = desc.value
        }
        if ('get' in desc) {
          obj.__defineGetter__(prop, desc.get)
        }
        if ('set' in desc) {
          obj.__defineSetter__(prop, desc.set)
        }
        return obj
      }
    }
    if (document.documentMode < 9) {
      Object.getOwnPropertyDescriptor = function () {
        return null;
      };
      Object.isExtensible = function () {
        return true;
      };

      function Checker(obj, key, val, desc) {
        this.key = key;
        this.val = val;
        this.get = function () {
          var val = desc.get();
          if (this.val == val) {
            val = obj[key];
            if (this.val != val) {
              desc.set(val);
            }
          }
          return val;
        };
        this.set = desc.set;
      }

      //todo remove item from checkList
      var checkList = [];
      Object.defineProperty = function (obj, key, desc) {
        var val = obj[key] = desc.value != undefined ? desc.value : desc.get();
        if (desc.get && desc.set) {
          var checker = new Checker(obj, key, val, desc);
          checkList.push(checker);
        }
      };

      function loopIE8() {
        for (var i = 0; i < checkList.length; i++) {
          var item = checkList[i];
          var val = item.get();
          if (item.val != val) {
            item.val = val;
            item.set(val);
          }
        }
      }
      setTimeout(function () {
        setInterval(loopIE8, 200);
      }, 1000);
    }
  }
}

function isSupportDefineProperty() {
  try { Object.defineProperty({}, 'a', { value: 0 }); }
  catch (err) { return false; }
  return true;
}

export default supportIE();

