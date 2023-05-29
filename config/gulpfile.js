const { series, src, dest } = require("gulp");
const path = require("path");
// 私有任务
const transpile = cb => {
	src(path.resolve(__dirname, "../src/main.js")).pipe(dest("../output/"));
	cb();
};
// 私有任务
const clean = cb => {
	console.dir("clean");
	cb();
};

exports.default = series(transpile, clean);
