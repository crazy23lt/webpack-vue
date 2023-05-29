/**
 * @description 回调钩子执行函数，Vue 生命周期关键
 * @param {Vue} vm Vue实例化对象
 * @param {string} hook Vue 生命周期钩子名称
 */
const callHook = (vm, hook) => {
	const handlers = vm.$options[hook];
	(handlers || []).forEach(cb => cb.call(vm));
};

/**
 * @description 编译的最后一步 generate(产生、形成) 将 优化过后的 ast 编译成可执行性的代码字符串
 * @param {Object} ast 经过 optimize 优化处理的 ast 抽象语法书
 * @returns {string} codegen
 */
const generate = function (ast) {
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

/**
 * @description 获取元素真实DOM节点，如果没有找到DOM节点就创建一个空div
 * @param {string|Element} el 属性选择器 或者 真实DOM节点
 * @returns 真实DOM节点
 */
const query = el => {
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
const getOuterHTML = el => {
	return el.outerHTML;
};
const unicodeRegExp =
	/a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
function isPlainObject(target) {
	return Object.prototype.toString.call(target) === "[object Object]";
}

// step https://juejin.cn/post/7174668085872295995 [手摸手快速入门 正则表达式 (Vue源码中的使用)]
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
/**
 * 开始标签匹配
 * 以 < 开头
 * 标签名称以 a-z、A-Z、_ 开头
 * <div、<xxx:yyy
 */
const startTagOpen = new RegExp(`^<${qnameCapture}`);
/**
 * 开始结束标签
 * 以 > 结尾，前面可能有 / ，0个或多个空格
 * <img />、<div  >
 */
const startTagClose = /^\s*(\/?)>/;
/**
 * 结束标签
 * 以 </ 开头，> 结尾
 */
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
// const dynamicArgAttribute =
// 	/^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const attribute =
	/^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
//step 解析html模板字符串，三部分：开始标签、文本内容、结束标签
const parseHTML = function (html, options) {
	const stack = [];
	let index = 0;
	let last;
	while (html) {
		last = html;
		let textEnd = html.indexOf("<");
		//step textEnd===0 ；html起始 "<"
		if (textEnd === 0) {
			//step 解析：结束标签
			const endTagMatch = html.match(endTag);
			if (endTagMatch) {
				const curIndex = index;
				advance(endTagMatch[0].length);
				parseEndTag(endTagMatch[1], curIndex, index);
				continue;
			}
			//step 解析：开始标签
			const startTagMatch = parseStartTag();
			if (startTagMatch) {
				handleStartTag(startTagMatch);
				continue;
			}
		}
		let text, rest, next;
		//step 解析：文本内容
		if (textEnd >= 0) {
			rest = html.slice(textEnd);
			//step 后续文本内容不是 开始标签或结束标签 说明文本内容没有解析完
			while (!endTag.test(rest) && !startTagOpen.test(rest)) {
				next = rest.indexOf("<", 1);
				if (next < 0) break;
				textEnd += next;
				rest = html.slice(textEnd);
			}
			text = html.substring(0, textEnd);
		}
		if (textEnd < 0) {
			text = html;
		}
		if (text) {
			advance(text.length);
		}
		if (options.chars && text) {
			options.chars(text, index - text.length, index);
		}
		if (html === last) {
			options.chars(html);
			break;
		}
	}
	// step 裁剪html
	function advance(n) {
		index += n;
		html = html.substring(n);
	}
	//step 解析：开始标签；三部分：标签头，标签属性，标签尾
	function parseStartTag() {
		const start = html.match(startTagOpen);
		if (start) {
			//step 分析：标签头
			const match = {
				tagName: start[1],
				attrs: [],
				start: index
			};
			advance(start[0].length);
			//step 分析：标签属性
			//step 不是开始标签的结束部分： > 、 />
			//step 匹配到 vue 自定义属性  v-xxx=、:xxx=、@xxx=、#xxx=
			//step 匹配到 html 标签属性
			//step (attr = html.match(dynamicArgAttribute) || html.match(attribute))
			let end, attr;
			while (
				!(end = html.match(startTagClose)) &&
				(attr = html.match(attribute))
			) {
				advance(attr[0].length);
				match.attrs.push(attr);
			}
			//step 分析：标签尾
			if (end) {
				match.unarySlash = end[1];
				advance(end[0].length);
				match.end = index;
				return match;
			}
		}
	}
	//step 处理解析出来的开始标签
	function handleStartTag(match) {
		const tagName = match.tagName;
		const unarySlash = match.unarySlash;
		const unary = !!unarySlash;
		const l = match.attrs.length;
		const attrs = new Array(l);
		for (let i = 0; i < l; i++) {
			const args = match.attrs[i];
			const value = args[3] || args[4] || args[5] || "";
			attrs[i] = {
				name: args[1],
				value: value
			};
		}
		if (!unary) {
			stack.push({
				tag: tagName,
				lowerCasedTag: tagName.toLowerCase(),
				attrs: attrs,
				start: match.start,
				end: match.end
			});
		}
		if (options.start) {
			options.start(tagName, attrs, unary, match.start, match.end);
		}
	}
	//step 处理解析出来的结束标签
	function parseEndTag(tagName, start, end) {
		let pos, lowerCasedTagName;
		if (tagName) {
			lowerCasedTagName = tagName.toLowerCase();
			for (pos = stack.length - 1; pos >= 0; pos--) {
				if (stack[pos].lowerCasedTag === lowerCasedTagName) {
					break;
				}
			}
		} else {
			pos = 0;
		}
		if (pos >= 0) {
			for (let i = stack.length - 1; i >= pos; i--) {
				if (options.end) {
					options.end(stack[i].tag, start, end);
				}
			}
			stack.length = pos;
			pos && stack[pos - 1].tag;
		}
	}
};

const optimize = function (root) {
	//step 标记静态节点
	markStatic(root);
	//step 标记静态根
	markStaticRoots(root);
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

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
/**
 * @description 解析标签之间的文本 对 {{xxx}} 类型字符串进行处理
 * @param {string} text 标签之间的文本 eg: <p>xxxx</p>
 * @example
 * input => text = "前置字符串{{ name }}后置字符串"
 * output => {
 * 	expression: "'前置字符串'+_s(name)+'后置字符串'"
 * 	tokens: ["前置字符串",]
 * }
 * input => text = "xxxxx";
 * output => null
 */
const parseText = function (text) {
	//step 正则匹配 以{{开头 以}}结尾 的字符串，返回boolean值，没有便是 type:3 普通文本，无需进行处理
	if (!defaultTagRE.test(text)) return;
	const tokens = [];
	const rawTokens = [];
	//step.2 上面step.1 使用正则后 lastIndex 属性发生改变，需要重新归位，否则会跳过部分字符串
	let lastIndex = (defaultTagRE.lastIndex = 0);
	let match, index, tokenValue;
	//step.3 递归匹配 {{xxx}} 字符串
	while ((match = defaultTagRE.exec(text))) {
		index = match.index; // 匹配到目标，起始下标索引
		if (index > lastIndex) {
			// 起始下标索引大于正则开始匹配索引，说明字符串前面有多余 liut{{name}} liut 便是多余字符串
			rawTokens.push((tokenValue = text.slice(lastIndex, index)));
			tokens.push(JSON.stringify(tokenValue));
		}
		//todo const exp = parseFilters(match[1].trim()) vue filter 写法https://blog.csdn.net/liujiawei159/article/details/117220365
		tokens.push(`_s(${match[1].trim()})`);
		rawTokens.push({ "@binding": match[1].trim() });
		// lastIndex 下次开始匹配的text索引
		lastIndex = index + match[0].length;
	}
	// {{...}}后面还有文本内容
	if (lastIndex < text.length) {
		rawTokens.push((tokenValue = text.slice(lastIndex)));
		tokens.push(JSON.stringify(tokenValue));
	}
	return {
		expression: tokens.join("+"),
		tokens: rawTokens
	};
};

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
const compiler = template => {
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

var config = {
	// 取消Vue所有警告日志
	silent: false,
	// 自定义 mergeOptions 函数 使用的 合并策略（strate）
	optionMergeStrategies: Object.create(null),
	// 是否允许浏览器 devtools 插件 检查代码
	devtools: true,
	//https://juejin.cn/post/7088692271079489550
	errorHandler: function (err, vm, info) {
		console.dir({ err, vm, info });
		// handle error
		// `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
		// 只在 2.2.0+ 可用
	},
	warnHandler: function (msg, vm, trace) {
		console.dir(msg, vm, trace);
		// `trace` 是组件的继承关系追踪
	},
	// 让vue忽略指定自定义元素，例如：使用 <icon></icon> 元素，并别Vue创建的全局组件
	ignoredElements: [],
	// 自定义 vue keyup.xxx
	/**
	 * keyup.enter
	 * keyup.tab
	 * keyup.delete
	 * keyup.esc
	 * keyup.space
	 * keyup.up
	 * keyup.down
	 * keyup.left
	 * keyup.right
	 */
	keyCodes: {
		/*f1: 122*/
	}
	// https://segmentfault.com/a/1190000022682776
};

const LIFECYCLE_HOOKS = [
	"beforeCreate",
	"created",
	"beforeMount",
	"mounted",
	"beforeUpdate",
	"updated",
	"beforeDestroy",
	"destroyed",
	"activated",
	"deactivated",
	"errorCaptured",
	"serverPrefetch"
];
const defaultStrat = (parentVal, childVal) =>
	childVal === undefined ? parentVal : childVal;
/**
 * @description options 合并策略
 * @property options.data 合并策略
 * @property options.computed 合并策略
 */
const strats = config.optionMergeStrategies;
strats.data = function (parentVal, childVal, vm) {
	return function () {
		const instanceData =
			typeof childVal === "function" ? childVal.call(vm, vm) : childVal;
		return instanceData;
	};
};
strats.computed = function (parentval, childVal) {
	if (!parentval) return childVal;
};

LIFECYCLE_HOOKS.forEach(hook => {
	strats[hook] = mergeHook;
});
//step 合并 baseLifeCycleHooks + lifeCycleHooks
function mergeHook(baseVal, val) {
	let res;
	if (val) {
		if (baseVal) {
			console.dir(baseVal);
			res = baseVal.concat(val);
		} else {
			if (Array.isArray(val)) res = val;
			else res = [val];
		}
	} else {
		res = baseVal;
	}
	return res;
}
/**
 * @description 合并 options
 * @param {object} baseOptions	vue.options 属性
 * @param {object} options			new Vue(options) 属性
 * @param {Vue} vm 							Vue实例对象
 * @returns {object} 合并完成之后的 options
 */
const mergeOptions = (baseOptions, options, vm) => {
	const _options = {};
	for (const key in baseOptions) {
		mergeField(key);
	}
	for (const key in options) {
		if (!Object.prototype.hasOwnProperty.call(baseOptions, key))
			mergeField(key);
	}
	function mergeField(key) {
		const strat = strats[key] || defaultStrat;
		_options[key] = strat(baseOptions[key], options[key], vm);
	}
	return _options;
};

//step 回调任务栈
const callbacks = [];
//step 避免多次触发timerFunc
let pending = false;
//step JS EventLoop 微任务=>渲染=>宏任务
let timerFunc;
if (typeof Promise !== "undefined") {
	timerFunc = () => Promise.resolve().then(flushCallbacks);
} else if (typeof MutationObserver !== "undefined") {
	let counter = 1;
	const observer = new MutationObserver(flushCallbacks);
	const textNode = document.createTextNode(String(counter));
	observer.observe(textNode, {
		characterData: true
	});
	timerFunc = () => {
		counter = (counter + 1) % 2;
		textNode.data = String(counter);
	};
} else if (typeof setImmediate !== "undefined") {
	timerFunc = () => setImmediate(flushCallbacks);
} else {
	timerFunc = () => setTimeout(flushCallbacks, 0);
}
const flushCallbacks = () => {
	pending = false;
	const copies = callbacks.slice(0);
	callbacks.length = 0;
	for (let i = 0; i < copies.length; i++) {
		copies[i]();
	}
};
/**
 * @description 通过 js Event Loop 将函数放入 task queen,在主线程任务执行完成后，再将 task queen 中任务放入 主执行栈中执行
 * @param {function} cb task queen 回调任务
 * @param {vm} ctx vue 实例化对象
 */
const nextTick = (cb, ctx) => {
	callbacks.push(() => cb.call(ctx));
	// 避免多次调用
	if (!pending) {
		pending = true;
		timerFunc();
	}
};
/**
+-------------------------+     +----------+     +---------------+
|      Vue.nextTick       | --> |          | --> |               |
+-------------------------+     | nextTick |     | push callback |
+-------------------------+     |          |     |               |
| Vue.prototype.$nextTick | --> |          |     |               |
+-------------------------+     +----------+     +---------------+
                                                   :
                                                   : run
                                                   :
                                                 +---------------+
                                                 |   timerFunc   |
                                                 +---------------+

 */

let oldArrayProtoMethods = Array.prototype;
/**@description 创建一个原型是Array.prototype的对象,会对原型方法进行一些重写（AOP）*/
let arrayMethods = Object.create(oldArrayProtoMethods);
/**@description arrayMethods 空对象需要重写的方法 */
let mrthods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
mrthods.forEach(methods => {
	arrayMethods[methods] = function (...args) {
		const result = oldArrayProtoMethods[methods].apply(this, args);
		let inserted;
		switch (methods) {
			case "push":
			case "unshift":
				inserted = args;
				break;
			case "splice":
				inserted = args.slice(2);
				break;
		}
		//step 对于数组新插入的对象，需要进行劫持操作
		if (inserted) this.__ob__.observeArray(inserted);
		this.__ob__.dep.notify();
		return result;
	};
});

class Dep {
	/**
	 * @class Dep 订阅对象构造函数
	 * @property `this.watchers` watchers 栈
	 * @function `depend` watcher.addDep() watcher 关联 Dep
	 * @function `addWatcher` 添加Dep.watcher静态属性上的 watcher
	 * @function `notify`	通知所有 watchers 执行 watcher.update()
	 * @static `watcher` 一个 Watcher
	 */
	constructor() {
		this.watchers = [];
	}
	depend() {
		//step Watcher.addDep(Dep)
		if (Dep.watcher) Dep.watcher.addDep(this);
	}
	addWatcher(watcher) {
		this.watchers.push(watcher);
	}
	notify() {
		const _watchers = this.watchers.slice();
		_watchers.forEach(watcher => watcher.update());
	}
}
/**@description Dep静态属性 watcher，一个 watcher 对象 */
Dep.watcher = null;
//step 维护一个 watcher 栈
//step 每一个 updateComponent 对应一个 watcher
const watcherStack = [];
/**
 * @description 维护一个管理所有种类 watcher 的栈，此函数用于入栈操作
 * @param {Watcher} watcher watcher 实例化对象
 */
const pushWatcher = watcher => {
	watcherStack.push(watcher);
	//Dep 静态属性 watcher
	Dep.watcher = watcher;
};
/**
 *  @description 维护一个管理所有种类 watcher 的栈，此函数用于出栈操作
 */
const popWatcher = () => {
	watcherStack.pop();
	Dep.watcher = watcherStack[watcherStack.length - 1];
};

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
const observe = data => {
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
const proxy = (target, sourceKey, key) => {
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

/**
 *
 * @param {vm} vm vue实例对象
 * @param {string} expOrFn watch 属性-键
 * @param {Function|object|string|Array<string|Function|object>} handler watch 属性值 (数组、对象、字符串、函数)
 */
const createWatcher = function (vm, expOrFn, handler, options) {
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
const parsePath = path => {
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
const traverse = val => {
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

const queue = [];
let uid = 0;
let has = {};
let waiting = false;

class Watcher {
	/**
	 * @description 创建一个 Watcher 对象
	 * @param {Vue} vm Vue实例对象
	 * @param {function|string} expOrFn render watcher 是一个 渲染函数；user watcher 是一个字符串
	 * @param {?function} cb user watcher 需要传递此参数
	 * @param {?object} options 描述创建何种watcher
	 * @param {?boolean} options.lazy 创建一个 lazy watcher 用于 computed 计算属性
	 * @param {?boolean} options.deep 创建一个 deep user watcher 用于 watch 深度监听属性
	 * @param {?boolean} options.user 创建一个 user watcher 用于 watch 监听属性
	 * @param {?function} options.before 更新 render watcher 时会调用
	 */
	constructor(vm, expOrFn, cb, options) {
		this.vm = vm;
		this.cb = cb;
		this.id = ++uid;
		if (options) {
			this.lazy = !!options.lazy;
			this.deep = !!options.deep;
			this.user = !!options.user;
			this.before = options.before;
		} else {
			this.deep = this.user = this.lazy = false;
		}
		this.deps = [];
		this.dirty = this.lazy;
		//options.watch 传输进来的 expOrFn 是一个字符串
		if (typeof expOrFn === "function") this.getter = expOrFn;
		else this.getter = parsePath(expOrFn);
		// lazy watcher 实例化不会执行 getter
		this.value = this.lazy ? undefined : this.get();
	}
	get() {
		pushWatcher(this);
		const vm = this.vm;
		// 当是 computed watcher 时，Dep.target = computed watcher，计算属性使用 data 内的属性，data 的 Dep.watchers 会记录 当前的 computed watcher
		// watch Watcher 时，通过parsePath(expOrFn)触发监听data的劫持从而，让 data dep 订阅 这个 watch watcher
		let value = this.getter.call(vm, vm);
		if (this.deep) traverse(value);
		popWatcher();
		return value;
	}
	//data getter 触发 dep.depend 触发 watcher.addDep
	addDep(dep) {
		this.deps.push(dep); // 记录 data 属性创建的 dep
		dep.addWatcher(this);
	}
	//dep.notify 通知 所订阅的 watcher 进行 update 操作，render watcher、computed watcher（lazy watcher）、watch watcher（user watcher）
	update() {
		if (this.lazy) {
			this.dirty = true;
		} else {
			queueWatcher(this); // this.run()
		}
	}
	run() {
		const value = this.get();
		if (value !== this.value) {
			const oldValue = this.value;
			this.value = value;
			if (this.user) {
				this.cb.call(this.vm, value, oldValue);
			}
		}
	}
	evaluate() {
		this.value = this.get();
		// dirty=false 下次触发 computed属性的 getter 会使用本次执行 get() 多的 value
		this.dirty = false;
	}
	depend() {
		let i = this.deps.length;
		while (i--) {
			this.deps[i].depend();
		}
	}
}

function queueWatcher(watcher) {
	const id = watcher.id;
	if (has[id] == null) {
		has[id] = true;
		queue.push(watcher);
		if (!waiting) {
			waiting = true;
			nextTick(() => {
				queue.forEach(w => {
					if (w.before) w.before();
					w.run();
					callHook(w.vm, "updated");
				});
				waiting = false;
			});
		}
	}
}

class VNode {
	constructor(tag, data, children, text, elm, context) {
		this.tag = tag;
		this.data = data;
		this.children = children;
		this.text = text;
		this.elm = elm;
		this.ns = undefined;
		this.context = context;
		this.fnContext = undefined;
		this.fnOptions = undefined;
		this.fnScopeId = undefined;
		this.key = data && data.key;
		this.componentInstance = undefined;
		this.parent = undefined;
		this.raw = false;
		this.isStatic = false;
		this.isRootInsert = true;
		this.isComment = false;
		this.isCloned = false;
		this.isOnce = false;
		this.asyncMeta = undefined;
		this.isAsyncPlaceholder = false;
	}
}

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
const createElement$1 = (context, tag, data, children) => {
	if (Array.isArray(data) || isPrimitive(data)) {
		children = data;
		data = undefined;
	}
	// step.1 children 是 字符串或数字 返回文本节点
	// step.2 children 是 数组 将数组内进行遍历转换成vnode
	children = isPrimitive(children)
		? [createTextVNode$1(children)]
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
			if (isTextVnode(last)) res[lastIndex] = createTextVNode$1(last.text + item);
			else if (item !== "") res.push(createTextVNode$1(item));
		} else {
			if (isTextVnode(last) && isTextVnode(item)) {
				res[lastIndex] = createTextVNode$1(last.text + item.text);
			} else {
				res.push(item);
			}
		}
	}
	return res;
}
function createTextVNode$1(val) {
	return new VNode(undefined, undefined, undefined, String(val));
}
function isTextVnode(node) {
	return node && node.text;
}

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
var attrsFns = [
	ref,
	directives,
	attrs,
	klass,
	events,
	domProps,
	style,
	transition
];

const hooks = ["create", "activate", "update", "remove", "destroy"];
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
const patch = (oldVnode, vnode) => {
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
		if (oldCh && !ch) removeVnodes(oldCh, 0, oldCh.length - 1);
		if (!oldCh && ch) addVnodes(oldCh, 0, oldCh.length - 1);
	} else if (oldVnode.text !== vnode.text) {
		setTextContent(elm, vnode.text);
	}
}
function removeVnodes() {}
function addVnodes() {}
function setTextContent() {}

//step target Vue 原型对象 Vue.prototype
const installRenderHelpers = target => {
	target._v = createTextVNode;
	target._s = toString;
	target._m = renderStatic;
	target._l = renderList;
};
function createTextVNode(val) {
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
	let ret, i, l;
	if (Array.isArray(val)) {
		ret = new Array(val.length);
		for (i = 0, l = val.length; i < l; i++) {
			ret[i] = render(val[i], i);
		}
	}
	console.dir({ ret });
	return ret;
}

/**@description 访问vm代理的computed属性 */
function computedGetter(vm, key) {
	return function () {
		const watcher = vm._computedWatchers[key];
		if (watcher) {
			if (watcher.dirty) watcher.evaluate();
			// 此时 Dep.watcher 是 render watcher，因为触发 computed 属性只有在 $mount -> new Watcher 下才会执行 updateComponent
			if (Dep.watcher) watcher.depend();
			return watcher.value;
		} else {
			return null;
		}
	};
}
/**@description  为computed内每一个属性创建一个 lazy watcher，并将属性通过 Object.defineProperty 代理到 vm 上。*/
const defineComputed = (vm, key, target) => {
	/**@description watchers 记录每一个 computed 内属性所对应的 lazy watcher */
	const watchers = (vm._computedWatchers = Object.create(null));
	const getter = typeof target === "function" ? target : target.get;
	watchers[key] = new Watcher(vm, getter || (() => {}), () => {}, {
		lazy: true
	});
	if (!(key in vm)) {
		Object.defineProperty(vm, key, {
			get: computedGetter(vm, key),
			set: typeof userDef === "function" ? () => {} : target.set
		});
	}
};

/**
 * @description 向响应式对象中添加一个 property，并确保这个新 property 同样是响应式的，且触发视图更新。
 * @param {object|array} target `修改` 或 `添加` 属性数据的`对象`
 * @param {string|number} propertyName `修改` 或 `添加` 属性的`名称`
 * @param {any} value `修改` 或 `添加` 属性的`值`
 * @example
 * this.arr[0] = 111; //通过数组下标修改响应式数据无法触发 defineReactive 的劫持
 * this.$set(this.arr,0,111); //通过$set进行响应式数据修改
 * this.obj['b'] = 12; //往对象内新增属性，无法触发劫持
 * this.$set(this.obj,'b',12);
 */
const set = function (target, propertyName, value) {
	const isArray = Array.isArray(target);
	if (isArray) {
		// 数组类型数据处理
		target.length = Math.max(target.length, propertyName);
		target.splice(propertyName, 1, value);
		return value;
	}
};

/**@description vm._init ; vm.$mount ; compiler ; render watcher */
const initMixin = Vue => {
	Vue.prototype._init = function (options) {
		const vm = this;
		//step vm.$options 完成合并之后的 options
		vm.$options = mergeOptions(vm.constructor.options, options, vm);
		initRender(vm);
		callHook(vm, "beforeCreate");
		initState(vm);
		callHook(vm, "created");
		// step 分析 template(有的话) 创建 render Watcher 挂载 页面
		if (vm.$options.el) vm.$mount(vm.$options.el, vm);
	};
	/**@description 在 vm 上添加创建的虚拟节点的函数*/
	function initRender(vm) {
		//step createElement 返回虚拟节点 Vnode，用于 __patch__ 生成真实 DOM
		vm._c = (tagname, attrs, children) =>
			createElement$1(vm, tagname, attrs, children);
		vm.$createElement = (tagname, attrs, children) =>
			createElement$1(vm, tagname, attrs, children);
	}
	/**@description 初始化 vm上的属性 */
	function initState(vm) {
		const opts = vm.$options;
		if (opts.data) initData(vm);
		if (opts.computed) initComputed(vm, opts.computed);
		if (opts.watch) initWatch(vm, opts.watch);
		/**@description 初始化 vm.$options.data。1.代理 data 到 vm 上。2.劫持 data*/
		function initData(vm) {
			let data = vm.$options.data;
			data = vm._data = typeof data === "function" ? data(vm, vm) : data || {};
			for (const key in data) {
				//step 将_data上的属性代理到vm上，直接访问
				proxy(vm, `_data`, key);
			}
			//step 劫持data ===> 劫持vm._data
			observe(data);
		}
		/**
		 * @description 初始化 vm.$options.computed*
		 * @example
		 * `computed:{ fullname(){....} }`
		 * `computed:{ fullname:{ get(){....} } }`
		 * */
		function initComputed(vm, computed) {
			for (const key in computed) {
				// 劫持 computed 属性 到 vm 上（render.call(vm,vm) 时调用属性）
				defineComputed(vm, key, computed[key]);
			}
		}
		/**
		 * @description 初始化 watch
		 * @param {object} vm Vue实例对象
		 * @param {object} watch watch 属性格式
		 * @example watch:{ target:function(){} } 函数声明
		 * @example watch:{ target:"xxxxx" } 字符串声明
		 * @example watch:{ "target.xxx":{ handle:function(){} } } 对象声明
		 * @example watch:{ "target.xxx":[xxx] } 数组声明
		 * @example watch:{ "target.xxx":{ handler:()=>{},deep:true } } 用于监听对象
		 */
		function initWatch(vm, watch) {
			for (const key in watch) {
				// 获取 watch 对象的 key 和 value
				const handler = watch[key];
				//todo 需要处理 watch 是 数组格式的情况，循环创建监听
				createWatcher(vm, key, handler);
			}
		}
	}
	/**@description template ===> render ===> updateComponent ===> render Watcher */
	/*
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
' main                                                           '
'                                                                '
' +--------+     +-----------------+          +----------------+ '
' | $mount | --> |   get render    | -------> | render Watcher | '
' +--------+     +-----------------+          +----------------+ '
'                                                                '
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -+
                                                |
                                                |
                                                v
                 +-----------------+          +----------------+            +---------------+
                 | tempalte render | <------- |   run render   |   -------> | custom render |
                 +-----------------+          +----------------+            +---------------+
                   |                            :                             |
                   |                            :                             |
                   |                            v                             |
                   |                 vnode    +----------------+    vnode     |
                   +------------------------> |  patch vnode   |   <----------+
                                              +----------------+
	*/
	Vue.prototype.$mount = function (el, vm = this) {
		//step 拿到 tempalte 解析出 renden
		el = el && query(el);
		const options = this.$options;
		if (!options.render) {
			let template = options.template;
			if (template) {
				if (template.charAt(0) === "#") {
					template = query(template).innerHTML;
				}
			} else if (el) {
				template = getOuterHTML(el);
			}
			if (template) {
				const { render, staticRenderFns } = compiler(template);
				options.render = render;
				options.staticRenderFns = staticRenderFns;
			}
		}
		//step 绑定watcher 与 render
		vm.$el = el;
		callHook(vm, "beforeMount");
		const updateComponent = () => vm._update(vm._render());
		new Watcher(vm, updateComponent, () => {}, {
			before() {
				callHook(vm, "beforeUpdate");
			}
		});
		callHook(vm, "mounted");
	};
};
/**@description vm.$watch ; vm.$set */
const stateMixin = Vue => {
	/**
	 * @description Vue.prototype.$watch 原型方法 用于监听vm上的一个属性
	 * @param {string} expOrFn vm 上属性
	 * @param {function} cb $watch 回调函数
	 * @param {?object} options 描述如何监听
	 * @returns {Function} 返回函数解除函数监听
	 */
	Vue.prototype.$watch = function (expOrFn, cb, options) {
		const vm = this;
		options = options || {};
		// 用于创建一个 user Watcher
		options.user = true;
		const watcher = new Watcher(vm, expOrFn, cb, options);
		return function unwatchFn() {
			watcher.teardown();
		};
	};
	Vue.prototype.$set = set;
};
/**@description vm._update ; vm._patch_ */
const lifecycleMixin = Vue => {
	//step 更新逻辑
	Vue.prototype._update = function (vnode) {
		const vm = this;
		// const prevEl = vm.$el;
		const prevVnode = vm._vnode;
		vm._vnode = vnode;
		if (!prevVnode) {
			//step 首次渲染
			vm.$el = vm.__patch__(vm.$el, vnode);
		} else {
			//step 数据更新渲染
			vm.$el = vm.__patch__(prevVnode, vnode);
		}
	};
	//step 如何更新（diff算法）
	Vue.prototype.__patch__ = patch;
};
/**@description vm._render ; vm.$nextTick ; 等等（RenderHelpers） */
const renderMixin = Vue => {
	//step 定义渲染函数 vm._c、vm._s
	installRenderHelpers(Vue.prototype);
	Vue.prototype._render = function () {
		const vm = this;
		const { render } = vm.$options;
		let vnode = render.call(vm, vm.$createElement);
		return vnode;
	};
	Vue.prototype.$nextTick = function (fn) {
		return nextTick(fn, this);
	};
};
/**@description Vue.nextTick ; Vue.options ; 等等 */
const initGlobalAPI = Vue => {
	const configDef = {};
	configDef.get = () => config;
	configDef.set = () => {
		console.error(
			"[Vue warn]: Do not replace the Vue.config object, set individual fields instead."
		);
	};
	Object.defineProperty(Vue, "config", configDef); // Vue.config 属性
	Vue.util = {};
	Vue.nextTick = nextTick;
	Vue.observable = obj => {
		observe(obj);
		return obj;
	};
	Vue.options = Object.create(null);
	["component", "directive", "filter"].forEach(
		type => (Vue.options[type + "s"] = Object.create(null))
	);
	Vue.options._base = Vue;
	Vue.use = function () {};
	Vue.mixin = function (mixin) {
		this.options = mergeOptions(this.options, mixin);
		return this;
	};
	Vue.extend = function (extendOptions) {
		extendOptions = extendOptions || {};
		const Super = this; // this => Vue
		const Sub = function VueComponent(options) {
			this._init(options);
		};
		Sub.prototype = Object.create(Super.prototype);
		Sub.prototype.constructor = Sub;
		Sub.options = mergeOptions(Super.options, extendOptions);
		Sub["super"] = Super;
		return Sub;
	};
	Vue.component = function (id, definition) {
		if (isPlainObject(definition)) {
			definition.name = definition.name || id;
			definition = this.extend(definition);
		}
		this.options["components"][id] = definition;
		return definition;
	};
};
/**
 * @description Vue 构造函数
 * @param {object} options
 * @param {string | DOMElement} options.el id属性或class属性字符串 或 真实DOM节点 （渲染位置）
 * @param {?string} options.template			id属性或class属性字符串 或 DOM 字符串  （渲染模板）
 * @param {?Function} options.render 		render函数 跳过 vue 抽象语法解析步骤	 （渲染函数）
 * @param {?Function} options.data			Vue 响应式数据
 * @param {?Function} options.params			Vue 响应式数据
 * @param {?Function} options.beforeCreate beforeCreate 生命周期钩子函数，在开始初始化options之前
 * @param {?Function} options.created
 * @param {?Function} options.beforeMount
 * @param {?Function} options.mounted
 * @param {?Function} options.beforeUpdate
 * @param {?Function} options.updated
 * @param {?Function} options.beforeDestroy
 * @param {?Function} options.destroyed
 * @example computed {
 * 		fullName:{
 * 			get:function(){
 * 				return this.firstName + " " + this.lastName;
 * 			},
 * 			set:function(newVal){
 * 				let names = newVal.split(" ");
 * 				this.firstName = names[0];
 * 				this.lastName = names[names.length - 1];
 * 			}
 * 		},
 * 		fullName(){
 * 			return this.firstName + " " + this.lastName;
 * 		}
 * }
 */
function Vue(options) {
	//初始化options参数
	this._init(options);
}
/*
															+----------------------+     +----------------------+     +-------------------------+     +-------------------------+
															| Vue.prototype._init  |     |  Vue.prototype.$set  |     |  Vue.prototype._update  |     |  Vue.prototype._render  |
															+----------------------+     +----------------------+     +-------------------------+     +-------------------------+
																^                            ^                            ^                               ^
																|                            |                            |                               |
																|                            |                            |                               |
								 +- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
								 ' main                                                                                                                                             '
								 '                                                                                                                                                  '
+----------+     ' +----------------------+     +----------------------+     +-------------------------+     +-------------------------+     +--------------------+ '     +------------+
| init Vue | --> ' |    initMixin(Vue)    | --> |   stateMixin(Vue)    | --> |   lifecycleMixin(Vue)   | --> |    renderMixin(Vue)     | --> | initGlobalAPI(Vue) | ' --> | export Vue |
+----------+     ' +----------------------+     +----------------------+     +-------------------------+     +-------------------------+     +--------------------+ '     +------------+
								 '                                                                                                                                                  '
								 +- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
																|                            |                            |                               |
																|                            |                            |                               |
																v                            v                            v                               v
															+----------------------+     +----------------------+     +-------------------------+     +-------------------------+
															| Vue.prototype.$mount |     | Vue.prototype.$watch |     | Vue.prototype.__patch__ |     | Vue.prototype.$nextTick |
															+----------------------+     +----------------------+     +-------------------------+     +-------------------------+
*/
initMixin(Vue);
stateMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);
initGlobalAPI(Vue);

export { Vue as default };
//# sourceMappingURL=vue.js.map
