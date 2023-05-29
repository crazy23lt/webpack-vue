/**
 * @description 获取元素真实DOM节点，如果没有找到DOM节点就创建一个空div
 * @param {string|Element} el 属性选择器 或者 真实DOM节点
 * @returns 真实DOM节点
 */
export const query = el => {
	if (typeof el === "string") {
		const selected = document.querySelector(el);
		if (!selected) {
			return document.createElement("div");
		}
		return selected;
	} else {
		return el;
	}
};
/**
 * @description 返回DOM节点的 outerHTML
 * @param {ELement} el
 * @returns
 */
export const getOuterHTML = el => {
	return el.outerHTML;
};
export const unicodeRegExp =
	/a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
const hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwn(obj, key) {
	return hasOwnProperty.call(obj, key);
}
export function def(obj, key, val) {
	Object.defineProperty(obj, key, {
		value: val,
		writable: true,
		configurable: true
	});
}
export function isPlainObject(target) {
	return Object.prototype.toString.call(target) === "[object Object]";
}
