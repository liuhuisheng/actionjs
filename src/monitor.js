import {isFunction,toArray,addEvent,extend} from './util.js'

function Monitor(root) {
  this.listen = function (selector, listener, options) {
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

  function bindEvent(element, callback){
    if (document.documentMode<9){
      callback = fixCallback(element,callback);
    }
    switch(element.type){
      case 'radio':
      case 'checkbox':
        return addEvent(element,'click',callback,false);
      case 'select':
        return addEvent(element,'change',callback,false);
      default:
        return oninput(element, callback);  
    }
  }
  
  function fixCallback(element,fn){
    var timeout;
    return function(event){
      clearTimeout(timeout);
      timeout = setTimeout(function(){
         fn.call(element,event);
      },0);
    };
  }

  function wrapDelegate(element,selector,fn){
    return function(event){
      var target = event.target;
      var targets = toArray(element.querySelectorAll(selector));
      if (targets.indexOf(target) != -1) {
        return fn.call(target, event);
      }
    };
  }
 
  function oninput(element, callback) {
    addEvent(element,'input',callback,false);
    if (document.documentMode == 9) {  //ie9
      addEvent(element,'change',callback,false);
      var selectionchange = function (event) {
        callback.call(element, event);
      };
      addEvent(element,'focus',function () {
        document.addEventListener('selectionchange', selectionchange, false);
      },false);
      addEvent(element,'blur',function () {
        document.removeEventListener('selectionchange', selectionchange, false);
      },false);
    }else if (document.documentMode < 9){ //ie8
      addEvent(element,'change',callback,false);
      addEvent(element,'propertychange',function(event){
        if (event.propertyName == 'value'){
          callback.call(element,event);
        } 
      },false);
    }
  }
}

export default Monitor
