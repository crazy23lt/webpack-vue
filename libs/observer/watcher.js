import { callHook } from "../tools/callHook.js";
import { nextTick } from "../tools/next-tick.js";
import { parsePath, traverse } from "./createWatcher.js";
import { pushWatcher, popWatcher } from "./dep";
const queue = [];
let uid = 0;
let has = {};
let waiting = false;

export default class Watcher {
	/**
	 * @description 创建一个 Watcher 对象
	 * @param {Vue} vm Vue实例对象
	 * @param {function|string} expOrFn render watcher 是一个 渲染函数；user watcher 是一个字符串
	 * @param {?function} cb user watcher 需要传递此参数
	 * @param {?object} options 描述创建何种watcher
	 * @param {?boolean} options.lazy 创建一个 lazy watcher 用于 computed 计算属性
	 * @param {?boolean} options.deep 创建一个 deep user watcher 用于 watch 深度监听属性
	 * @param {?boolean} options.user 创建一个 user watcher 用于 watch 监听属性
	 * @param {?function} options.before 更新 render watcher 时会调用
	 */
	constructor(vm, expOrFn, cb, options) {
		this.vm = vm;
		this.cb = cb;
		this.id = ++uid;
		if (options) {
			this.lazy = !!options.lazy;
			this.deep = !!options.deep;
			this.user = !!options.user;
			this.before = options.before;
		} else {
			this.deep = this.user = this.lazy = false;
		}
		this.deps = [];
		this.dirty = this.lazy;
		//options.watch 传输进来的 expOrFn 是一个字符串
		if (typeof expOrFn === "function") this.getter = expOrFn;
		else this.getter = parsePath(expOrFn);
		// lazy watcher 实例化不会执行 getter
		this.value = this.lazy ? undefined : this.get();
	}
	get() {
		pushWatcher(this);
		const vm = this.vm;
		// 当是 computed watcher 时，Dep.target = computed watcher，计算属性使用 data 内的属性，data 的 Dep.watchers 会记录 当前的 computed watcher
		// watch Watcher 时，通过parsePath(expOrFn)触发监听data的劫持从而，让 data dep 订阅 这个 watch watcher
		let value = this.getter.call(vm, vm);
		if (this.deep) traverse(value);
		popWatcher();
		return value;
	}
	//data getter 触发 dep.depend 触发 watcher.addDep
	addDep(dep) {
		this.deps.push(dep); // 记录 data 属性创建的 dep
		dep.addWatcher(this);
	}
	//dep.notify 通知 所订阅的 watcher 进行 update 操作，render watcher、computed watcher（lazy watcher）、watch watcher（user watcher）
	update() {
		if (this.lazy) {
			this.dirty = true;
		} else {
			queueWatcher(this); // this.run()
		}
	}
	run() {
		const value = this.get();
		if (value !== this.value) {
			const oldValue = this.value;
			this.value = value;
			if (this.user) {
				this.cb.call(this.vm, value, oldValue);
			}
		}
	}
	evaluate() {
		this.value = this.get();
		// dirty=false 下次触发 computed属性的 getter 会使用本次执行 get() 多的 value
		this.dirty = false;
	}
	depend() {
		let i = this.deps.length;
		while (i--) {
			this.deps[i].depend();
		}
	}
}

function queueWatcher(watcher) {
	const id = watcher.id;
	if (has[id] == null) {
		has[id] = true;
		queue.push(watcher);
		if (!waiting) {
			waiting = true;
			nextTick(() => {
				queue.forEach(w => {
					if (w.before) w.before();
					w.run();
					callHook(w.vm, "updated");
				});
				waiting = false;
			});
		}
	}
}
