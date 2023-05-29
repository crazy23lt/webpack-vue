import { nextTick } from "libs/tools/next-tick";
const queue = [];
let has = {};
let flushing = false;
let waiting = false;
export function queueWatcher(watcher) {
	const id = watcher.id;
	if (has[id] == null) {
		has[id] = true;
		if (!flushing) {
			queue.push(watcher);
		}
		if (!waiting) {
			waiting = true;
			nextTick(flushSchedulerQueue);
		}
	}
}
function flushSchedulerQueue() {
	const updatedQueue = queue.slice();
	updatedQueue.forEach(watcher => {
		has[watcher.id] = null;
		watcher.run();
	});
	waiting = flushing = false;
}
