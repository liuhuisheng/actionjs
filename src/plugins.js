import {isBrowser, isFunction, isPlainObject, removeEmpty, uuid, attr, pathToArr} from './util.js'
import Observer from './observer.js'

export function PluginContext() {
  this.init = function (context, element) {
    context.root = element;
    context.browser = isBrowser();
  };
  this.executing = function (context, element) {
    context.element = element;
  };
  this.executed = function (context) {
    context.element = null;
  };
}

export function PluginScope() {
  this.init = function (context, element, cache) {
    context.scope = cache.scope;
  };
  this.executing = function (context, element) {
    this.parentScope = context.scope;
    var scopeName = attr(context.element, 'scope');
    if (scopeName) {
      context.scope = this.parentScope[scopeName] || {}
    }
  };
  this.executed = function (context, element) {
    context.scope = this.parentScope;
  };
}

export function PluginObserver() {
  this.init = function (context, element) {
    if (typeof Observer !== 'undefined') {
      new Observer(context.scope);
    }
  };
}

export function PluginData() {
  this.executing = function (context, element) {
    var attrs = parseAttrs(element);
    context.data = mappingFields(context.scope,attrs.data,attrs.mapping);
  };
  
  function mappingFields(src,tar,mapping){
    var srcOb = src.__ob__;
    var tarOb = new Observer(tar);
    for (var k in mapping) {
      if (mapping.hasOwnProperty(k)) {
        (function(k){
          var access = srcOb.queryTarget(mapping[k]);
          var val = access.get();
          if (isFunction(val)){
            tar[k] = val;
            return;
          }
          tarOb.observeProperty(k,val);
          src.$watch(mapping[k],function(val,ori){
            tar[k] = val;
          });
          tar.$watch(k,function(val){
            access && access.set(val);
          });
        })(k);
      }
    }
    return tar;
  }

  function parseAttrs(element) {
    var result = {data:{},mapping:{}};
    var attrs = element.attributes;
    for (var i = 0; i < attrs.length; i++) {
      var p = attrs[i], prefix = p.name.substr(0, 5);
      if (prefix == 'data.') {
        result.mapping[p.name.substring(5)] = p.value;
      } else if (prefix == 'data-') {
        result.data[p.name.substring(5)] = p.value;
      }
    }
    return result;
  };
}

export function PluginStage() {
  this.executing = function (context, element) {
    context.stage = new Stage(context);
  };
  function Stage(context) {
    this.context = context;
    this.get = function () {
      if (!this.stages) {
        var attrstr = this.context.element.getAttribute('stage') || '';
        this.stages = attrstr.replace(/\s*/g, '').split(',');
      }
      return this.stages;
    };
    this.has = function (stage) {
      var stages = this.get();
      for (var i = 0, l = stages.length; i < l; i++) {
        if (stage == stages[i])
          return true;
      }
      return false;
    };
    this.set = function (stage) {
      var stages = this.get();
      if (!this.has(stage)) {
        stages.push(stage);
      }
      var attrstr = stages.join(',').replace(/(^,*)|(,*$)/g, '');
      this.context.element.setAttribute('stage', attrstr);
    };
  };
}

export function PluginAction() {
  var cache;
  this.init = function () {
    cache = arguments[2];
  };
  this.executing = function (context, element) {
    var actions = parseActions(element);
    for (var i = 0; i < actions.length; i++) {
      executeAction(actions[i], context);
    }
    return true;
  };

  function executeAction(actionId, context) {
    if (!cache.actions[actionId])
      return;

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
    if (!isFunction(Action))
      return null;

    var action = new Action(context);
    action.id = uuid();
    action.context = context;
    action.element = context.element;
    action.data = context.data;

    for (var i = 1, l = resolve.length; i < l; i++) {
      Action = cache.actions[resolve[i]];
      if (!isFunction(Action))
        break;

      var handle = new Action(context);
      var keys = Object.keys(handle);
      while (keys.length) {
        var name = keys.shift(), base = action[name], property = handle[name];
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
    var actions = [], attrs = element.attributes;
    for (var i = 0; i < attrs.length; i++) {
      var item = attrs[i];
      var arr = item.name.split('.');
      if (arr[0] == 'action' && item.value) {
        var suffix = '', subarr = item.value.split(',');
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
    return function () {
      scope.base = base;
      var result = fn.apply(scope, arguments);
      scope.base = null;
      return result;
    };
  }
}