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
export const parseText = function (text) {
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
