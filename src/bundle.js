import ie from './polifill.js'
import app from './engine.js'
import Template from './template.js'
import {PluginContext, PluginScope, PluginObserver, PluginData, PluginStage, PluginAction} from './plugins'
import {Tag, Event} from './actions.js'
 
//引擎插件
app.plugin(PluginContext);
app.plugin(PluginScope);
app.plugin(PluginObserver);
app.plugin(PluginData);
app.plugin(PluginStage);
app.plugin(PluginAction);

//模板过滤器
app.filter = Template.filter;

//行为动作
app.action('tag', Tag);
app.action('event', Event);

export default app;