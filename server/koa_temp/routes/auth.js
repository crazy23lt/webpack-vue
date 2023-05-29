const { sign, authorize } = require("../middlewares/jwt");
module.exports = router => {
	router.use(["/userinfo"], authorize());
	router.post("/login", ctx => {
		ctx.body = { msg: "登陆成功", token: sign(ctx.request.body) };
	});
	router.get("/userinfo", ctx => {
		ctx.body = {
			msg: "用户信息",
			roles: ["admin"]
		};
	});
};
