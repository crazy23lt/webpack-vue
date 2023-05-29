const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const BundleAnalyzerPlugin =
	require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
	target: "web",
	mode: "development",
	devtool: "cheap-source-map",
	entry: {
		main: path.resolve(__dirname, "./main.js")
	},
	output: {
		filename: "[name].[hash:8].js",
		path: path.resolve("build"),
		publicPath: "http://192.168.1.9:5555/"
	},
	resolve: {
		alias: {
			assets: path.resolve(__dirname, "./assets"),
			scripts: path.resolve(__dirname, "./scripts")
		}
	},
	externals: {
		lodash: "_"
	},
	// 优化操作
	optimization: {
		splitChunks: {
			chunks: "all",
			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendors",
					priority: -10
				},
				utilCommon: {
					name: "common",
					minSize: 0,
					minChunks: 2,
					priority: -20
				}
			}
		},
		usedExports: true // _webpack_exports_ 不导出没有引用的代码
		// minimize: true, // 压缩代码 移除没引用的代码
		// concatenateModules: true // 将引用的模块融合到一个模块里免去
	},
	module: {
		rules: [
			{
				test: /\.(png|jpg|gif)$/,
				use: [
					{
						loader: "file-loader"
					}
				]
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "main",
			template: path.resolve("public/index.html"),
			favicon: path.resolve("public/favicon.ico"),
			filename: path.resolve("build/main.html"),
			chunks: ["main", "venders", "common"],
			cdn: {
				js: "https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.min.js"
			}
		}),
		new CleanWebpackPlugin({
			path: "build"
		}),
		new BundleAnalyzerPlugin()
	]
};
