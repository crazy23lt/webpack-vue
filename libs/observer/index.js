import { arrayMethods } from "./arrayMethods.js";
import Dep from "./dep";
class Observer {
	/**
	 * @description 劫持核心逻辑
	 * @param {string} value
	 */
	constructor(value) {
		this.value = value;
		this.dep = new Dep();
		Object.defineProperty(value, "__ob__", {
			enumerable: false,
			configurable: false,
			value: this
		});
		if (Array.isArray(value)) {
			value.__proto__ = arrayMethods;
			this.observeArray(value);
		} else {
			this.walk(value);
		}
	}
	/**
	 * @description 劫持普通对象
	 * @param {object|string} obj
	 */
	walk(obj) {
		const keys = Object.keys(obj);
		keys.forEach(key => defineReactive(obj, key, obj[key]));
	}
	/**
	 * @description 劫持数组内的属性
	 * @param {array} items
	 */
	observeArray(items) {
		items.forEach(item => observe(item));
	}
}
/**
 * @description 劫持对象内的属性
 * @param {object} data 劫持目标
 * @returns {object|null}
 */
export const observe = data => {
	if (data === null || typeof data !== "object") return;
	//step 解决循环引用的问题
	if (data.__ob__) return data;
	return new Observer(data);
};
/**
 * @description 劫持核心逻辑，定义属性Object.defineProperty(...)
 * @param {object} obj
 * @param {string} key
 * @param {any} val
 */
function defineReactive(obj, key, val) {
	const dep = new Dep();
	let childOb = observe(val);
	Object.defineProperty(obj, key, {
		enumerable: true,
		configurable: true,
		get() {
			console.dir(`--------------observe get ${val}`);
			if (Dep.watcher) {
				dep.depend();
				if (childOb) {
					childOb.dep.depend();
					if (Array.isArray(val)) dependArray(val);
				}
			}
			return val;
		},
		set(newVal) {
			console.dir(`--------------observe set ${val}`);
			val = newVal;
			dep.notify();
		}
	});
}
function dependArray(value) {
	for (let e, i = 0, l = value.length; i < l; i++) {
		e = value[i];
		e && e.__ob__ && e.__ob__.dep.depend();
		if (Array.isArray(e)) {
			dependArray(e);
		}
	}
}
/**
 * @description 代理一个值到指定属性上
 * @param {object} target 代理目标
 * @param {string} sourceKey 代理值
 * @param {string} key 通过vm[key] 访问
 */
export const proxy = (target, sourceKey, key) => {
	const description = {
		get() {
			return this[sourceKey][key];
		},
		set(val) {
			this[sourceKey][key] = val;
		}
	};
	Object.defineProperty(target, key, description);
};
