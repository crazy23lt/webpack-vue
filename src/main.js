import Vue from "vue";
import "normalize.css/normalize.css"; //CSS重置的现代替代方案
import App from "src/App.vue";
import store from "store";
import router from "router";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import "src/directive/btn";
Vue.use(Antd);
new Vue({ store, router, render: h => h(App) }).$mount("#app");
if (module.hot) {
	module.hot.accept(["./store", "./router"], () => {
		new Vue({ store, router, render: h => h(App) }).$mount("#app");
	});
}
/**
 * https://panjiachen.github.io/vue-element-admin-site/zh/guide/#%E5%89%8D%E5%BA%8F%E5%87%86%E5%A4%87
 */
