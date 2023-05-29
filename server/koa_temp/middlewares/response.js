/**
 * 响应及异常处理中间件
 */
/**@ 中间件异常捕获 */

const errorHandler = () => {
	return async function (ctx, next) {
		try {
			await next();
		} catch (error) {
			ctx.status = 500;
			ctx.body = {
				code: 1,
				message: error.message
			};
			ctx.app.emit("error", error, ctx);
		}
	};
};
module.exports = { errorHandler };
