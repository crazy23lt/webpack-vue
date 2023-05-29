const fn = () => {
	const discription = "公共模块";
	return discription;
};
export default fn;
const fn1 = () => {
	const discription = "公共模块fn1";
	return discription;
};
export { fn1 };
