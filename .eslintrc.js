module.exports = {
	env: {
		// 支持浏览器环境
		browser: true,
		es2021: true,
		// 识别 CommonJS
		node: true
	},
	extends: [
		"eslint:recommended",
		"plugin:prettier/recommended",
		"plugin:vue/essential"
	],
	overrides: [],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
		parser: "@babel/eslint-parser" // 解析器
	},
	plugins: [
		// 使用 Prettier 的代码风格规则
		// 并用 Prettier 来自动修复代码
		"prettier",
		"vue"
	],
	rules: {
		// 违反 Prettier 的规则就报 error
		"prettier/prettier": "error", // prettier 规则 [0:error,1:warn,2:off]
		// "no-console": process.env.NODE_ENV === "production" ? "warn" : "off"
		"vue/multi-word-component-names": 0,
		"vue/comment-directive": "off"
	}
};
/**
 * "eslint-config-prettier": "^8.8.0",
 * "eslint-plugin-prettier": "^4.2.1",
 */
