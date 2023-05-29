import Vue from "vue";
import Vuex from "vuex";
import getters from "./getters";
Vue.use(Vuex);
const modulesFiles = require.context("./modules", true, /\.js$/);

// you do not need `import app from './modules/app'`
// it will auto require all vuex module from modules file
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
	// set './app.js' => 'app'
	const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, "$1");
	const value = modulesFiles(modulePath);
	modules[moduleName] = value.default;
	return modules;
}, {});

const store = new Vuex.Store({
	state: { local: "vuex 顶层m odule" }, //统一管理公共数据
	mutations: {
		CHANGE_LOCAL: state => {
			console.log("CHANGE_LOCAL mutations:>> ", state);
		}
	}, //对 state 内的数据进行修改
	actions: {
		change_local: () => {
			console.log("change_local actions:>> ");
		}
	}, //通知 mutation，可进行异步操作
	modules, // 模块拆分
	getters // state 计算属性
});
export default store;
