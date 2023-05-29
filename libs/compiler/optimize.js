export const optimize = function (root) {
	//step 标记静态节点
	markStatic(root);
	//step 标记静态根
	markStaticRoots(root, false);
};
function markStatic(node) {
	node.static = isStatic(node);
	//step type:1 普通节点 遍历 children 属性
	if (node.type === 1) {
		for (let i = 0, l = node.children.length; i < l; i++) {
			const child = node.children[i];
			//step 递归children
			markStatic(child);
			//step 后代child非静态标签，则父节点也是非静态标签
			if (!child.static) node.static = false;
		}
	}
}
function markStaticRoots(node) {
	if (node.type === 1) {
		if (
			node.static &&
			node.children.length &&
			!(node.children.length === 1 && node.children[0].type === 3)
		) {
			node.staticRoot = true;
			return;
		} else {
			node.staticRoot = false;
		}
		if (node.children) {
			for (let i = 0, l = node.children.length; i < l; i++) {
				markStaticRoots(node.children[i]);
			}
		}
	}
}
//step vue表达式：非静态节点
//step 普通文本：静态节点
//step 使用v-pre指令的节点：静态节点
function isStatic(node) {
	if (node.type === 2) return false;
	if (node.type === 3) return true;
	return true;
}
