import { userinfo } from "api/auth";
import { constantRoutes, asyncRoutes } from "src/router/index.js";
import { getToken, removeToken, setToken } from "utils/auth";
const state = {
	title: "webpack4!",
	sidebar: true,
	routes: [],
	addRouters: [],
	token: getToken(),
	name: "",
	avatar: "",
	introduction: "",
	roles: [],
	permissions: [],
	email: "",
	id: ""
};
const mutations = {
	TOGGLE_SIDEBAR: state => {
		state.sidebar = !state.sidebar;
	},
	SET_ROUTES: (state, routes) => {
		state.addRoutes = routes;
		constantRoutes[0].children.push(...routes);
		state.routes = constantRoutes;
	},
	SET_TOKEN: (state, token) => {
		state.token = token;
	},
	SET_ROLES: (state, roles) => {
		state.roles = roles;
	}
};
const actions = {
	toggleSideBar({ commit }) {
		commit("TOGGLE_SIDEBAR");
	},
	setRoutes({ commit }) {
		commit("SET_ROUTES");
	},
	setToken({ commit }, token) {
		setToken(token);
		commit("SET_TOKEN", token);
	},
	removeToken({ commit }) {
		removeToken();
		commit("SET_TOKEN", null);
	},
	setInfo({ commit }) {
		return new Promise((resolve, reject) => {
			userinfo()
				.then(res => {
					commit("SET_ROLES", res.data.roles);
					resolve(res.data.roles);
				})
				.catch(err => {
					reject(err);
				});
		});
	},
	generateRoutes({ commit }) {
		return new Promise(resolve => {
			commit("SET_ROUTES", asyncRoutes);
			resolve(asyncRoutes);
		});
	}
};
const getters = {
	newTitle: state => state.title,
	roles: state => state.roles,
	token: state => state.token,
	addRouters: state => state.addRouters,
	routes: state => state.routes
};
export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
};
