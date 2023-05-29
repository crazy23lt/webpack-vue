/**
 * @description 回调钩子执行函数，Vue 生命周期关键
 * @param {Vue} vm Vue实例化对象
 * @param {string} hook Vue 生命周期钩子名称
 */
export const callHook = (vm, hook) => {
	const handlers = vm.$options[hook];
	(handlers || []).forEach(cb => cb.call(vm));
};
