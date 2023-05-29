const state = {
	tasks: [
		{ text: "aaa", completed: false },
		{ text: "bbb", completed: false },
		{ text: "ccc", completed: true }
	],
	kinds: "all"
};
const mutations = {
	ADD_TASK: (state, task) => {
		state.tasks.push(task);
	},
	CHANGE_KINDS: (state, kinds) => {
		state.kinds = kinds;
	},
	EDIT_TASK: (state, { text, idx }) => {
		state.tasks[idx].text = text;
	},
	REMOVE_TODO: (state, idx) => {
		state.tasks.splice(idx, 1);
	},
	CLEAR_COMPLETED_TODO: state => {
		state.tasks = state.tasks.filter(task => !task.completed);
	}
};
const actions = {
	addTask({ commit, state }, text) {
		let has = state.tasks.filter(task => task.text === text).length;
		if (text === null || text.length === 0 || has) return Promise.reject();
		const task = { text, completed: false };
		commit("ADD_TASK", task);
		return Promise.resolve();
	},
	editTask({ commit }, payload) {
		let has = state.tasks.filter(task => task.text === payload.text).length;
		if (has) return Promise.reject();
		commit("EDIT_TASK", payload);
		return Promise.resolve();
	},
	removeTask({ commit }, idx) {
		commit("REMOVE_TODO", idx);
	},
	removeCompleted({ commit }) {
		commit("CLEAR_COMPLETED_TODO");
	},
	changeTaskKinds({ commit }, kinds) {
		commit("CHANGE_KINDS", kinds);
	}
};

export default {
	namespaced: true,
	state,
	mutations,
	actions
};
