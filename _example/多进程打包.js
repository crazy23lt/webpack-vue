const TerserPlugin = require("terser-webpack-plugin");
/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				parallel: true
			})
		]
	}
};
