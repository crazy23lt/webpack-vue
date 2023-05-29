const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 抽离 css
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin"); // 压缩 css
/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
	module: {
		rules: [
			{
				test: /\.(css)?$/,
				use: [{ loader: MiniCssExtractPlugin.loader }, "css-loader"]
			}
		]
	},
	optimization: {
		minimize: true, //启用 minimize 功能
		minimizer: [new CssMinimizerPlugin()] // 配置 minimize 功能
	},
	plugins: [new MiniCssExtractPlugin()]
};
