/**
 * step Install
 * yarn add rollup
 * step Command Line
 * For Browser
 * npx rollup ./main.js --file bundle.js --format iife
 * For Node
 * npx rollup ./main.js --file bundle.js --format cjs
 * For Browser And Node
 * npx rollup ./main.js --file bundle.js --format umd --name "myBundle"
 * step formats
 * format cjs/umd/amd/cmd/iife/system
 * step plugin
 * @rollup/plugin-node-resolve
 */

export default {
	input: "./libs/index.js",
	output: {
		file: "libs/test/vue.js",
		format: "es",
		name: "MyVue",
		sourcemap: true
	}
};
