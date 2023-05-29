export default {
	// 取消Vue所有警告日志
	silent: false,
	// 自定义 mergeOptions 函数 使用的 合并策略（strate）
	optionMergeStrategies: Object.create(null),
	// 是否允许浏览器 devtools 插件 检查代码
	devtools: true,
	//https://juejin.cn/post/7088692271079489550
	errorHandler: function (err, vm, info) {
		console.dir({ err, vm, info });
		// handle error
		// `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
		// 只在 2.2.0+ 可用
	},
	warnHandler: function (msg, vm, trace) {
		console.dir(msg, vm, trace);
		// `trace` 是组件的继承关系追踪
	},
	// 让vue忽略指定自定义元素，例如：使用 <icon></icon> 元素，并别Vue创建的全局组件
	ignoredElements: [],
	// 自定义 vue keyup.xxx
	/**
	 * keyup.enter
	 * keyup.tab
	 * keyup.delete
	 * keyup.esc
	 * keyup.space
	 * keyup.up
	 * keyup.down
	 * keyup.left
	 * keyup.right
	 */
	keyCodes: {
		/*f1: 122*/
	}
	// https://segmentfault.com/a/1190000022682776
};
