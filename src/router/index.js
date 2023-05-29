import Vue from "vue";
import Router from "vue-router";
import NProgress from "nprogress"; // progress bar
import Layout from "src/layout/index.vue";
import TasksPage from "src/views/tasks.vue";
import LoginPage from "src/views/login.vue";
import RegisterPage from "src/views/register.vue";
import { getToken } from "utils/auth";
import store from "store/index";
Vue.use(Router);
export const constantRoutes = [
	{
		path: "/",
		component: Layout,
		redirect: "/tasks",
		name: "Home",
		children: [
			{
				name: "tasks",
				path: "/tasks",
				component: TasksPage
			}
		]
	},
	{
		name: "login",
		path: "/login",
		component: LoginPage
	}
];
export const asyncRoutes = [
	{
		name: "register",
		path: "/register",
		component: RegisterPage
	}
];
const router = new Router({
	routes: constantRoutes,
	mode: "hash", // hash|history|abstract
	base: "/", // 应用基础路径
	linkActiveClass: "", // 模糊激活 class
	linkExactActiveClass: "" // 精确激活 class
});
NProgress.configure({ showSpinner: false }); // NProgress Configuration
const whiteList = ["/login"];
router.beforeEach(async (to, from, next) => {
	NProgress.start();
	if (getToken()) {
		if (to.path === "/login") {
			next({ path: "/" });
			NProgress.done();
		} else {
			let roles = store.getters["app/roles"];
			if (roles.length) {
				NProgress.done();
				next();
			} else {
				try {
					let { roles } = await store.dispatch("app/setInfo");

					store.dispatch("app/generateRoutes", roles).then(() => {
						store.getters["app/addRouters"].forEach(route => {
							router.addRoute("/", route);
						});
						next({ ...to, replace: true });
					});
				} catch (error) {
					store.dispatch("app/removeToken");
					next(`/login`);
					NProgress.done();
				}
			}
		}
	} else {
		if (whiteList.indexOf(to.path) !== -1) {
			NProgress.done();
			next();
		} else {
			// other pages that do not have permission to access are redirected to the login page.
			next(`/login?redirect=${to.path}`);
			NProgress.done();
		}
	}
});
router.afterEach(() => {
	NProgress.done();
});
export default router;
