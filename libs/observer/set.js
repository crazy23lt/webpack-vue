/**
 * @description 向响应式对象中添加一个 property，并确保这个新 property 同样是响应式的，且触发视图更新。
 * @param {object|array} target `修改` 或 `添加` 属性数据的`对象`
 * @param {string|number} propertyName `修改` 或 `添加` 属性的`名称`
 * @param {any} value `修改` 或 `添加` 属性的`值`
 * @example
 * this.arr[0] = 111; //通过数组下标修改响应式数据无法触发 defineReactive 的劫持
 * this.$set(this.arr,0,111); //通过$set进行响应式数据修改
 * this.obj['b'] = 12; //往对象内新增属性，无法触发劫持
 * this.$set(this.obj,'b',12);
 */
const set = function (target, propertyName, value) {
	const isArray = Array.isArray(target);
	if (isArray) {
		// 数组类型数据处理
		target.length = Math.max(target.length, propertyName);
		target.splice(propertyName, 1, value);
		return value;
	} else {
		//对象数据类型处理
	}
};

export default set;
