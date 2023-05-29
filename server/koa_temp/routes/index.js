const Router = require("@koa/router");
const compose = require("koa-compose");
const routerConfigs = [{ folder: "auth", prefix: "/auth" } /* 业务相关路由 */];
module.exports = () => {
	const composed = routerConfigs.reduce((prev, curr) => {
		const Routes = require(`./${curr.folder}.js`);
		const router = new Router({
			prefix: curr.prefix
		});
		Routes(router);
		return [router.routes(), router.allowedMethods(), ...prev];
	}, []);
	return compose(composed);
};
