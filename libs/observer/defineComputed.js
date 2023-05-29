import Dep from "./dep";
import Watcher from "./watcher";
/**@description 访问vm代理的computed属性 */
function computedGetter(vm, key) {
	return function () {
		const watcher = vm._computedWatchers[key];
		if (watcher) {
			if (watcher.dirty) watcher.evaluate();
			// 此时 Dep.watcher 是 render watcher，因为触发 computed 属性只有在 $mount -> new Watcher 下才会执行 updateComponent
			if (Dep.watcher) watcher.depend();
			return watcher.value;
		} else {
			return null;
		}
	};
}
/**@description  为computed内每一个属性创建一个 lazy watcher，并将属性通过 Object.defineProperty 代理到 vm 上。*/
export const defineComputed = (vm, key, target) => {
	/**@description watchers 记录每一个 computed 内属性所对应的 lazy watcher */
	const watchers = (vm._computedWatchers = Object.create(null));
	const getter = typeof target === "function" ? target : target.get;
	watchers[key] = new Watcher(vm, getter || (() => {}), () => {}, {
		lazy: true
	});
	if (!(key in vm)) {
		Object.defineProperty(vm, key, {
			get: computedGetter(vm, key),
			set: typeof userDef === "function" ? () => {} : target.set
		});
	}
};
