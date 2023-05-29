let oldArrayProtoMethods = Array.prototype;
/**@description 创建一个原型是Array.prototype的对象,会对原型方法进行一些重写（AOP）*/
export let arrayMethods = Object.create(oldArrayProtoMethods);
/**@description arrayMethods 空对象需要重写的方法 */
let mrthods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
mrthods.forEach(methods => {
	arrayMethods[methods] = function (...args) {
		const result = oldArrayProtoMethods[methods].apply(this, args);
		let inserted;
		switch (methods) {
			case "push":
			case "unshift":
				inserted = args;
				break;
			case "splice":
				inserted = args.slice(2);
				break;
			default:
				break;
		}
		//step 对于数组新插入的对象，需要进行劫持操作
		if (inserted) this.__ob__.observeArray(inserted);
		this.__ob__.dep.notify();
		return result;
	};
});
