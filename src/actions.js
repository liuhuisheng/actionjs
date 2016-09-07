import {isFunction, removeEmpty,addEvent} from './util.js'
import Template from './template.js'
import Monitor from './monitor.js'

export function Tag() {
  this.execute = function () {
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

  this.render = function () {
    if (!this.templateRender) {
      var template = isFunction(this.template) ? this.template() : this.template;
      this.templateRender = new Template(template);
    }
    var html = this.templateRender.render(this.data);
    this.element.innerHTML = html;
  };

  this.init = function () {
  };

  this.template = function () {
    return '';
  };

  this.watch = function (path, subscriber, options) {
    var arr = removeEmpty(path.split(','));
    for (var i = 0; i < arr.length; i++) {
      this.data.$watch(path, subscriber, options);
    }
  };

  this.listen = function (selector, listner, options) {
    if (!this.monitor) {
      this.monitor = new Monitor(this.element);
    }
    this.monitor.listen(selector, listner, options);
  };
}

export function Event() {
  this.execute = function () {
    for (var key in this.data) {
      if (this.data.hasOwnProperty(key) && isFunction(this.data[key])) {
        addEvent(this.element,key,this.data[key]);
      }
    }
  };
}




