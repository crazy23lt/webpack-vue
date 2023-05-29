import { callHook } from "./tools/callHook";
import { compiler } from "./compiler/index";
import { mergeOptions } from "./tools/mergeOptions";
import { nextTick } from "./tools/next-tick";
import { observe, proxy } from "./observer/index";
import Watcher from "./observer/watcher";
import { getOuterHTML, isPlainObject, query } from "./tools/utils";
import { createElement } from "./vdom/create-element";
import { patch } from "./vdom/patch";
import { installRenderHelpers } from "./vdom/render-help";
import { defineComputed } from "./observer/defineComputed";
import { createWatcher } from "./observer/createWatcher";
import set from "./observer/set";
import config from "./config";
/**@description vm._init ; vm.$mount ; compiler ; render watcher */
const initMixin = Vue => {
	Vue.prototype._init = function (options) {
		const vm = this;
		//step vm.$options 完成合并之后的 options
		vm.$options = mergeOptions(vm.constructor.options, options, vm);
		initLifecycle(vm);
		initEvents(vm);
		initRender(vm);
		callHook(vm, "beforeCreate");
		initInjections(vm);
		initState(vm);
		initProvide(vm);
		callHook(vm, "created");
		// step 分析 template(有的话) 创建 render Watcher 挂载 页面
		if (vm.$options.el) vm.$mount(vm.$options.el, vm);
	};
	/**@description 初始化vue实例生命周期相关的属性，组件关系属性的初始化，定义了比如：$root、$parent、$children、$refs */
	function initLifecycle() {}
	/**@description 初始化自定义组件事件的监听,若存在父监听事件,则添加到该实例上 */
	function initEvents() {}
	/**@description 在 vm 上添加创建的虚拟节点的函数*/
	function initRender(vm) {
		//step createElement 返回虚拟节点 Vnode，用于 __patch__ 生成真实 DOM
		vm._c = (tagname, attrs, children) =>
			createElement(vm, tagname, attrs, children);
		vm.$createElement = (tagname, attrs, children) =>
			createElement(vm, tagname, attrs, children);
	}
	/**@description 隔代传参时 先inject。作为一个组件，在要给后辈组件提供数据之前，需要先把祖辈传下来的数据注入进来 */
	function initInjections() {}
	/**@description 初始化 vm上的属性 */
	function initState(vm) {
		const opts = vm.$options;
		if (opts.data) initData(vm);
		if (opts.computed) initComputed(vm, opts.computed);
		if (opts.watch) initWatch(vm, opts.watch);
		/**@description 初始化 vm.$options.data。1.代理 data 到 vm 上。2.劫持 data*/
		function initData(vm) {
			let data = vm.$options.data;
			data = vm._data = typeof data === "function" ? data(vm, vm) : data || {};
			for (const key in data) {
				//step 将_data上的属性代理到vm上，直接访问
				proxy(vm, `_data`, key);
			}
			//step 劫持data ===> 劫持vm._data
			observe(data, true);
		}
		/**
		 * @description 初始化 vm.$options.computed*
		 * @example
		 * `computed:{ fullname(){....} }`
		 * `computed:{ fullname:{ get(){....} } }`
		 * */
		function initComputed(vm, computed) {
			for (const key in computed) {
				// 劫持 computed 属性 到 vm 上（render.call(vm,vm) 时调用属性）
				defineComputed(vm, key, computed[key]);
			}
		}
		/**
		 * @description 初始化 watch
		 * @param {object} vm Vue实例对象
		 * @param {object} watch watch 属性格式
		 * @example watch:{ target:function(){} } 函数声明
		 * @example watch:{ target:"xxxxx" } 字符串声明
		 * @example watch:{ "target.xxx":{ handle:function(){} } } 对象声明
		 * @example watch:{ "target.xxx":[xxx] } 数组声明
		 * @example watch:{ "target.xxx":{ handler:()=>{},deep:true } } 用于监听对象
		 */
		function initWatch(vm, watch) {
			for (const key in watch) {
				// 获取 watch 对象的 key 和 value
				const handler = watch[key];
				//todo 需要处理 watch 是 数组格式的情况，循环创建监听
				createWatcher(vm, key, handler);
			}
		}
	}
	/**@description 在把祖辈传下来的数据注入进来以后 再provide */
	function initProvide() {}
	/**@description template ===> render ===> updateComponent ===> render Watcher */
	/*
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
' main                                                           '
'                                                                '
' +--------+     +-----------------+          +----------------+ '
' | $mount | --> |   get render    | -------> | render Watcher | '
' +--------+     +-----------------+          +----------------+ '
'                                                                '
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
                                                |
                                                |
                                                v
                 +-----------------+          +----------------+            +---------------+
                 | tempalte render | <------- |   run render   |   -------> | custom render |
                 +-----------------+          +----------------+            +---------------+
                   |                            :                             |
                   |                            :                             |
                   |                            v                             |
                   |                 vnode    +----------------+    vnode     |
                   +------------------------> |  patch vnode   |   <----------+
                                              +----------------+
	*/
	Vue.prototype.$mount = function (el, vm = this) {
		//step 拿到 tempalte 解析出 renden
		el = el && query(el);
		const options = this.$options;
		if (!options.render) {
			let template = options.template;
			if (template) {
				if (template.charAt(0) === "#") {
					template = query(template).innerHTML;
				}
			} else if (el) {
				template = getOuterHTML(el);
			}
			if (template) {
				const { render, staticRenderFns } = compiler(template);
				options.render = render;
				options.staticRenderFns = staticRenderFns;
			}
		}
		//step 绑定watcher 与 render
		vm.$el = el;
		callHook(vm, "beforeMount");
		const updateComponent = () => vm._update(vm._render());
		new Watcher(vm, updateComponent, () => {}, {
			before() {
				callHook(vm, "beforeUpdate");
			}
		});
		callHook(vm, "mounted");
	};
};
/**@description vm.$watch ; vm.$set */
const stateMixin = Vue => {
	/**
	 * @description Vue.prototype.$watch 原型方法 用于监听vm上的一个属性
	 * @param {string} expOrFn vm 上属性
	 * @param {function} cb $watch 回调函数
	 * @param {?object} options 描述如何监听
	 * @returns {Function} 返回函数解除函数监听
	 */
	Vue.prototype.$watch = function (expOrFn, cb, options) {
		const vm = this;
		options = options || {};
		// 用于创建一个 user Watcher
		options.user = true;
		const watcher = new Watcher(vm, expOrFn, cb, options);
		return function unwatchFn() {
			watcher.teardown();
		};
	};
	Vue.prototype.$set = set;
};
/**@description vm._update ; vm._patch_ */
const lifecycleMixin = Vue => {
	//step 更新逻辑
	Vue.prototype._update = function (vnode) {
		const vm = this;
		// const prevEl = vm.$el;
		const prevVnode = vm._vnode;
		vm._vnode = vnode;
		if (!prevVnode) {
			//step 首次渲染
			vm.$el = vm.__patch__(vm.$el, vnode);
		} else {
			//step 数据更新渲染
			vm.$el = vm.__patch__(prevVnode, vnode);
		}
	};
	//step 如何更新（diff算法）
	Vue.prototype.__patch__ = patch;
};
/**@description vm._render ; vm.$nextTick ; 等等（RenderHelpers） */
const renderMixin = Vue => {
	//step 定义渲染函数 vm._c、vm._s
	installRenderHelpers(Vue.prototype);
	Vue.prototype._render = function () {
		const vm = this;
		const { render } = vm.$options;
		let vnode = render.call(vm, vm.$createElement);
		return vnode;
	};
	Vue.prototype.$nextTick = function (fn) {
		return nextTick(fn, this);
	};
};
/**@description Vue.nextTick ; Vue.options ; 等等 */
const initGlobalAPI = Vue => {
	const configDef = {};
	configDef.get = () => config;
	configDef.set = () => {
		console.error(
			"[Vue warn]: Do not replace the Vue.config object, set individual fields instead."
		);
	};
	Object.defineProperty(Vue, "config", configDef); // Vue.config 属性
	Vue.util = {};
	Vue.nextTick = nextTick;
	Vue.observable = obj => {
		observe(obj);
		return obj;
	};
	Vue.options = Object.create(null);
	["component", "directive", "filter"].forEach(
		type => (Vue.options[type + "s"] = Object.create(null))
	);
	Vue.options._base = Vue;
	Vue.use = function () {};
	Vue.mixin = function (mixin) {
		this.options = mergeOptions(this.options, mixin);
		return this;
	};
	Vue.extend = function (extendOptions) {
		extendOptions = extendOptions || {};
		const Super = this; // this => Vue
		const Sub = function VueComponent(options) {
			this._init(options);
		};
		Sub.prototype = Object.create(Super.prototype);
		Sub.prototype.constructor = Sub;
		Sub.options = mergeOptions(Super.options, extendOptions);
		Sub["super"] = Super;
		return Sub;
	};
	Vue.component = function (id, definition) {
		if (isPlainObject(definition)) {
			definition.name = definition.name || id;
			definition = this.extend(definition);
		}
		this.options["components"][id] = definition;
		return definition;
	};
};
/**
 * @description Vue 构造函数
 * @param {object} options
 * @param {string | DOMElement} options.el id属性或class属性字符串 或 真实DOM节点 （渲染位置）
 * @param {?string} options.template			id属性或class属性字符串 或 DOM 字符串  （渲染模板）
 * @param {?Function} options.render 		render函数 跳过 vue 抽象语法解析步骤	 （渲染函数）
 * @param {?Function} options.data			Vue 响应式数据
 * @param {?Function} options.params			Vue 响应式数据
 * @param {?Function} options.beforeCreate beforeCreate 生命周期钩子函数，在开始初始化options之前
 * @param {?Function} options.created
 * @param {?Function} options.beforeMount
 * @param {?Function} options.mounted
 * @param {?Function} options.beforeUpdate
 * @param {?Function} options.updated
 * @param {?Function} options.beforeDestroy
 * @param {?Function} options.destroyed
 * @example computed {
 * 		fullName:{
 * 			get:function(){
 * 				return this.firstName + " " + this.lastName;
 * 			},
 * 			set:function(newVal){
 * 				let names = newVal.split(" ");
 * 				this.firstName = names[0];
 * 				this.lastName = names[names.length - 1];
 * 			}
 * 		},
 * 		fullName(){
 * 			return this.firstName + " " + this.lastName;
 * 		}
 * }
 */
function Vue(options) {
	//初始化options参数
	this._init(options);
}
/*
															+----------------------+     +----------------------+     +-------------------------+     +-------------------------+
															| Vue.prototype._init  |     |  Vue.prototype.$set  |     |  Vue.prototype._update  |     |  Vue.prototype._render  |
															+----------------------+     +----------------------+     +-------------------------+     +-------------------------+
																^                            ^                            ^                               ^
																|                            |                            |                               |
																|                            |                            |                               |
								 +- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
								 ' main                                                                                                                                             '
								 '                                                                                                                                                  '
+----------+     ' +----------------------+     +----------------------+     +-------------------------+     +-------------------------+     +--------------------+ '     +------------+
| init Vue | --> ' |    initMixin(Vue)    | --> |   stateMixin(Vue)    | --> |   lifecycleMixin(Vue)   | --> |    renderMixin(Vue)     | --> | initGlobalAPI(Vue) | ' --> | export Vue |
+----------+     ' +----------------------+     +----------------------+     +-------------------------+     +-------------------------+     +--------------------+ '     +------------+
								 '                                                                                                                                                  '
								 +- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
																|                            |                            |                               |
																|                            |                            |                               |
																v                            v                            v                               v
															+----------------------+     +----------------------+     +-------------------------+     +-------------------------+
															| Vue.prototype.$mount |     | Vue.prototype.$watch |     | Vue.prototype.__patch__ |     | Vue.prototype.$nextTick |
															+----------------------+     +----------------------+     +-------------------------+     +-------------------------+
*/
initMixin(Vue);
stateMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);
initGlobalAPI(Vue);
export default Vue;
