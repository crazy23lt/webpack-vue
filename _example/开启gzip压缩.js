const CompressionPlugin = require("compression-webpack-plugin");
/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
	plugins: [CompressionPlugin()]
};
