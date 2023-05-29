const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const Dotenv = require("dotenv-webpack");
// const BundleAnalyzerPlugin =
// 	require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
/**
 * @type {import('webpack').Configuration}
 *
 */
module.exports = {
	/** -----------------------------------基本打包配置------------------------------------ **/
	/**@description 告知webpack部署环境目标 <web | node>*/
	target: "web",
	/**@description 告知webpack使用相应环境的内置优化 <development | production | none>*/
	mode: "production",
	/**@description 如何生成 source-map*/
	devtool: "cheap-source-map",
	/**@description 配置wenpack打包的入口文件*/
	entry: { main: path.resolve(__dirname, "../src/main.js") }, // 多文件入口
	//entry: path.resolve(__dirname, "../src/main.js"), // 单文件入口
	// step 配置webpack如何输出编译后的文件
	/**
	 * output : <object>
	 * filename : <string> 输出文件名称
	 * path     : <string> 输出文件目录
	 * publicPath : <string> 引用资源文件地址 eg. import "./index.css" ==> <string>/index.css
	 */
	output: {
		filename: "assets/js/[name][hash:8].js",
		path: path.resolve(__dirname, "../dist")
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				include: path.resolve(__dirname, "../src"),
				use: ["babel-loader"]
			},
			{ test: /\.vue$/, loader: "vue-loader" },
			{
				test: /\.(scss|css)?$/,
				use: [
					// "style-loader",
					{
						loader: MiniCssExtractPlugin.loader,
						options: { publicPath: "../../" }
					},
					{
						loader: "css-loader",
						options: {
							importLoaders: 2
						}
					},
					"postcss-loader",
					"sass-loader"
				]
			},
			{
				test: /\.(png|jpg|gif)$/,
				use: [
					{
						loader: "url-loader",
						options: {
							limit: 1024 * 7,
							name: "[name][hash:8].[ext]",
							outputPath: "assets/images"
						}
					}
				]
			}
		]
	},
	// step 告知webpack,引用模块时路径如何解析
	resolve: {
		alias: {
			src: path.resolve(__dirname, "../src"),
			components: path.resolve(__dirname, "../src/components"),
			api: path.resolve(__dirname, "../src/api"),
			utils: path.resolve(__dirname, "../src/utils"),
			store: path.resolve(__dirname, "../src/store"),
			router: path.resolve(__dirname, "../src/router"),
			assets: path.resolve(__dirname, "../src/assets"),
			styles: path.resolve(__dirname, "../src/styles")
		}
	},

	// step webpack 打包优化操作
	optimization: {
		// step 代码分块
		splitChunks: {
			chunks: "all",
			cacheGroups: {
				common: {
					name: "common",
					minSize: 0,
					minChunks: 2,
					priority: 0
				},
				vendor: {
					test: /node_modules/,
					name: "vendor",
					priority: 10
				}
			}
		},
		// step build文件不导出没有被引用的代码
		usedExports: true,
		// step 压缩build之后代码，并移除没有被引用的代码
		minimize: true // 压缩代码 移除没引用的代码
		// step 将引用的模块合并到一个模块中
		// concatenateModules: true // 将引用的模块融合到一个模块里免去
	},
	// watch: true,
	// watchOptions: {
	// 	ignored: "/node_modules/"
	// },
	devServer: {
		hot: true //启动模块热替换，不需要HotModuleReplacementPlugin
	},
	plugins: [
		new VueLoaderPlugin(),
		new webpack.ProgressPlugin(),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, "../public/index.html"),
			favicon: path.resolve(__dirname, "../public/favicon.ico"),
			title: "webpack4",
			chunks: ["main", "vendor", "common"]
		}),
		new Dotenv(),
		new CleanWebpackPlugin(),
		// new BundleAnalyzerPlugin(),
		new MiniCssExtractPlugin({
			filename: "assets/styles/[name][hash:8].css"
		})
	]
};

/**
 * https://webpack.wuhaolin.cn/4%E4%BC%98%E5%8C%96/4-8%E5%8E%8B%E7%BC%A9%E4%BB%A3%E7%A0%81.html
 * https://juejin.cn/post/7078889229970833422#heading-2
 */
// http://www.rmdown.com/link.php?hash=2319834b69a74b0cc66a2694e1bec8ebdbe66d8ec9f
