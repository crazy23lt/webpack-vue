//step 回调任务栈
const callbacks = [];
//step 避免多次触发timerFunc
let pending = false;
//step JS EventLoop 微任务=>渲染=>宏任务
let timerFunc;
if (typeof Promise !== "undefined") {
	timerFunc = () => Promise.resolve().then(flushCallbacks);
} else if (typeof MutationObserver !== "undefined") {
	let counter = 1;
	const observer = new MutationObserver(flushCallbacks);
	const textNode = document.createTextNode(String(counter));
	observer.observe(textNode, {
		characterData: true
	});
	timerFunc = () => {
		counter = (counter + 1) % 2;
		textNode.data = String(counter);
	};
} else if (typeof setImmediate !== "undefined") {
	timerFunc = () => setImmediate(flushCallbacks);
} else {
	timerFunc = () => setTimeout(flushCallbacks, 0);
}
const flushCallbacks = () => {
	pending = false;
	const copies = callbacks.slice(0);
	callbacks.length = 0;
	for (let i = 0; i < copies.length; i++) {
		copies[i]();
	}
};
/**
 * @description 通过 js Event Loop 将函数放入 task queen,在主线程任务执行完成后，再将 task queen 中任务放入 主执行栈中执行
 * @param {function} cb task queen 回调任务
 * @param {vm} ctx vue 实例化对象
 */
export const nextTick = (cb, ctx) => {
	callbacks.push(() => cb.call(ctx));
	// 避免多次调用
	if (!pending) {
		pending = true;
		timerFunc();
	}
};
/**
+-------------------------+     +----------+     +---------------+
|      Vue.nextTick       | --> |          | --> |               |
+-------------------------+     | nextTick |     | push callback |
+-------------------------+     |          |     |               |
| Vue.prototype.$nextTick | --> |          |     |               |
+-------------------------+     +----------+     +---------------+
                                                   :
                                                   : run
                                                   :
                                                 +---------------+
                                                 |   timerFunc   |
                                                 +---------------+

 */
