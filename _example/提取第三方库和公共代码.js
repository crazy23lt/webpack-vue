const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
	target: "web",
	mode: "development",
	devtool: "cheap-source-map",
	entry: {
		main: path.resolve(__dirname, "./main.js"),
		app: path.resolve(__dirname, "./app.js")
	},
	output: {
		filename: "[name].[hash:8].js",
		path: path.resolve("build")
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
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "main",
			template: path.resolve(__dirname, "../public/index.html"),
			favicon: path.resolve(__dirname, "../public/favicon.ico"),
			filename: path.resolve(__dirname, "../build/main.html"),
			chunks: ["main", "venders", "common"]
		}),
		new HtmlWebpackPlugin({
			title: "app",
			template: path.resolve(__dirname, "../public/index.html"),
			favicon: path.resolve(__dirname, "../public/favicon.ico"),
			filename: path.resolve(__dirname, "../build/app.html"),
			chunks: ["app", "venders", "common"]
		})
	]
};
