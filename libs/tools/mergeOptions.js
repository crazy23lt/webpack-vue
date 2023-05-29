import config from "../config.js";

const LIFECYCLE_HOOKS = [
	"beforeCreate",
	"created",
	"beforeMount",
	"mounted",
	"beforeUpdate",
	"updated",
	"beforeDestroy",
	"destroyed",
	"activated",
	"deactivated",
	"errorCaptured",
	"serverPrefetch"
];
const defaultStrat = (parentVal, childVal) =>
	childVal === undefined ? parentVal : childVal;
/**
 * @description options 合并策略
 * @property options.data 合并策略
 * @property options.computed 合并策略
 */
const strats = config.optionMergeStrategies;
strats.data = function (parentVal, childVal, vm) {
	return function () {
		const instanceData =
			typeof childVal === "function" ? childVal.call(vm, vm) : childVal;
		return instanceData;
	};
};
strats.computed = function (parentval, childVal) {
	if (!parentval) return childVal;
};

LIFECYCLE_HOOKS.forEach(hook => {
	strats[hook] = mergeHook;
});
//step 合并 baseLifeCycleHooks + lifeCycleHooks
function mergeHook(baseVal, val) {
	let res;
	if (val) {
		if (baseVal) {
			console.dir(baseVal);
			res = baseVal.concat(val);
		} else {
			if (Array.isArray(val)) res = val;
			else res = [val];
		}
	} else {
		res = baseVal;
	}
	return res;
}
/**
 * @description 合并 options
 * @param {object} baseOptions	vue.options 属性
 * @param {object} options			new Vue(options) 属性
 * @param {Vue} vm 							Vue实例对象
 * @returns {object} 合并完成之后的 options
 */
export const mergeOptions = (baseOptions, options, vm) => {
	const _options = {};
	for (const key in baseOptions) {
		mergeField(key);
	}
	for (const key in options) {
		if (!Object.prototype.hasOwnProperty.call(baseOptions, key))
			mergeField(key);
	}
	function mergeField(key) {
		const strat = strats[key] || defaultStrat;
		_options[key] = strat(baseOptions[key], options[key], vm);
	}
	return _options;
};
