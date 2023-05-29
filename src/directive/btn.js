import Vue from "vue";
const has = Vue.directive("has", {
	/**
	 * @description 只调用一次，指令第一次绑定到元素时调用
	 * @param {DOM} el document 文档对象
	 * @param {Object} binding	属性对象
	 * 	@param {string} binding.name 指令名
	 * @param {vnode} vnode vue 编译的虚拟dom
	 * @param {oldvnode} oldVnode 旧虚拟dom
	 */
	bind: function (el, binding) {
		let premission = ["b", "a"];
		if (!premission.includes(binding.value)) {
			Vue.nextTick(() => {
				el.parentNode.removeChild(el);
			});
		}
	},
	// 被绑定元素插入父节点时调用
	inserted: function () {},
	// 被绑定元素所在模板更新时调用
	update: function () {},
	// 被绑定元素所在模板完成一次周期性更新时调用
	componentUpdated: function () {},
	// 指令与元素解绑时调用
	unbind: function () {}
});

export { has };
