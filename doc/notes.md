# 随记-乱七八糟

## Html作用 <userTag />
1. 占位 布局
2. 直接展示结构（dom）
3. 属性定义
4. 事件及交互定义需要跟js实例关联

## JSON
1. 描述数据更方便
2. 在定义结构及位置时不方便

## 控件
1. 定义位置
2. 定义结构
3. 定义事件及交互

## 控件对应实例
1. DOM对象实例
2. JS对象实例

## 设计
- 动作 action //tag validate cascade toggle valiate-tip-email
- 处理 handle //策略 覆写 装饰 切面 (action+n handle) sidebar tab email min[0] max
- 过滤 filter //date(1234444)|datetime

- 策略 strategy   tar = new Strategy(src);  extend(src,tar);  //validate render
- 装饰 decorator  tar = new Decorator(src); extend(src,tar);  //render 
- 切面 aspect     tar = new Aspect();       extend(src,tar);  //this.beforeRender; 

- 渲染
- 数据
- 行为
- 状态   

 
## 内部公用
- 内部工具 Util            
- 访问数据 Webapi        

## 原则上 不全部组件化，在原页面上改造，部分组件化

## 数据输入
后台
data
{
  data:{}, 表单数据
  data2:{}, 静态数据（title desc...)
  datasource:{}, 不变的数据源
  options:{}，
  validate:{}
}

## 组件接入
created
attached
detached
attributeChanged

**表单描述**
动态表单
结构、ui、验证、逻辑

**验证框架**
校验逻辑
校验依赖
校验时间
校验绑定
提示消息
UI展示

## 嵌套处理 slot
```
  <layout>
    <sidebar slot='west'></sidebar>
    <searchbar slot='north'></searchbar>
    <gridtable slot='east'></gridtable>
    <footer slot='south'></footer>
  </layout>
```

## 页面代码风格
```javascript
var page = new SearchPage();
page.query = {a:'',b:'',c:''};
page.searchClick = function(){};
```

## 组件打通
能使用中台DPL提供的react组件
能使用现有系统已深淀的组件
任何现有组件化平台只要对一种标准进行对接
抹平内部组件实现差异，可对外输出标准的react组件

接近custom element减少学习成本 
提供一致性、稳定的写法

## action是否需要再细分

action => engine + context + scope

new Action(context);

var context = {
  browser:browser,
  rootElement:root,
  rootData:data,
  element:root,
  scope:data
};
 
## context对象应该包括哪些属性 
root
data
state
element
//actions

scope 需要外部拓展 scopereader
slot  嵌套能力 sloter nest //父元素渲染parent.render -> 子元素附加parent.slot[i].append(child[i]) -> 子元素渲染child.render

## slot逻辑
```javascript
function Layout(){
  this.action = function(){
    var element = this.context.element;
    element.innerHTML = this.render();
    var slots = element.findChildElement('slot');
    for(var slot of slots){
      adjustSlot();
      run(slot);
    }
  }
  this.render = function(){
    return '<div><slot name="north" /><slot name="south" /><div>';
  };
}
```

## bind.0 bind.1 bind.2
```javascript
//bind.0 => 单次  data=>html
//bind.1 => 单向  data=>html
//bind.2 => 双向  data=>html
function Tab(){
  //bind.0
  this.render = function(){};
  this.binder = function(){
    //bind.1
    this.watch('a.b',function(newValue,oldValue){
      this.update();
      //this.render();
    });
    //bind.2
    this.listen('ul li.active input',function(newValue,oldValue){
      this.data.a.b = newValue;
    });
    //other
    this.on('click',functon(){

    });
  };
}
```

## 能力组合定制
requrie([
  'template',
  'observer',
  'monitor',
  'pointer',


  'scope', //scope (ob + pi)
  'slot',
  'tag'
]);
 
exports = action;

## 依赖关系
tag - scope/obscope - reader
 
## action之间的关系
```javascript
<div action="act1,act2,act3"></div>
act1.run() => act2.run() => act3.run();

<div action="act1" act="handle1,handle2"></div>
extend(act1,handle1,handle2).run();

<div action="act3"></div>
function act3(context){  //act3 dep:act1,act2
  new Act1(context).action();
  new Act2(context).action();

  this.preaction=['act1','act2'];

}
app.action('act3',act3,{
  pre:[act1,act2],
  suf:[act3,act4]
});
```

## 前置后置行为
app.action(id,act,{
  pre:[id1,id2],
  suf:[id3,id4]
});

## scope对函数处理
```javascript
for(var k in scope){
  if (!scope.hasOwnProperty(k)) {
    continue;
  }
  if (typeof scope[k] === 'function'){
    data[k]= new scope[k]();
  }else{
    data[k]=scope[k];
  }
}
```

# data attr reader
```javascript
function dataPointer(context){
  var attrs = context.element.attributes;
  var dataHtml = {}, dataJs = {};
  for(var i=0;i<attrs.length;i++){
    var name = attrs[i].name;
    if (name.substr(0,5)=='data.'){
      dataHtml[name]=attr[i].value;
    }else if (name == 'data'){
      dataJs = context.scope[attrs[i].value]||{};
    }
  }
  var pointer = extend(dataHtml,dataJs); //$.extend({},com,html-data-xxx,js);
  return pointer;
};
```
## 属性处理
action => execute action
scope  => context.scope
slot   => after render => parent.find(slot=xxx).append(slot);
stage  => stage('render');
data   => data

data =>

scope="edit" => 作用域改变


 
# 读取属性 data.value(指向，关系) data-value（值）
data.value 数据映射关系
data-value 数据值定义

1、读取data.value => mapping
2、读取data-value => tagdata
3、mix(mapping,tagdata)

//scope
var srcdata = {
  a:'valuea',
  b:'valueb',
  c:'valuec'
}

//mapping
var mapping = {
  a:'x.y',
  b:'x.z',
  c:'w'
}

//tagdata
var tagdata = {
  c:'valuec',
  d:'valued'
}

var data = {
  a:'x.y',   //'valuea'
  b:'x.z',   //'valueb'
  c:'w',     //'valuec'
  d:'valued'
}

src.a <=> tar.a
var pointer = new Pointer(src,tar);
var tar = pointer.mapping(mapdata); //get set 

//在tag内部 tagdata
this.data.a = 'valuea1'

//在应用实例中 srcdata
this.grid.a = 'valuea2'

rootdata = > mod(edit) => pointer => data
extend(com,attr,js)

data.options = "grid" //指向data.grid中
data.value   = "abc"  //指向abc
data-value   = "123"  //值为123

控件中
this.data = {
  options:{},
  value:{},
}

context={
  root:root,
  data:cache.data,
  element:root,
  browser:browser
};

function sidebar(context){
  this.context = context; 
  this.cotext.root = {};
  this.context.data = {};
  this.context.data = {};

  this.render = function(){
    this.data.options;
    this.data.value;
    this.data.list;

  };

}

```html
<div mod='edit' slot='name1'> //stage
  <div tag="grid"    data.options="{grid.options}" data.value="{grid.value}" data.list="grid" data="grid"> </div>  //edit.grid
  <div tag="select2,validate,xxx,dgexxx" validate="test,test2" data.list="ds.sex" data.value="form.selectValue" scope="grid"></div>    //$ => root
  <div tag="tree"    data="test" data.organize="{$parent.id}"></div>    //! => parent
</div>

<div mod="search">
  <div action="tag-grid-test" data="searchbar"></div>  //edit.grid
  <button event="click" data.click="search"></button>
</div>
```
action.js
action.config.js

//不需要写action="tag" 会自动探测tag=""
app.detect('tag','scope','validate','event');

# 关于作用域
```javascript
var api = new Api(url);
api.query();

function sidebar(){
  this.beforeInit = function(){
    this.watch('list',function(){
      this.render();
    });
  };
};

function test(){
  this.config = {};
  this.source = {sex:['male','female'],types:[]};
  this.form = {key1:'value1',key2:'value2'};
  this.list = [];

  this.searchClick = function(){
    api.query(this.form).done(function(d){
      this.list = d.content;
    });
  };

  this.clearClick = function(){
    this.form={};
  };

  this.init = function(){
    app.get('id').watch();
  };
}


function Page(ob){
  SearchPage.apply(this,arguments);
  var ob = new Observer(this);
  this.ds = {sex:['male','female'],xxx:[]};
  //this.data = {};
  this.form = {a:'value1',b:'value2'};

  ob.watch('form',function(){
    this.searchClick();
  });

  this.grid = {
    size:{w:125,h:100},
    url:'{form.url}',
    columns:[],
    data:'{ds.sex}'
  };
  this.test = {
    value:'*{grid.size.w}'
  };
  this.combobox ={
    selectedValue:'{data.selectId}',
    change:function(){
      _this.form.name = 123;
    }
  };
  this.searchClick = function(){
    var deferd = api.query(_this.form);
    deferd.done(_this.loadData);
  };
  this.loadData = function(data){
    console.log(data);
  };
}

var page = new Page();


app.scope('edit',Page);
app.scope('page',page);

app.scope('edit',Page);
app.run();
 
var vm = app.data.edit;


app.action('page-select-handle',function(){
  this.binder = function(){

  };
});
```
`cache.data` 根数据 context.data
context.scope = exnted({},com,attrs,data.path);



# observer new

var data = {
  a:'test',
  b:{x:{y:123}},
  c:[1,2,3,4,5]
};

new Observer(data);

var data2 = {
  e:123,
  f:'test2',
  g:{x:{y:123}}, //data.b
}


## todo

avalon
8.8*100 
nginx


Object.observe 
Object.proxy
Object.defineProperty
Object.__defineGetter__
vb
setInterval

vue收集依赖


 