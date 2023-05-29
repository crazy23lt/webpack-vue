const ref = () => {};
const directives = () => {};
const attrs = {
	create: (oldVnode, vnode) => {
		if (!oldVnode.data.attrs && !vnode.data.attrs) return;
		const elm = vnode.elm;
		const oldAttrs = oldVnode.data.attrs || {};
		const attrs = vnode.data.attrs || {};
		for (let key in attrs) {
			let cur = attrs[key];
			let old = oldAttrs[key];
			if (old !== cur) {
				elm.setAttribute(key, cur);
			}
		}
	},
	update: () => {}
};
const klass = () => {};
const events = () => {};
const domProps = () => {};
const style = () => {};
const transition = () => {};
export default [
	ref,
	directives,
	attrs,
	klass,
	events,
	domProps,
	style,
	transition
];
