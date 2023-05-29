const jwt = require("jsonwebtoken");
const secret = "2394630102@qq.com";
const sign = data => jwt.sign(data, secret, { expiresIn: 60 * 60 });
const authorize = () => async (ctx, next) => {
	try {
		let token = ctx.request.headers["authorization"];
		let ret = jwt.verify(token, secret);
		ctx.request.userinfo = ret;
		await next();
	} catch (error) {
		ctx.status = 401;
		ctx.body = {
			msg: error,
			code: -1
		};
	}
};
module.exports = { sign, authorize };
