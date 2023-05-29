// step https://juejin.cn/post/7174668085872295995 [手摸手快速入门 正则表达式 (Vue源码中的使用)]
import { unicodeRegExp } from "../tools/utils";
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
export const parseHTML = function (html, options) {
	const stack = [];
	let index = 0;
	let last, lastTag;
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
			lastTag = tagName;
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
			lastTag = pos && stack[pos - 1].tag;
		}
	}
};
