import { generate } from "./generate";
import { parseHTML } from "./html-parser";
import { optimize } from "./optimize";
import { parseText } from "./text-parser";
/**
 * @description 分析html模板字符串，解析出对应的AST抽象语法树
 * @param {string} template Vue 书写模板
 * @returns ast 抽象语法树
 * @example
 * let temp = <ul class="ls"><li>{{name}}</li><ul> //vue 模板语法
 * let ast = parse(temp);
 * ast = {
 * 		type:1,
 * 		tag:"ul",
 * 		attrsList:[{name:"class",value:"ls"}],
 * 		children:[{type:1,tag:"li",attrsList:[],children:[{type:2,expression:"_s(name)",text:"{{name}}"}]}]
 * }
 * @param {number} type 1:普通元素;2:vue表达式({{name}}、{{name | filter}});3:文本节点
 * @param {string} tag  标签名称
 * @param {array}  attrsList 标签属性
 * @param {array}  children  标签子元素
 */
function parse(template) {
	//step 1. 维护一个stack栈，每解析完成一个标签，将解析完成的ast存入栈中
	const stack = [];
	//step 2. root 记录第一个解析完成的标签，他代表整个vue模板语法解析出来的 根ast节点
	let root;
	//step 3. currentParent 记录当前解析完成的标签，到解析到下一个标签时
	let currentParent;
	//step 4. 解析html模板字符串。type:1 普通元素；type:2 表达式字符串；tyle:3 普通文本
	parseHTML(template, {
		start(tag, attrs, unary) {
			//step 4.1 创建一个 type:1 普通元素
			//step 3.1 currentParent 此处尾上一个解析完成的标签，是当前正在解析标签的 parent
			let element = createASTElement(tag, attrs, currentParent);
			processFor(element);
			if (!root) root = element;
			if (!unary) {
				//step 3.2 将新的 ast 替换掉 currentParent,供下一和 ast节点使用
				currentParent = element;
				//step 1.1 将 解析出来的ast推入 stack 栈中
				stack.push(element);
			}
		},
		chars(text) {
			if (!currentParent) return;
			const children = currentParent.children;
			if (text.trim() && text !== " ") {
				let res, child;
				//step 4.2 分析标签之间的字符串，判断是 type:2 表达式字符串，还是 type:3 普通文本
				if ((res = parseText(text))) {
					child = {
						type: 2,
						expression: res.expression,
						tokens: res.tokens,
						text
					};
				} else {
					child = {
						type: 3,
						text
					};
				}
				children.push(child);
			}
		},
		end() {
			//step 1.2 分析结束标签，stack 栈中最后推入的 ast 节点，是当前结束标签的开始标签，找到stack栈中上一个 ast 节点，记录children属性
			let element = stack[stack.length - 1];
			stack.length -= 1;
			currentParent = stack[stack.length - 1];
			if (currentParent) {
				currentParent.children.push(element);
				element.parent = currentParent;
			}
		}
	});
	return root;
}
function createASTElement(tag, attrs, parent) {
	return {
		type: 1,
		tag,
		attrsList: attrs,
		attrsMap: makeAttrsMap(attrs), // {"class":"ls"} ==> {name:"class",value:"ls"}
		rawAttrsMap: {},
		parent,
		children: []
	};
}
function makeAttrsMap(attrs) {
	const map = {};
	for (let i = 0, l = attrs.length; i < l; i++) {
		map[attrs[i].name] = attrs[i].value;
	}
	return map;
}
/**
 * @description 解析 attrsList 里面的 v-for 指令 ,混入到 ast节点中
 * @example
 * <li v-for="(value, index) in arr">
 * {
 * 		alias: "value"
 * 		for: "arr"
 * 		iterator1: "index"
 * 	}
 * */
function processFor(el) {
	// 检查 attrsMap 中是否有 v-for 键值对
	let exp = el.attrsMap["v-for"];
	if (exp) {
		const list = el.attrsList;
		// 将 v-for 键值 从 attrsList 中删除
		for (let i = 0, l = list.length; i < l; i++) {
			if (list[i].name === name) {
				list.splice(i, 1);
				break;
			}
		}
		// 分析 v-for 指令 添加到 当前ast 节点上
		const res = parseFor(exp);
		/**
		 * v-for = (value,index) in arr
		 res => {
				alias: "value"
				for: "arr"
				iterator1: "index"
		 }
		 */
		Object.assign(el, res);
	}
}
const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
const stripParensRE = /^\(|\)$/g;
function parseFor(exp) {
	//exp => "(value,index) in arr"
	const inMatch = exp.match(forAliasRE);
	//inMatch => [ "(value,index) in arr", "(value,index)", "arr" ]
	if (!inMatch) return;
	const res = {};
	res.for = inMatch[2].trim();
	//res.for => "arr"
	const alias = inMatch[1].trim().replace(stripParensRE, "");
	//alias => "value,index"
	const iteratorMatch = alias.match(forIteratorRE);
	//iteratorMatch => [", index", " index", undefined]
	if (iteratorMatch) {
		res.alias = alias.replace(forIteratorRE, "").trim();
		//res.alias => "value"
		res.iterator1 = iteratorMatch[1].trim();
		if (iteratorMatch[2]) {
			res.iterator2 = iteratorMatch[2].trim();
			//res.alias => "index"
		}
	} else {
		res.alias = alias;
	}
	return res;
}
/**@description ast抽象语法树 -> optimize优化 -> generate code */
export const compiler = template => {
	// step 根据html生成抽象语法树ast，ast抽象语法树进行patch对比然后渲染，的代价远小于直接操作真实DOM
	const ast = parse(template.trim());
	// step 对ast抽象语法树进行优化操作，标记渲染之后不再重新渲染的节点，让后续patch过程跳过对比
	optimize(ast);
	console.dir({ ast });
	//step 将优化后的ast转换成可执行的代码
	const code = generate(ast);
	console.dir(code);
	return {
		ast,
		render: new Function(code.render),
		staticRenderFns: code.staticRenderFns
	};
};
