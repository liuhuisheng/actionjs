import {isFunction, isPlainObject, hasOwn, isArray, extend, pathToArr} from './util.js'

function Observer(data,parent){
  if (data instanceof Observer){
    return;
  }
 
  var origin = data.____ob__||{};
  var submap = origin.submap||{};
  var watchs = origin.watchs||[];
  var parents = origin.parents||[];
  
  this.watch = function(path,callback,options){
    if (path.indexOf('[')>-1){
      path = pathToArr(path).join('.');
    }
    options = extend({ deep: true},options)
    var watchItem = {id:uid++,path:path,callback:callback,options:options};
    watchs.push(watchItem);
    this.publishWatch(watchItem);
    return watchItem.id;
  };

  this.unwatch = function(id){
    for(var i=0;i<watchs.length;i++){
      if (watchs[i].id == id){
        this.revokeWatch(watchs[i]);
        watchs.splice(i,1);
      }
    }
  };

  this.queryTarget = function(path){
    return queryTarget(data, path);
  };

  this.publishWatch = function(watchItem,filter){
    var watchList = watchItem?[watchItem]:watchs;
    for(var i=0;i<watchList.length;i++){
      if (filter && !filter(watchList[i])){
          continue;
      }
      var target = queryTarget(data, watchList[i].path);
      if (target){
        var sub = subutil.create(data,target,watchList[i])
        target.ob.subscribe(sub);
      }
    }
  };
  
  this.republishWatch = function(key, bubble){
    key && this.publishWatch(0,function(watch){
      return watch.path==key || watch.path.substr(0,key.length)==key;
    });
     
    if (bubble){
      for(var i=0;i<parents.length;i++){
        var parent = parents[i].ob;
        parent.republishWatch(parents[i].key, bubble);
      }
    }
  };
  
  this.revokeWatch = function(watchItem){
    var target = queryTarget(data, watchItem.path);
    if (target){
      target.ob.unsubscribe(watchItem.id);
    }
  };

  this.subscribe = function(sub){
    subutil.add(submap,sub)
    return sub.id;
  };

  this.unsubscribe = function(id){
    subutil.remove(submap,id);
  };

  this.notify = function(key, bubble){
    var subs = submap[key]||[];
    for(var i=0;i<subs.length;i++){
      if (bubble && !subs[i].deep){
        continue;
      }
      subqueue.add(subs[i])
    }
    for(var i=0;i<parents.length;i++){
      var parent = parents[i].ob;
      parent.notify(parents[i].key, true);
    }
    subqueue.fire();
  };
  
  this.addParent = function(parent){
    if (!parent ){
      return;
    }
   
    var key = queryKey(parent.data, data);
    if (key==null){
      return;
    }

    for(var i=0;i<parents.length;i++){
      if (parents[i].ob === parent){
        parents[i].key = key;
        return;
      }
    }

    parents.push({key:key,ob:parent});
  };

  this.removeParent = function(parent){
    for(var i=0;i<parents.length;i++){
      if (parents[i].ob === parent){
        parents.splice(i,1);
        break;
      }
    }
  };
 
  this.observeProperty = function(key,val){
    observeProperty(data, key, val);
  };

  this.init = function(){
    this.data = data;
    if (!data.__ob__){
      def(data,'__ob__',this);
    }

    if (!data.$watch){
      var _this = this;
      def(data,'$watch',function(){
        _this.watch.apply(_this,arguments);
      });
    }

    if (!data.$value){
      Object.defineProperty(data, '$value', {
        enumerable: false,
        configurable: true,
        get: function(){
          return extend(true, isArray(data) ? [] : {}, data);
        }
      })
    }

    if (isArray(data)) {
      augmentArray.augment(data);
    }

    observeAll(data);
  }
  
  this.init();
  this.addParent(parent);
  this.republishWatch(false, true);
}

function observeAll(data){
  var keys = Object.keys(data);
  for (var i = 0, l = keys.length; i < l; i++) {
    observeProperty(data, keys[i], data[keys[i]]);
  }
}

function observeProperty(data,key,val){
  if (String(key).substr(0, 1) != '$' && !isFunction(val)) {
    defineReactive(data, key, val);
  }
}

function Watchtarget(value,key){
  this.ob = value.__ob__;
  this.key = key;
  this.get = function(){
    var val = value[key];
    if (isPlainObject(val) || isArray(val)) {
      val = val.$value || val;
    }
    return val;
  };
  this.set = function(val){
    value[key]=val;
  };
}
 
function Subqueue(){
  var dirty = [];
  this.add = function(sub){
    if (dirty.indexOf(sub)<0){
      dirty.push(sub);
    }
  };
  this.fire = function(){
    clearTimeout(this.timeout);
    this.timeout = setTimeout(function () {
      while (dirty.length) {
        var item = dirty.shift();
        item.update();
      }
    }, 0);
  };
}

function Subutil(){
  var maps = {};
  this.create = function(data,target,watch){
    var id = watch.id;
    if (!maps[id]){
      maps[id] = new Subscriber(data,target,watch);
    }else{
      maps[id].updateSetting(data,target,watch);
    }
    return maps[id];
  };

  this.add = function(submap,sub){
    var subs = submap[sub.key];
    if (!subs)
      subs = submap[sub.key]=[];
    
    for(var i=0;i<subs.length;i++){
      if (subs[i].id == sub.id){
        return;
      }
    }
    subs.push(sub);
  };

  this.remove = function(submap,id){
    for(var key in submap){
      if (!hasOwn(submap,key))
        return;
      
      var subs = submap[key]||[];
      for(var i=0;i<subs.length;i++){
        if (subs[i].id == id){
          subs.splice(i,1);
          delete maps[id];
          return;
        }
      }
    }
  };
 
  function Subscriber(d, t, w){
    var data = d,target=t,watch=w;
    this.id = watch.id;
    this.key = target.key;
    this.deep = watch.options.deep;
    this.value = target.get();
    this.updateSetting = function(d, t, w){
      data = d,target=t,watch=w;
      subqueue.add(this);
    };
    this.update = function(){
      var value = target.get();
      var origin = this.value;
      if (origin !== value){
        this.value = value;
        watch.callback.call(data, value, origin);
      }
    };
  }
}

function AugmentArray(){
  var arrayProto = Array.prototype;
  var arrayMethods = Object.create(arrayProto);
  var arrayKeys = Object.getOwnPropertyNames(arrayMethods);
  var hasProto = '__proto__' in {};

  ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
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
  this.augment = function(arr){
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
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

function queryTarget(data, path){
  var value = data;
  var key, paths = pathToArr(path);
  while (paths.length) {
    if (!(isPlainObject(value)||isArray(value))) {
      break;
    }
    key = paths.shift();
    if (paths.length == 0 && value.__ob__){
      return new Watchtarget(value,key);
    }
    value = value[key];
  }
  return null;
}

function queryKey(scope, data){
  if (!data)
    return null;

  for(var i in scope){
    if (hasOwn(scope,i) && scope[i] === data){
      return i;
    }
  }
  return null;
}

var uid = 1;
var subqueue = new Subqueue();
var subutil = new Subutil();
var augmentArray = new AugmentArray();

export default Observer;