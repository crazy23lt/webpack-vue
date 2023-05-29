export default class Dep {
	/**
	 * @class Dep 订阅对象构造函数
	 * @property `this.watchers` watchers 栈
	 * @function `depend` watcher.addDep() watcher 关联 Dep
	 * @function `addWatcher` 添加Dep.watcher静态属性上的 watcher
	 * @function `notify`	通知所有 watchers 执行 watcher.update()
	 * @static `watcher` 一个 Watcher
	 */
	constructor() {
		this.watchers = [];
	}
	depend() {
		//step Watcher.addDep(Dep)
		if (Dep.watcher) Dep.watcher.addDep(this);
	}
	addWatcher(watcher) {
		this.watchers.push(watcher);
	}
	notify() {
		const _watchers = this.watchers.slice();
		_watchers.forEach(watcher => watcher.update());
	}
}
/**@description Dep静态属性 watcher，一个 watcher 对象 */
Dep.watcher = null;
//step 维护一个 watcher 栈
//step 每一个 updateComponent 对应一个 watcher
const watcherStack = [];
/**
 * @description 维护一个管理所有种类 watcher 的栈，此函数用于入栈操作
 * @param {Watcher} watcher watcher 实例化对象
 */
export const pushWatcher = watcher => {
	watcherStack.push(watcher);
	//Dep 静态属性 watcher
	Dep.watcher = watcher;
};
/**
 *  @description 维护一个管理所有种类 watcher 的栈，此函数用于出栈操作
 */
export const popWatcher = () => {
	watcherStack.pop();
	Dep.watcher = watcherStack[watcherStack.length - 1];
};
