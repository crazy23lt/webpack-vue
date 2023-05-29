import VNode from "./vnode";
//step target Vue 原型对象 Vue.prototype
export const installRenderHelpers = target => {
	target._v = createTextVNode;
	target._s = toString;
	target._m = renderStatic;
	target._l = renderList;
};
export function createTextVNode(val) {
	return new VNode(undefined, undefined, undefined, String(val));
}
function toString(val) {
	return val == null
		? ""
		: Array.isArray(val)
		? JSON.stringify(val, null, 2)
		: String(val);
}
/**@description 渲染静态节点 */
function renderStatic(index) {
	const cached = this._staticTrees || (this._staticTrees = []);
	let tree = cached[index];
	if (tree) return tree;
	tree = cached[index] = new Function(
		this.$options.staticRenderFns[index]
	).call(this, null);
	return tree;
}
function renderList(val, render) {
	let ret, i, l, keys, key;
	if (Array.isArray(val)) {
		ret = new Array(val.length);
		for (i = 0, l = val.length; i < l; i++) {
			ret[i] = render(val[i], i);
		}
	}
	console.dir({ ret });
	return ret;
}
