import VNode from "./vnode";
const hooks = ["create", "activate", "update", "remove", "destroy"];
import attrsFns from "./modles.js";
let i, j;
const cbs = {};
for (i = 0; i < hooks.length; ++i) {
	cbs[hooks[i]] = [];
	for (j = 0; j < attrsFns.length; ++j) {
		if (attrsFns[j][hooks[i]]) {
			cbs[hooks[i]].push(attrsFns[j][hooks[i]]);
		}
	}
}
export const patch = (oldVnode, vnode) => {
	//step.1 判断oldVnode是否是真正的Dom节点
	//step.1.1 oldVnode 是真正的Dom节点，说明是首次渲染，vm.__patch__(vm.$el,vnode);
	//step.1.2 oldVnode 是虚拟节点（vnode）,说明是后续更新渲染，vm.__patch__(vm._vnode,vnode);
	const isRealElement = oldVnode.nodeType;
	if (!isRealElement && sameVnode(oldVnode, vnode)) {
		patchVnode(oldVnode, vnode);
	} else {
		oldVnode = emptyNodeAt(oldVnode);
		const oldElm = oldVnode.elm;
		const parentElm = parentNode(oldElm);
		parentElm.removeChild(oldElm);
		createElm(vnode, parentElm, nextSibling(oldElm));
		return vnode.elm;
	}
};
function createElm(vnode, parentElm, refElm) {
	const children = vnode.children;
	const tag = vnode.tag;
	const data = vnode.data;
	console.dir({ tag, vnode, children });
	if (tag) {
		vnode.elm = createElement(tag);
		createChildren(vnode, children);
		if (data) invokeCreateHooks(vnode);
		insert(parentElm, vnode.elm, refElm);
	} else {
		vnode.elm = createTextNode(vnode.text);
		insert(parentElm, vnode.elm, refElm);
	}
}
function createChildren(vnode, children) {
	if (Array.isArray(children)) {
		for (let i = 0; i < children.length; ++i) {
			createElm(children[i], vnode.elm);
		}
	}
}
function insert(parent, elm, ref) {
	if (parent) {
		if (ref) {
			if (parentNode(ref) === parent) {
				insertBefore(parent, elm, ref);
			}
		} else {
			appendChild(parent, elm);
		}
	}
}
function createElement(tagName) {
	return document.createElement(tagName);
}
function createTextNode(text) {
	return document.createTextNode(text);
}
function parentNode(node) {
	return node.parentNode;
}
function insertBefore(parentNode, newNode, referenceNode) {
	parentNode.insertBefore(newNode, referenceNode);
}
function appendChild(node, child) {
	node.appendChild(child);
}
function emptyNodeAt(elm) {
	// tag:标签名   data:标签属性   children:标签子元素   text：标签文本 elm ：真实标签
	return new VNode(tagName(elm).toLowerCase(), {}, [], undefined, elm);
}
function tagName(node) {
	return node.tagName;
}
function nextSibling(node) {
	return node.nextSibling;
}
const emptyNode = new VNode("", {}, []);
function invokeCreateHooks(vnode) {
	for (let i = 0; i < cbs.create.length; ++i) {
		cbs.create[i](emptyNode, vnode);
	}
}
/**@description 比较两个vnode的key属性和tag属性 */
function sameVnode(a, b) {
	return a.key === b.key && a.tag === b.tag;
}
function patchVnode(oldVnode, vnode) {
	if (oldVnode === vnode) return; // new Vnode 两个实例 不会相等
	const elm = (vnode.elm = oldVnode.elm);
	const oldCh = oldVnode.children;
	const ch = vnode.children;
	/**
	 * step 更新vnode策略
	 * step.1 判断是否是普通文本节点
	 * step.1.1 是普通文本节点，判断和旧vnode的文本是否一致，不一致，则覆盖文本
	 * step.1.2 不是文本节点，判断子vnode
	 */
	if (!vnode.text) {
		if (oldCh && ch && oldCh !== ch) updateChildren(elm, oldCh, ch);
		if (oldCh && !ch) removeVnodes(oldCh, 0, oldCh.length - 1);
		if (!oldCh && ch) addVnodes(oldCh, 0, oldCh.length - 1);
	} else if (oldVnode.text !== vnode.text) {
		setTextContent(elm, vnode.text);
	}
}
function updateChildren() {}
function removeVnodes() {}
function addVnodes() {}
function setTextContent() {}
