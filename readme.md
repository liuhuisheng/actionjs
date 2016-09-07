## 功能设计
 
`引擎功能`：
- 插件机制 plugin (context scope data stage)
- 行为动作 action (Tag Validate Toggle Cascade | sidebar tab grid tip email min[0])
- 功能配置 config
- 作用域   scope

`核心部件`
- 模板引擎 Template        var tp = new Tempalte(tpl)    tp.render(data)
- 数据监听 Observer        var ob = new Observer(data)   ob.watch(path,subscriber,options);
- 页面监听 Monitor         var mo = new Monitor(root)    mo.listen(selector,hanlder,options);

`使用示例`
```html
<div scope="search">
  <div action.tag       = "select" 
       action.validate  = "valid1,email.tip1,min[0]"
       action.toggle    = "modal"
       data.value       = "form.key1"
       data.list        = "datasource.sex"
       data.modal       = "elementid"></div>

  <button action        = "event"
          data.click    = "testClick"
          data.dblclick = "testClick2"></button>
</div>
```

```javascript
function Select(){
  this.template = function(){
    return '<select>{{each list as o}}<option {{if o==value}}selected{{/if}} value="{{o}}">{{o}}</option>{{/each}}</select>';
  };
  this.init = function(){
    var _this = this;
    this.watch('list,value',function(){
      _this.render();
    });
    this.listen('select',function(){
      console.log(arguments);
    });
  };
}

function Valid1(){
  this.message = 'error msg';
  this.validate = function(){
    var valid = true; 
    return valid;
  }
}

function Modal(){
  this.handle = function(){
    var target = this.data.modal;
    target.modal();
  };
}

function Page(){
  this.datasource={sex:['male','female']},
  this.form = {
    key1:'value1',
    key2:'value2',
    key3:'female'
  };
  this.other1 = 'page1value';
  this.other2 = ['a','b','c'];

  this.testClick = function(){
    console.log('abc');
  };

  var _this = this;
  this.testClick2 = function(){
    _this.form.key3="male";
  };
}

app.scope('search',Page);
app.action('select.tag',Select);
app.action('valid1.validate',Valid1);
app.action('modal.toggle',Modal);

app.run();
```