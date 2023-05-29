import store from "store/index";

const { default: axios } = require("axios");
const service = axios.create({
	baseURL: process.env.BASE_API,
	timeout: 5000
});
service.interceptors.request.use(
	config => {
		let token = store.getters["app/token"];
		if (token) config.headers["authorization"] = token;
		return config;
	},
	error => {
		return Promise.reject(error);
	}
);
service.interceptors.response.use(
	response => response,
	error => {
		let code = error.response.data.code;
		let status = error.response.status;
		console.dir(code);
		console.dir(status);
		return Promise.reject(error);
	}
);
export default service;
