import VNode from "./vnode";
/**
 * @description 渲染元素
 * @param {Vue} context					Vue 实例
 * @param {string} tag			渲染元素的标签名
 * @param {object} data			渲染元素标签上的属性
 * @param {array} children	渲染元素的子元素
 * + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
 * ' main(主流程)                                                                        '
 * '                                                                                    '
 * ' +-----------------------+       +-----------------+       +----------------------+ '
 * ' | $createElement(input) | ----> |                 | ----> |     Vnode(output)    | '
 * ' +-----------------------+       |                 |       +----------------------+ '
 * '                                 | handle Children |                                '
 * + - - - - - - - - - - - - - - -   |                 |   - - - - - - - - - - - - - - -+
 *                                 ' |                 | '
 *     +-------------------------- ' |                 | ' ------+
 *     |                           ' +-----------------+ '       |
 *     |                           '                     '       |
 *     |                           + - - - - - - - - - - +       |
 *     |                                             ^           |
 *     | isString OR isNumber                        |           | isArray
 *     v                                             |           v
 *   +-----------------------+                       |         +----------------------+
 *   |       textVnode       |                       +-------- | handle ArrayChildren |
 *   +-----------------------+                                 +----------------------+
 *
 *
 */
export const createElement = (context, tag, data, children) => {
	if (Array.isArray(data) || isPrimitive(data)) {
		children = data;
		data = undefined;
	}
	// step.1 children 是 字符串或数字 返回文本节点
	// step.2 children 是 数组 将数组内进行遍历转换成vnode
	children = isPrimitive(children)
		? [createTextVNode(children)]
		: Array.isArray(children)
		? normalizeArrayChildren(children)
		: undefined;
	return new VNode(tag, data, children, undefined, undefined, context);
};
function isPrimitive(target) {
	return typeof target === "string" || typeof target === "number";
}

function normalizeArrayChildren(children) {
	let res = [];
	let index, lastIndex, last, item;
	for (index = 0; index < children.length; index++) {
		item = children[index];
		lastIndex = res.length - 1;
		last = res[lastIndex];
		if (Array.isArray(item) && item.length) {
			// item 任然是 数组，且长度不为 0
			item = normalizeArrayChildren(item);
			res.push(item);
		} else if (isPrimitive(item)) {
			// 上一个 item 是 文本节点，则合并两个文本节点
			if (isTextVnode(last)) res[lastIndex] = createTextVNode(last.text + item);
			else if (item !== "") res.push(createTextVNode(item));
		} else {
			if (isTextVnode(last) && isTextVnode(item)) {
				res[lastIndex] = createTextVNode(last.text + item.text);
			} else {
				res.push(item);
			}
		}
	}
	return res;
}
function createTextVNode(val) {
	return new VNode(undefined, undefined, undefined, String(val));
}
function isTextVnode(node) {
	return node && node.text;
}
