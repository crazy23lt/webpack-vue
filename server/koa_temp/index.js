const Koa = require("koa");
const logger = require("koa-logger");
const assets = require("koa-static");
const { default: koaBody } = require("koa-body");
const compose = require("koa-compose");
const cors = require("./middlewares/cors");
const router = require("./routes");
const { errorHandler } = require("./middlewares/response");
const app = new Koa();
app.use(
	koaBody({
		multipart: true
	})
);
app.use(assets(__dirname + "/static"));
app.use(compose([errorHandler(), cors(), logger()]));
app.use(router());
app.on("error", error => {
	console.log(error);
});
app.listen(3000, () => {
	console.dir("服务端启动成功");
});
