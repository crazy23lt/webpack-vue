import request from "utils/request";
export const login = data =>
	request({
		url: "/auth/login",
		method: "post",
		data: data
	});
export const userinfo = () =>
	request({
		url: "/auth/userinfo",
		method: "get"
	});
