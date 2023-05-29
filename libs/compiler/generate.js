/**
 * @description 编译的最后一步 generate(产生、形成) 将 优化过后的 ast 编译成可执行性的代码字符串
 * @param {Object} ast 经过 optimize 优化处理的 ast 抽象语法书
 * @returns {string} codegen
 */
export const generate = function (ast) {
	console.dir(ast);
	const _code = genElement(ast);
	let staticRenderFns = null;
	let code = null;
	if (typeof _code === "object") {
		code = _code.code;
		staticRenderFns = _code.staticRenderFns;
	} else {
		code = _code;
	}
	return {
		staticRenderFns,
		render: `with(this){return ${code}}`
	};
};
/**
 * @description 处理ast抽象节点，分析 attrsList(属性) 和 children(子节点)
 * @param {object} el ast的一个抽象节点
 * @returns {string} 可执行代码字符串
 */
function genElement(el) {
	// el节点是静态根节点，且没有被分析处理
	if (el.staticRoot && !el.staticProcessed) {
		return genStatic(el);
	}
	if (el.for && !el.forProcessed) {
		return genFor(el);
	} else {
		let data = genData(el); // 处理 el.attrsList 属性
		let children = genChildren(el);

		// _c(tag,{attrs:{xxx:xxx}},)
		let code = `_c('${el.tag}'${data ? `,${data}` : ""}${
			children ? `,${children}` : ""
		})`;
		return code;
	}
}
function genStatic(el) {
	const staticRenderFns = [];
	el.staticProcessed = true;
	staticRenderFns.push(`with(this){return ${genElement(el)}}`);
	return {
		staticRenderFns,
		code: `_m(${staticRenderFns.length - 1}${""})`
	};
}
function genFor(el) {
	const exp = el.for;
	const alias = el.alias;
	const iterator1 = el.iterator1 ? `,${el.iterator1}` : "";
	const iterator2 = el.iterator2 ? `,${el.iterator2}` : "";
	el.forProcessed = true; // avoid recursion
	return (
		`_l((${exp}),` +
		`function(${alias}${iterator1}${iterator2}){` +
		`return ${genElement(el)}` +
		"})"
	);
}
function genChildren(el) {
	const children = el.children;
	if (children.length) {
		const el = children[0];
		if (children.length === 1 && el.for) {
			return genElement(el);
		}
		return `[${children.map(c => genNode(c)).join(",")}]`;
	}
}
/**
 * @description 处理 el.attrsList
 * @param {object} el  ast的一个抽象节点
 * @returns {string} 字符串
 */
function genData(el) {
	let data = "{";
	if (el.attrsList.length) data += `attrs:${genProps(el.attrsList)},`;
	data = data.replace(/,$/, "") + "}";
	return data === "{}" ? null : data;
}
function genProps(attrs) {
	let staticProps = ``;
	for (let i = 0; i < attrs.length; i++) {
		const attr = attrs[i];
		const value = transformSpecialNewlines(attr.value);
		staticProps += `"${attr.name}":"${value}",`;
	}
	staticProps = `{${staticProps.slice(0, -1)}}`;
	return staticProps;
}
function genNode(node) {
	if (node.type === 1) {
		return genElement(node);
	} else {
		return `_v(${
			node.type === 2
				? node.expression // no need for () because already wrapped in _s()
				: JSON.stringify(node.text)
		})`;
	}
}
function transformSpecialNewlines(text) {
	return text.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
