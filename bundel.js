"use strict";

class MyPromise {
	constructor(executor) {
		this.value = undefined;
		this.state = "pending";
		this.callbacks = [];
		try {
			executor(this.resolve.bind(this), this.reject.bind(this));
		} catch (e) {
			console.dir(e);
			this.reject(e);
		}
	}
	resolve(data) {
		if (this.state !== "pending") return;
		this.state = "fulfilled";
		this.value = data;
		this.runCallback();
	}
	reject(reason) {
		if (this.state !== "pending") return;
		this.state = "rejected";
		this.value = reason;
		this.runCallback();
	}
	then(onFulfilled, onRejected) {
		return new MyPromise((resolve, reject) => {
			this.callbacks.push({
				executor: onFulfilled,
				state: "fulfilled",
				resolve,
				reject
			});
			this.callbacks.push({
				executor: onRejected,
				state: "rejected",
				resolve,
				reject
			});
			this.runCallback();
		});
	}
	catch(onRejected) {
		return this.then(null, onRejected);
	}
	finally(onSettled) {
		return this.then(
			data => {
				onSettled();
				return data;
			},
			reason => {
				onSettled();
				throw reason;
			}
		);
	}
	runCallback() {
		if (this.state === "pending") return;
		while (this.callbacks.length) this.run(this.callbacks.shift());
	}
	run({ executor, state, resolve, reject }) {
		runMicroTask(() => {
			if (this.state !== state) return;
			if (typeof executor !== "function") {
				this.state === "fulfilled" ? resolve(this.value) : reject(this.value);
				return;
			}
			try {
				const res = executor(this.value);
				if (isPromise(res)) {
					res.then(resolve, reject);
				} else {
					resolve(res);
				}
			} catch (e) {
				reject(e);
			}
		});
	}
}
MyPromise.all = function (proms) {
	return new MyPromise((resolve, reject) => {
		try {
			let result = [];
			let count = 0;
			let fulfilledCount = 0;
			for (const p of proms) {
				let i = count++;
				MyPromise.resolve(p).then(data => {
					fulfilledCount++;
					result[i] = data;
					if (fulfilledCount === count) {
						resolve(result);
					}
				}, reject);
			}
			if (count === 0) {
				resolve(result);
			}
		} catch (e) {
			reject(e);
		}
	});
};
MyPromise.resolve = function (data) {
	if (data instanceof MyPromise) return data;
	return new MyPromise((resolve, reject) => {
		if (isPromise(data)) {
			data.then(resolve, reject);
		} else {
			resolve(data);
		}
	});
};
MyPromise.reject = function (reason) {
	return new MyPromise((resolve, reject) => {
		reject(reason);
	});
};
function runMicroTask(callback) {
	if (globalThis.process && globalThis.process.nextTick) {
		process.nextTick(callback);
	} else if (globalThis.MutationObserver) {
		const p = document.createElement("p");
		const observer = new MutationObserver(callback);
		observer.observe(p, {
			childList: true
		});
		p.innerHTML = "1";
	} else {
		setTimeout(callback, 0);
	}
}
function isPromise(obj) {
	return !!(obj && typeof obj === "object" && typeof obj.then === "function");
}

exports.MyPromise = MyPromise;
