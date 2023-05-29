/**
 *
 * @param {vm} vm vue实例对象
 * @param {string} expOrFn watch 属性-键
 * @param {Function|object|string|Array<string|Function|object>} handler watch 属性值 (数组、对象、字符串、函数)
 */
export const createWatcher = function (vm, expOrFn, handler, options) {
	//todo 对象声明 watch:{"target.xxx":{ handle:function(){} }}
	if (typeof handler === "object") {
		options = handler;
		handler = handler.handler;
	}
	//todo 字符串声明 watch:{"target.xxx":"xxxx"}
	if (typeof handler === "string") handler = vm[handler]; // optionos.methods
	//vm.$watch 定义在 stateMixin 内部
	return vm.$watch(expOrFn, handler, options);
};
/**
 * @description 根据路径查找对象内的值
 * @param {string} path 对象内属性键
 * @returns {function} 返回函数参数是对象
 * @example
 * const fn = parsePath("a.b");
 * fn({a:{b:"target"}}) ===> "target"
 */
export const parsePath = path => {
	// 当 wtach:{"target.a.b"} 解析出数组
	const segments = path.split(".");
	return function (obj) {
		//obj ==> vm 一层层迭代查找 vm 上的属性，触发data内的数据劫持 dep.notify
		for (let i = 0; i < segments.length; i++) {
			if (!obj) return;
			obj = obj[segments[i]];
		}
		// 返回 vm 上 watch key 所填写的值
		return obj;
	};
};

const seenObjects = new Set();
// watch 监听的属性 当前的值
export const traverse = val => {
	_traverse(val, seenObjects);
	seenObjects.clear();
};
function _traverse(val, seen) {
	let i, keys;
	const isA = Array.isArray(val);
	// val 如果不是数组或对象，则不会进行deep监听
	if (!(typeof val === "object" && val !== null) && !isA) return;
	if (val.__ob__) {
		const depId = val.__ob__.dep.id;
		if (seen.has(depId)) {
			return;
		}
		seen.add(depId);
	}
	if (isA) {
		i = val.length;
		while (i--) _traverse(val[i], seen);
	} else {
		keys = Object.keys(val);
		i = keys.length;
		while (i--) _traverse(val[keys[i]], seen);
	}
}
