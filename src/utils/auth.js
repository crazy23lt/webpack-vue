const AuthKey = "AUTHKEY";
export function getToken() {
	return localStorage.getItem(AuthKey);
}
export function setToken(token) {
	return localStorage.setItem(AuthKey, token);
}
export function removeToken() {
	return localStorage.clear();
}
