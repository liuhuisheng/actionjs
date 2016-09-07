import {isFunction, isPlainObject, isArray, extend, uuid} from './util.js'

var app = {};
var cache = {
  config: {}, //配置 app.config({})
  scope: {},  //数据 app.scope(id,scope1)
  plugins: [],//引擎插件 app.plugin('context',PlguinCotext) context scope action data
  actions: {},//行为动作 策略 装饰 覆写 切面 app.action('select',Select)
  preact: {}, //前置动作 app.action('tag',Tag,{preact:[]})
  sufact: {}  //后置动作 app.action('tag',Tag,{sufact:[]})
};

app.config = function (config) {
  extend(cache.config, config);
};

app.plugin = function (fn) {
  cache.plugins.push(fn);
};

app.scope = function (id, data) {
  var length = arguments.length
  if (length == 1) {
    if (isPlainObject(id)) {
      data = id;
      id = uuid();
    }
  }
  cache.scope[id] = isFunction(data) ? new data() : data;
};

app.action = function (id, fn, op) {
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

app.run = function (element) {
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
  this.init = function (root) {
    var context = {};
    for (var i = 0, l = cache.plugins.length; i < l; i++) {
      if (isFunction(cache.plugins[i])) {
        var plugin = new cache.plugins[i];
        this.plugins.push(plugin);
        isFunction(plugin.init) && plugin.init(context, root, cache);
      }
    }
    return context;
  };
  this.executing = function (context, element) {
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
  this.executed = function (context, element) {
    for (var i = 0; i < this.plugins.length; i++) {
      var plugin = this.plugins[i];
      isFunction(plugin.executed) && plugin.executed(context, element);
      plugin.recursive = true;
    }
  };
}

export default app