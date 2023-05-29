/**
 * 跨域中间件
 * @returns
 */
const cors = () => {
	return async function (ctx, next) {
		ctx.set({
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers": "Content-Type,Authorization",
			"Access-Control-Allow-Methods":
				"POST, GET, OPTIONS,HEAD,PUT,PATCH,DELETE",
			"Access-Control-Allow-Credebtials": false
		});
		await next();
	};
};
module.exports = cors;
