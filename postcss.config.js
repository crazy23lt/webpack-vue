module.exports = {
	plugins: [require("postcss-preset-env")]
	/**
	 * postcss 提供的是一个平台，将 css 解析成 ast 抽象语法树，再通过其他插件对 ast 进程 js 逻辑处理，得到我们想要的css。
	 * postcss-preset-env 是 postcss 的一种预设，他会根据 browserslistrc 进行按照目标范围浏览器进行代码处理。
	 * require("postcss-preset-env")({stage:1}) 实验性阶段 默认2
	 */
};
