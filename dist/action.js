(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.app = factory());
}(this, (function() {
  'use strict';

  function isBrowser() {
    return typeof window !== 'undefined';
  }

  function isFunction(fn) {
    return typeof fn === 'function';
  }

  function isPlainObject(obj) {
    return obj && Object.prototype.toString.call(obj) === '[object Object]';
  }

  function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  function toArray(args) {
    return Array.prototype.concat.apply([], args).slice();
  }

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function uuid() {
    var cached = uuid.cached = uuid.cached || {};
    var id = Math.random().toString(36).slice(2, 10);
    return cached[id] ? uuid() : cached[id] = id;
  }

  function removeEmpty(arr) {
    for (var i = arr.length - 1; i >= 0; i--) {
      if (arr[i] == '' || arr[i] == undefined || arr[i] == null) {
        arr.splice(i, 1);
      }
    }
    return arr;
  }

  function attr(elem, name) {
    return elem.getAttribute(name) || '';
  }

  function pathToArr(path) {
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

  function extend() {
    var options,
      name,
      src,
      copy,
      copyIsArray,
      clone,
      target = arguments[0] || {},
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
          if (ignoreProperty(name)) continue;
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
  var ignores = ['__ob__', '$watch', '$value'];

  function ignoreProperty(name) {
    return ignores.indexOf(name) > -1;
  }

  function addEvent(element, type, callback, useCapture) {
    if (element.addEventListener) {
      element.addEventListener(type, callback, useCapture);
    } else if (element.attachEvent) {
      element.attachEvent('on' + type, callback);
    }
  }

  function supportIE() {
    if (!Object.create) {
      Object.create = function(o) {
        function F() {}
        F.prototype = o;
        return new F();
      };
    }
    if (!Object.keys) {
      Object.keys = function(obj) {
        var arr = [];
        for (var k in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, k) && !ignoreProperty(k)) arr.push(k);
        }
        return arr;
      };
    }
    if (!Object.getOwnPropertyNames) {
      Object.getOwnPropertyNames = function(obj) {
        return Object.keys(obj);
      };
    }
    if (!Array.isArray) {
      Array.isArray = function(vArg) {
        return Object.prototype.toString.call(vArg) === "[object Array]";
      };
    }
    if (typeof Array.prototype.forEach != "function") {
      Array.prototype.forEach = function(fn, scope) {
        var i, len;
        for (i = 0, len = this.length; i < len; ++i) {
          if (i in this) {
            fn.call(scope, this[i], i, this);
          }
        }
      };
    }
    if (typeof Array.prototype.indexOf != "function") {
      Array.prototype.indexOf = function(searchElement, fromIndex) {
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
      Array.prototype.lastIndexOf = function(searchElement, fromIndex) {
        var index = -1,
          length = this.length;
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
        Object.defineProperty = function(obj, prop, desc) {
          if ('value' in desc) {
            obj[prop] = desc.value;
          }
          if ('get' in desc) {
            obj.__defineGetter__(prop, desc.get);
          }
          if ('set' in desc) {
            obj.__defineSetter__(prop, desc.set);
          }
          return obj;
        };
      }
      if (document.documentMode < 9) {
        var checkList;
        (function() {
          var Checker = function Checker(obj, key, val, desc) {
            this.key = key;
            this.val = val;
            this.get = function() {
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
          };
          var loopIE8 = function loopIE8() {
            for (var i = 0; i < checkList.length; i++) {
              var item = checkList[i];
              var val = item.get();
              if (item.val != val) {
                item.val = val;
                item.set(val);
              }
            }
          };
          Object.getOwnPropertyDescriptor = function() {
            return null;
          };
          Object.isExtensible = function() {
            return true;
          };
          checkList = [];
          Object.defineProperty = function(obj, key, desc) {
            var val = obj[key] = desc.value != undefined ? desc.value : desc.get();
            if (desc.get && desc.set) {
              var checker = new Checker(obj, key, val, desc);
              checkList.push(checker);
            }
          };
          setTimeout(function() {
            setInterval(loopIE8, 200);
          }, 1000);
        })();
      }
    }
  }

  function isSupportDefineProperty() {
    try {
      Object.defineProperty({}, 'a', {
        value: 0
      });
    } catch (err) {
      return false;
    }
    return true;
  }
  supportIE();
  var app = {};
  var cache = {
    config: {},
    scope: {},
    plugins: [],
    actions: {},
    preact: {},
    sufact: {}
  };
  app.config = function(config) {
    extend(cache.config, config);
  };
  app.plugin = function(fn) {
    cache.plugins.push(fn);
  };
  app.scope = function(id, data) {
    var length = arguments.length;
    if (length == 1) {
      if (isPlainObject(id)) {
        data = id;
        id = uuid();
      }
    }
    cache.scope[id] = isFunction(data) ? new data() : data;
  };
  app.action = function(id, fn, op) {
    if (fn) {
      cache.actions[id] = fn;
      if (op) {
        isArray(op.preact) && (cache.preact[id] = op.preact);
        isArray(op.sufact) && (cache.sufact[id] = op.preact);
      }
    } else {
      return cache.actions[id];
    }
  };
  app.run = function(element) {
    var root = element || document.body;
    var plugins = new PluginExecutor();
    var context = plugins.init(root);
    walk(root, plugins, context);
  };

  function walk(element, plugins, context) {
    if (plugins.executing(context, element)) {
      var childNodes = element.childNodes;
      for (var i = 0, l = childNodes.length; i < l; i++) {
        if (childNodes[i].nodeType === 1) {
          walk(childNodes[i], plugins, context);
        }
      }
    }
    plugins.executed(context, element);
  };

  function PluginExecutor() {
    this.plugins = [];
    this.init = function(root) {
      var context = {};
      for (var i = 0, l = cache.plugins.length; i < l; i++) {
        if (isFunction(cache.plugins[i])) {
          var plugin = new cache.plugins[i]();
          this.plugins.push(plugin);
          isFunction(plugin.init) && plugin.init(context, root, cache);
        }
      }
      return context;
    };
    this.executing = function(context, element) {
      var recursive = false;
      for (var i = 0; i < this.plugins.length; i++) {
        var plugin = this.plugins[i];
        if (plugin.recursive != false) {
          plugin.recursive = isFunction(plugin.executing) ? plugin.executing(context, element) : true;
        }
        if (plugin.recursive != false) {
          recursive = true;
        }
      }
      return recursive;
    };
    this.executed = function(context, element) {
      for (var i = 0; i < this.plugins.length; i++) {
        var plugin = this.plugins[i];
        isFunction(plugin.executed) && plugin.executed(context, element);
        plugin.recursive = true;
      }
    };
  }
  var template = function template(filename, content) {
    return typeof content === 'string' ? compile(content, {
      filename: filename
    }) : renderFile(filename, content);
  };
  template.version = '3.0.0';
  template.config = function(name, value) {
    defaults[name] = value;
  };
  var defaults = template.defaults = {
    openTag: '<%',
    closeTag: '%>',
    escape: true,
    cache: true,
    compress: false,
    parser: null
  };
  var cacheStore = template.cache = {};
  template.render = function(source, options) {
    return compile(source, options);
  };
  var renderFile = template.renderFile = function(filename, data) {
    var fn = template.get(filename) || showDebugInfo({
      filename: filename,
      name: 'Render Error',
      message: 'Template not found'
    });
    return data ? fn(data) : fn;
  };
  template.get = function(filename) {
    var cache;
    if (cacheStore[filename]) {
      cache = cacheStore[filename];
    } else if (typeof document === 'object') {
      var elem = document.getElementById(filename);
      if (elem) {
        var source = (elem.value || elem.innerHTML).replace(/^\s*|\s*$/g, '');
        cache = compile(source, {
          filename: filename
        });
      }
    }
    return cache;
  };
  var toString = function toString(value, type) {
    if (typeof value !== 'string') {
      type = typeof value;
      if (type === 'number') {
        value += '';
      } else if (type === 'function') {
        value = toString(value.call(value));
      } else {
        value = '';
      }
    }
    return value;
  };
  var escapeMap = {
    "<": "&#60;",
    ">": "&#62;",
    '"': "&#34;",
    "'": "&#39;",
    "&": "&#38;"
  };
  var escapeFn = function escapeFn(s) {
    return escapeMap[s];
  };
  var escapeHTML = function escapeHTML(content) {
    return toString(content).replace(/&(?![\w#]+;)|[<>"']/g, escapeFn);
  };
  var isArray$1 = Array.isArray || function(obj) {
      return {}.toString.call(obj) === '[object Array]';
    };
  var each = function each(data, callback) {
    var i, len;
    if (isArray$1(data)) {
      for (i = 0, len = data.length; i < len; i++) {
        callback.call(data, data[i], i, data);
      }
    } else {
      for (i in data) {
        callback.call(data, data[i], i);
      }
    }
  };
  var utils = template.utils = {
    $helpers: {},
    $include: renderFile,
    $string: toString,
    $escape: escapeHTML,
    $each: each
  };
  template.helper = function(name, helper) {
    helpers[name] = helper;
  };
  var helpers = template.helpers = utils.$helpers;
  template.onerror = function(e) {
    var message = 'Template Error\n\n';
    for (var name in e) {
      message += '<' + name + '>\n' + e[name] + '\n\n';
    }
    if (typeof console === 'object') {
      console.error(message);
    }
  };
  var showDebugInfo = function showDebugInfo(e) {
    template.onerror(e);
    return function() {
      return '{Template Error}';
    };
  };
  var compile = template.compile = function(source, options) {
    options = options || {};
    for (var name in defaults) {
      if (options[name] === undefined) {
        options[name] = defaults[name];
      }
    }
    var filename = options.filename;
    try {
      var Render = compiler(source, options);
    } catch (e) {
      e.filename = filename || 'anonymous';
      e.name = 'Syntax Error';
      return showDebugInfo(e);
    }

    function render(data) {
      try {
        return new Render(data, filename) + '';
      } catch (e) {
        if (!options.debug) {
          options.debug = true;
          return compile(source, options)(data);
        }
        return showDebugInfo(e)();
      }
    }
    render.prototype = Render.prototype;
    render.toString = function() {
      return Render.toString();
    };
    if (filename && options.cache) {
      cacheStore[filename] = render;
    }
    return render;
  };
  var forEach = utils.$each;
  var KEYWORDS = 'break,case,catch,continue,debugger,default,delete,do,else,false' + ',finally,for,function,if,in,instanceof,new,null,return,switch,this' + ',throw,true,try,typeof,var,void,while,with' + ',abstract,boolean,byte,char,class,const,double,enum,export,extends' + ',final,float,goto,implements,import,int,interface,long,native' + ',package,private,protected,public,short,static,super,synchronized' + ',throws,transient,volatile' + ',arguments,let,yield' + ',undefined';
  var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g;
  var SPLIT_RE = /[^\w$]+/g;
  var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
  var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g;
  var BOUNDARY_RE = /^,+|,+$/g;
  var SPLIT2_RE = /^$|,+/;

  function getVariable(code) {
    return code.replace(REMOVE_RE, '').replace(SPLIT_RE, ',').replace(KEYWORDS_RE, '').replace(NUMBER_RE, '').replace(BOUNDARY_RE, '').split(SPLIT2_RE);
  };

  function stringify(code) {
    return "'" + code.replace(/('|\\)/g, '\\$1').replace(/\r/g, '\\r').replace(/\n/g, '\\n') + "'";
  }

  function compiler(source, options) {
    var debug = options.debug;
    var openTag = options.openTag;
    var closeTag = options.closeTag;
    var parser = options.parser;
    var compress = options.compress;
    var escape = options.escape;
    var line = 1;
    var uniq = {
      $data: 1,
      $filename: 1,
      $utils: 1,
      $helpers: 1,
      $out: 1,
      $line: 1
    };
    var isNewEngine = ''.trim;
    var replaces = isNewEngine ? ["$out='';", "$out+=", ";", "$out"] : ["$out=[];", "$out.push(", ");", "$out.join('')"];
    var concat = isNewEngine ? "$out+=text;return $out;" : "$out.push(text);";
    var print = "function(){" + "var text=''.concat.apply('',arguments);" + concat + "}";
    var include = "function(filename,data){" + "data=data||$data;" + "var text=$utils.$include(filename,data,$filename);" + concat + "}";
    var headerCode = "'use strict';" + "var $utils=this,$helpers=$utils.$helpers," + (debug ? "$line=0," : "");
    var mainCode = replaces[0];
    var footerCode = "return new String(" + replaces[3] + ");";
    forEach(source.split(openTag), function(code) {
      code = code.split(closeTag);
      var $0 = code[0];
      var $1 = code[1];
      if (code.length === 1) {
        mainCode += html($0);
      } else {
        mainCode += logic($0);
        if ($1) {
          mainCode += html($1);
        }
      }
    });
    var code = headerCode + mainCode + footerCode;
    if (debug) {
      code = "try{" + code + "}catch(e){" + "throw {" + "filename:$filename," + "name:'Render Error'," + "message:e.message," + "line:$line," + "source:" + stringify(source) + ".split(/\\n/)[$line-1].replace(/^\\s+/,'')" + "};" + "}";
    }
    try {
      var Render = new Function("$data", "$filename", code);
      Render.prototype = utils;
      return Render;
    } catch (e) {
      e.temp = "function anonymous($data,$filename) {" + code + "}";
      throw e;
    }

    function html(code) {
      line += code.split(/\n/).length - 1;
      if (compress) {
        code = code.replace(/\s+/g, ' ').replace(/<!--[\w\W]*?-->/g, '');
      }
      if (code) {
        code = replaces[1] + stringify(code) + replaces[2] + "\n";
      }
      return code;
    }

    function logic(code) {
      var thisLine = line;
      if (parser) {
        code = parser(code, options);
      } else if (debug) {
        code = code.replace(/\n/g, function() {
          line++;
          return "$line=" + line + ";";
        });
      }
      if (code.indexOf('=') === 0) {
        var escapeSyntax = escape && !/^=[=#]/.test(code);
        code = code.replace(/^=[=#]?|[\s;]*$/g, '');
        if (escapeSyntax) {
          var name = code.replace(/\s*\([^\)]+\)/, '');
          if (!utils[name] && !/^(include|print)$/.test(name)) {
            code = "$escape(" + code + ")";
          }
        } else {
          code = "$string(" + code + ")";
        }
        code = replaces[1] + code + replaces[2];
      }
      if (debug) {
        code = "$line=" + thisLine + ";" + code;
      }
      forEach(getVariable(code), function(name) {
        if (!name || uniq[name]) {
          return;
        }
        var value;
        if (name === 'print') {
          value = print;
        } else if (name === 'include') {
          value = include;
        } else if (utils[name]) {
          value = "$utils." + name;
        } else if (helpers[name]) {
          value = "$helpers." + name;
        } else {
          value = "$data." + name;
        }
        headerCode += name + "=" + value + ",";
        uniq[name] = true;
      });
      return code + "\n";
    }
  };
  defaults.openTag = '{{';
  defaults.closeTag = '}}';
  var filtered = function filtered(js, filter) {
    var parts = filter.split(':');
    var name = parts.shift();
    var args = parts.join(':') || '';
    if (args) {
      args = ', ' + args;
    }
    return '$helpers.' + name + '(' + js + args + ')';
  };
  defaults.parser = function(code, options) {
    code = code.replace(/^\s/, '');
    var split = code.split(' ');
    var key = split.shift();
    var args = split.join(' ');
    switch (key) {
      case 'if':
        code = 'if(' + args + '){';
        break;
      case 'else':
        if (split.shift() === 'if') {
          split = ' if(' + split.join(' ') + ')';
        } else {
          split = '';
        }
        code = '}else' + split + '{';
        break;
      case '/if':
        code = '}';
        break;
      case 'each':
        var object = split[0] || '$data';
        var as = split[1] || 'as';
        var value = split[2] || '$value';
        var index = split[3] || '$index';
        var param = value + ',' + index;
        if (as !== 'as') {
          object = '[]';
        }
        code = '$each(' + object + ',function(' + param + '){';
        break;
      case '/each':
        code = '});';
        break;
      case 'echo':
        code = 'print(' + args + ');';
        break;
      case 'print':
      case 'include':
        code = key + '(' + split.join(',') + ');';
        break;
      default:
        if (/^\s*\|\s*[\w\$]/.test(args)) {
          var escape = true;
          if (code.indexOf('#') === 0) {
            code = code.substr(1);
            escape = false;
          }
          var i = 0;
          var array = code.split('|');
          var len = array.length;
          var val = array[i++];
          for (; i < len; i++) {
            val = filtered(val, array[i]);
          }
          code = (escape ? '=' : '=#') + val;
        } else if (template.helpers[key]) {
          code = '=#' + key + '(' + split.join(',') + ');';
        } else {
          code = '=' + code;
        }
        break;
    }
    return code;
  };

  function Template(str) {
    this.render = template.compile(str);
  }
  Template.filter = template.helper;

  function Observer(data, parent) {
    if (data instanceof Observer) {
      return;
    }
    var origin = data.____ob__ || {};
    var submap = origin.submap || {};
    var watchs = origin.watchs || [];
    var parents = origin.parents || [];
    this.watch = function(path, callback, options) {
      if (path.indexOf('[') > -1) {
        path = pathToArr(path).join('.');
      }
      options = extend({
        deep: true
      }, options);
      var watchItem = {
        id: uid++,
        path: path,
        callback: callback,
        options: options
      };
      watchs.push(watchItem);
      this.publishWatch(watchItem);
      return watchItem.id;
    };
    this.unwatch = function(id) {
      for (var i = 0; i < watchs.length; i++) {
        if (watchs[i].id == id) {
          this.revokeWatch(watchs[i]);
          watchs.splice(i, 1);
        }
      }
    };
    this.queryTarget = function(path) {
      return queryTarget(data, path);
    };
    this.publishWatch = function(watchItem, filter) {
      var watchList = watchItem ? [watchItem] : watchs;
      for (var i = 0; i < watchList.length; i++) {
        if (filter && !filter(watchList[i])) {
          continue;
        }
        var target = queryTarget(data, watchList[i].path);
        if (target) {
          var sub = subutil.create(data, target, watchList[i]);
          target.ob.subscribe(sub);
        }
      }
    };
    this.republishWatch = function(key, bubble) {
      key && this.publishWatch(0, function(watch) {
        return watch.path == key || watch.path.substr(0, key.length) == key;
      });
      if (bubble) {
        for (var i = 0; i < parents.length; i++) {
          var parent = parents[i].ob;
          parent.republishWatch(parents[i].key, bubble);
        }
      }
    };
    this.revokeWatch = function(watchItem) {
      var target = queryTarget(data, watchItem.path);
      if (target) {
        target.ob.unsubscribe(watchItem.id);
      }
    };
    this.subscribe = function(sub) {
      subutil.add(submap, sub);
      return sub.id;
    };
    this.unsubscribe = function(id) {
      subutil.remove(submap, id);
    };
    this.notify = function(key, bubble) {
      var subs = submap[key] || [];
      for (var i = 0; i < subs.length; i++) {
        if (bubble && !subs[i].deep) {
          continue;
        }
        subqueue.add(subs[i]);
      }
      for (var i = 0; i < parents.length; i++) {
        var parent = parents[i].ob;
        parent.notify(parents[i].key, true);
      }
      subqueue.fire();
    };
    this.addParent = function(parent) {
      if (!parent) {
        return;
      }
      var key = queryKey(parent.data, data);
      if (key == null) {
        return;
      }
      for (var i = 0; i < parents.length; i++) {
        if (parents[i].ob === parent) {
          parents[i].key = key;
          return;
        }
      }
      parents.push({
        key: key,
        ob: parent
      });
    };
    this.removeParent = function(parent) {
      for (var i = 0; i < parents.length; i++) {
        if (parents[i].ob === parent) {
          parents.splice(i, 1);
          break;
        }
      }
    };
    this.observeProperty = function(key, val) {
      observeProperty(data, key, val);
    };
    this.init = function() {
      this.data = data;
      if (!data.__ob__) {
        def(data, '__ob__', this);
      }
      if (!data.$watch) {
        var _this = this;
        def(data, '$watch', function() {
          _this.watch.apply(_this, arguments);
        });
      }
      if (!data.$value) {
        Object.defineProperty(data, '$value', {
          enumerable: false,
          configurable: true,
          get: function get() {
            return extend(true, isArray(data) ? [] : {}, data);
          }
        });
      }
      if (isArray(data)) {
        augmentArray.augment(data);
      }
      observeAll(data);
    };
    this.init();
    this.addParent(parent);
    this.republishWatch(false, true);
  }

  function observeAll(data) {
    var keys = Object.keys(data);
    for (var i = 0, l = keys.length; i < l; i++) {
      observeProperty(data, keys[i], data[keys[i]]);
    }
  }

  function observeProperty(data, key, val) {
    if (String(key).substr(0, 1) != '$' && !isFunction(val)) {
      defineReactive(data, key, val);
    }
  }

  function Watchtarget(value, key) {
    this.ob = value.__ob__;
    this.key = key;
    this.get = function() {
      var val = value[key];
      if (isPlainObject(val) || isArray(val)) {
        val = val.$value || val;
      }
      return val;
    };
    this.set = function(val) {
      value[key] = val;
    };
  }

  function Subqueue() {
    var dirty = [];
    this.add = function(sub) {
      if (dirty.indexOf(sub) < 0) {
        dirty.push(sub);
      }
    };
    this.fire = function() {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(function() {
        while (dirty.length) {
          var item = dirty.shift();
          item.update();
        }
      }, 0);
    };
  }

  function Subutil() {
    var maps = {};
    this.create = function(data, target, watch) {
      var id = watch.id;
      if (!maps[id]) {
        maps[id] = new Subscriber(data, target, watch);
      } else {
        maps[id].updateSetting(data, target, watch);
      }
      return maps[id];
    };
    this.add = function(submap, sub) {
      var subs = submap[sub.key];
      if (!subs) subs = submap[sub.key] = [];
      for (var i = 0; i < subs.length; i++) {
        if (subs[i].id == sub.id) {
          return;
        }
      }
      subs.push(sub);
    };
    this.remove = function(submap, id) {
      for (var key in submap) {
        if (!hasOwn(submap, key)) return;
        var subs = submap[key] || [];
        for (var i = 0; i < subs.length; i++) {
          if (subs[i].id == id) {
            subs.splice(i, 1);
            delete maps[id];
            return;
          }
        }
      }
    };

    function Subscriber(d, t, w) {
      var data = d,
        target = t,
        watch = w;
      this.id = watch.id;
      this.key = target.key;
      this.deep = watch.options.deep;
      this.value = target.get();
      this.updateSetting = function(d, t, w) {
        data = d, target = t, watch = w;
        subqueue.add(this);
      };
      this.update = function() {
        var value = target.get();
        var origin = this.value;
        if (origin !== value) {
          this.value = value;
          watch.callback.call(data, value, origin);
        }
      };
    }
  }

  function AugmentArray() {
    var arrayProto = Array.prototype;
    var arrayMethods = Object.create(arrayProto);
    var arrayKeys = Object.getOwnPropertyNames(arrayMethods);
    var hasProto = '__proto__' in {};
    ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function(method) {
      var original = arrayProto[method];
      def(arrayMethods, method, function mutator() {
        var i = arguments.length;
        var args = new Array(i);
        while (i--) {
          args[i] = arguments[i];
        }
        var result = original.apply(this, args);
        var ob = this.__ob__;
        var inserted;
        switch (method) {
          case 'push':
            inserted = args;
            break;
          case 'unshift':
            inserted = args;
            break;
          case 'splice':
            inserted = args.slice(2);
            break;
        }
        if (inserted) observeAll(inserted);
        var key = queryKey(ob.data, this);
        ob.notify(key);
        return result;
      });
    });
    def(arrayProto, '$set', function $set(index, val) {
      if (index >= this.length) {
        this.length = Number(index) + 1;
      }
      return this.splice(index, 1, val)[0];
    });
    def(arrayProto, '$remove', function $remove(item) {
      if (!this.length) return;
      var index = indexOf(this, item);
      if (index > -1) {
        return this.splice(index, 1);
      }
    });

    function protoAugment(target, src) {
      target.__proto__ = src;
    }

    function copyAugment(target, src, keys) {
      for (var i = 0, l = keys.length; i < l; i++) {
        var key = keys[i];
        def(target, key, src[key]);
      }
    }
    var augment = hasProto ? protoAugment : copyAugment;
    this.augment = function(arr) {
      augment(arr, arrayMethods, arrayKeys);
    };
  }

  function defineReactive(obj, key, val) {
    var ob = obj.__ob__;
    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
      return;
    }
    var getter = property && property.get;
    var setter = property && property.set;
    observe(val, ob);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter() {
        var value = getter ? getter.call(obj) : val;
        return value;
      },
      set: function reactiveSetter(newVal) {
        var value = getter ? getter.call(obj) : val;
        if (newVal === value) {
          return;
        }
        if (setter) {
          setter.call(obj, newVal);
        } else {
          val = newVal;
        }
        observe(newVal, ob);
        ob.notify(key);
      }
    });
    return obj;
  }

  function observe(value, parent) {
    if (!value || typeof value !== 'object') {
      return;
    }
    var ob;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else if ((isArray(value) || isPlainObject(value)) && Object.isExtensible(value)) {
      ob = new Observer(value, parent);
    }
    return ob;
  }

  function def(obj, key, val, enumerable) {
    obj = Object.defineProperty(obj, key, {
      value: val,
      enumerable: !! enumerable,
      writable: true,
      configurable: true
    });
  }

  function queryTarget(data, path) {
    var value = data;
    var key,
      paths = pathToArr(path);
    while (paths.length) {
      if (!(isPlainObject(value) || isArray(value))) {
        break;
      }
      key = paths.shift();
      if (paths.length == 0 && value.__ob__) {
        return new Watchtarget(value, key);
      }
      value = value[key];
    }
    return null;
  }

  function queryKey(scope, data) {
    if (!data) return null;
    for (var i in scope) {
      if (hasOwn(scope, i) && scope[i] === data) {
        return i;
      }
    }
    return null;
  }
  var uid = 1;
  var subqueue = new Subqueue();
  var subutil = new Subutil();
  var augmentArray = new AugmentArray();

  function PluginContext() {
    this.init = function(context, element) {
      context.root = element;
      context.browser = isBrowser();
    };
    this.executing = function(context, element) {
      context.element = element;
    };
    this.executed = function(context) {
      context.element = null;
    };
  }

  function PluginScope() {
    this.init = function(context, element, cache) {
      context.scope = cache.scope;
    };
    this.executing = function(context, element) {
      this.parentScope = context.scope;
      var scopeName = attr(context.element, 'scope');
      if (scopeName) {
        context.scope = this.parentScope[scopeName] || {};
      }
    };
    this.executed = function(context, element) {
      context.scope = this.parentScope;
    };
  }

  function PluginObserver() {
    this.init = function(context, element) {
      if (typeof Observer !== 'undefined') {
        new Observer(context.scope);
      }
    };
  }

  function PluginData() {
    this.executing = function(context, element) {
      var attrs = parseAttrs(element);
      context.data = mappingFields(context.scope, attrs.data, attrs.mapping);
    };

    function mappingFields(src, tar, mapping) {
      var srcOb = src.__ob__;
      var tarOb = new Observer(tar);
      for (var k in mapping) {
        if (mapping.hasOwnProperty(k)) {
          (function(k) {
            var access = srcOb.queryTarget(mapping[k]);
            var val = access.get();
            if (isFunction(val)) {
              tar[k] = val;
              return;
            }
            tarOb.observeProperty(k, val);
            src.$watch(mapping[k], function(val, ori) {
              tar[k] = val;
            });
            tar.$watch(k, function(val) {
              access && access.set(val);
            });
          })(k);
        }
      }
      return tar;
    }

    function parseAttrs(element) {
      var result = {
        data: {},
        mapping: {}
      };
      var attrs = element.attributes;
      for (var i = 0; i < attrs.length; i++) {
        var p = attrs[i],
          prefix = p.name.substr(0, 5);
        if (prefix == 'data.') {
          result.mapping[p.name.substring(5)] = p.value;
        } else if (prefix == 'data-') {
          result.data[p.name.substring(5)] = p.value;
        }
      }
      return result;
    };
  }

  function PluginStage() {
    this.executing = function(context, element) {
      context.stage = new Stage(context);
    };

    function Stage(context) {
      this.context = context;
      this.get = function() {
        if (!this.stages) {
          var attrstr = this.context.element.getAttribute('stage') || '';
          this.stages = attrstr.replace(/\s*/g, '').split(',');
        }
        return this.stages;
      };
      this.has = function(stage) {
        var stages = this.get();
        for (var i = 0, l = stages.length; i < l; i++) {
          if (stage == stages[i]) return true;
        }
        return false;
      };
      this.set = function(stage) {
        var stages = this.get();
        if (!this.has(stage)) {
          stages.push(stage);
        }
        var attrstr = stages.join(',').replace(/(^,*)|(,*$)/g, '');
        this.context.element.setAttribute('stage', attrstr);
      };
    };
  }

  function PluginAction() {
    var cache;
    this.init = function() {
      cache = arguments[2];
    };
    this.executing = function(context, element) {
      var actions = parseActions(element);
      for (var i = 0; i < actions.length; i++) {
        executeAction(actions[i], context);
      }
      return true;
    };

    function executeAction(actionId, context) {
      if (!cache.actions[actionId]) return;
      var resolve = resolveAction(actionId);
      var action = createAction(resolve, context);
      executeInterruptor('preact', resolve);
      action && isFunction(action.execute) && action.execute();
      executeInterruptor('sufact', resolve);
    }

    function resolveAction(actionId) {
      var resolve = [actionId];
      var pos = actionId.indexOf('.');
      while (pos > -1) {
        actionId = actionId.substring(pos + 1);
        actionId && resolve.unshift(actionId);
        pos = actionId.indexOf('.');
      }
      return resolve;
    }

    function createAction(resolve, context) {
      var Action = cache.actions[resolve[0]];
      if (!isFunction(Action)) return null;
      var action = new Action(context);
      action.id = uuid();
      action.context = context;
      action.element = context.element;
      action.data = context.data;
      for (var i = 1, l = resolve.length; i < l; i++) {
        Action = cache.actions[resolve[i]];
        if (!isFunction(Action)) break;
        var handle = new Action(context);
        var keys = Object.keys(handle);
        while (keys.length) {
          var name = keys.shift(),
            base = action[name],
            property = handle[name];
          action[name] = isFunction(property) ? wrapFnBase(action, base, property) : property;
        }
      }
      return action;
    }

    function executeInterruptor(type, resolve) {
      for (var j = 0, m = resolve.length; i < m; j++) {
        var actions = cache[type][resolve[j]] || [];
        for (var i = 0, l = actions.length; i < l; i++) {
          if (actions[i] != resolve[j]) {
            executeAction(actions[i], context);
          }
        }
      }
    }

    function parseActions(element) {
      var actions = [],
        attrs = element.attributes;
      for (var i = 0; i < attrs.length; i++) {
        var item = attrs[i];
        var arr = item.name.split('.');
        if (arr[0] == 'action' && item.value) {
          var suffix = '',
            subarr = item.value.split(',');
          for (var j = 1; j < arr.length; j++) {
            arr[j] && (suffix += '.' + arr[j]);
          }
          for (var k = 0; k < subarr.length; k++) {
            actions.push(subarr[k] + suffix);
          }
        }
      }
      return actions;
    }

    function wrapFnBase(scope, base, fn) {
      return function() {
        scope.base = base;
        var result = fn.apply(scope, arguments);
        scope.base = null;
        return result;
      };
    }
  }

  function Monitor(root) {
    this.listen = function(selector, listener, options) {
      if (isFunction(selector)) {
        options = listener;
        listener = selector;
        selector = '';
      }
      if (!selector) {
        bindEvent(root, listener);
      } else if (options && options.delegate) {
        bindEvent(root, wrapDelegate(listener));
      } else {
        var targets = toArray(root.querySelectorAll(selector));
        for (var i = 0; i < targets.length; i++) {
          bindEvent(targets[i], listener);
        }
      }
    };

    function bindEvent(element, callback) {
      if (document.documentMode < 9) {
        callback = fixCallback(element, callback);
      }
      switch (element.type) {
        case 'radio':
        case 'checkbox':
          return addEvent(element, 'click', callback, false);
        case 'select':
          return addEvent(element, 'change', callback, false);
        default:
          return oninput(element, callback);
      }
    }

    function fixCallback(element, fn) {
      var timeout;
      return function(event) {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
          fn.call(element, event);
        }, 0);
      };
    }

    function wrapDelegate(element, selector, fn) {
      return function(event) {
        var target = event.target;
        var targets = toArray(element.querySelectorAll(selector));
        if (targets.indexOf(target) != -1) {
          return fn.call(target, event);
        }
      };
    }

    function oninput(element, callback) {
      addEvent(element, 'input', callback, false);
      if (document.documentMode == 9) {
        addEvent(element, 'change', callback, false);
        var selectionchange = function selectionchange(event) {
          callback.call(element, event);
        };
        addEvent(element, 'focus', function() {
          document.addEventListener('selectionchange', selectionchange, false);
        }, false);
        addEvent(element, 'blur', function() {
          document.removeEventListener('selectionchange', selectionchange, false);
        }, false);
      } else if (document.documentMode < 9) {
        addEvent(element, 'change', callback, false);
        addEvent(element, 'propertychange', function(event) {
          if (event.propertyName == 'value') {
            callback.call(element, event);
          }
        }, false);
      }
    }
  }

  function Tag() {
    this.execute = function() {
      var stage = this.context.stage;
      if (!stage.has('render')) {
        this.render();
        stage.set('render');
      }
      if (this.context.browser && !stage.has('init')) {
        this.init();
        stage.set('init');
      }
    };
    this.render = function() {
      if (!this.templateRender) {
        var template = isFunction(this.template) ? this.template() : this.template;
        this.templateRender = new Template(template);
      }
      var html = this.templateRender.render(this.data);
      this.element.innerHTML = html;
    };
    this.init = function() {};
    this.template = function() {
      return '';
    };
    this.watch = function(path, subscriber, options) {
      var arr = removeEmpty(path.split(','));
      for (var i = 0; i < arr.length; i++) {
        this.data.$watch(path, subscriber, options);
      }
    };
    this.listen = function(selector, listner, options) {
      if (!this.monitor) {
        this.monitor = new Monitor(this.element);
      }
      this.monitor.listen(selector, listner, options);
    };
  }

  function Event() {
    this.execute = function() {
      for (var key in this.data) {
        if (this.data.hasOwnProperty(key) && isFunction(this.data[key])) {
          addEvent(this.element, key, this.data[key]);
        }
      }
    };
  }
  app.plugin(PluginContext);
  app.plugin(PluginScope);
  app.plugin(PluginObserver);
  app.plugin(PluginData);
  app.plugin(PluginStage);
  app.plugin(PluginAction);
  app.filter = Template.filter;
  app.action('tag', Tag);
  app.action('event', Event);
  return app;
})));