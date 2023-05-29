/**
 * preset 启动顺序与数组索引相反的。
 * @babel/preset-env 是一个 babel 的预设。
 * 可以根据 browserslist 的配置进行转码。
 */
const presets = [
	[
		"@babel/preset-env",
		{
			spec: false, //boolean 启用更加符合ES规格的代码转换，默认也是false，转换后的代码，会增加很多helper函数，代码量更大，但是代码质量更好
			loose: false, // 启用松散式的代码转换，假如某个插件支持这个option，转换后的代码，会更加简单，代码量更少，但是不会严格遵循ES的规格，通常默认是false
			useBuiltIns: "usage", //是否有引入polyfill，usage：根据编译文件中使用的api进行填充，entry：根据browserslistrc 进行填充（编译文件体积严重增大），false（默认值）：默认不进行填充
			modules: false, // 是否将es6模块转换成其他规范的模块。
			debug: false, // 开启转码调试
			corejs: { version: 3, proposals: true } // 指定preset-env 进行 polyfill 时用到的 corejs 版本，proposals是否开启还在提议阶段的 语法
		}
	]
];
const plugins = [];
module.exports = { presets, plugins };
