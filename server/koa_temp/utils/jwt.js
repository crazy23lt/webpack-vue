const jwt = require("jsonwebtoken");
const secret = "2394630102@qq.com";
function sign(data) {
	return jwt.sign(data, secret, { expiresIn: 60 * 60 });
}
function verify(token) {
	return jwt.verify(token, secret);
}
module.exports = { sign, verify };
