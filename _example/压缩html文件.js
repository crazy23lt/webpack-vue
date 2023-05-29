const HtmlWebpackPlugin = require("html-webpack-plugin");
/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
	plugins: [
		new HtmlWebpackPlugin({
			/*省略其他配置...*/
			minify: true
		})
	]
};
