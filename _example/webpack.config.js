const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
	target: "web",
	mode: "development",
	devtool: "cheap-module-source-map",
	entry: {
		main: path.resolve(__dirname, "./main.js")
	},
	output: {
		filename: "[name].[hash:8].js",
		path: path.resolve("build")
	},
	module: {
		rules: [
			{
				test: /\.(css)?$/,
				use: [{ loader: MiniCssExtractPlugin.loader }, "css-loader"]
			}
		]
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				parallel: true
			})
		]
	},
	plugins: [
		new CleanWebpackPlugin({
			path: "build"
		}),
		new HtmlWebpackPlugin({
			title: "main",
			template: path.resolve("public/index.html"),
			favicon: path.resolve("public/favicon.ico"),
			filename: path.resolve("build/main.html"),
			chunks: ["main"],
			minify: true
		}),
		new MiniCssExtractPlugin()
	]
};
