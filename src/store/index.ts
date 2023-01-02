import { createStore } from 'vuex';
import persist from 'vuex-persistedstate';
import { IData } from '../interface/dataInterface';
import { config } from '../config/config';

const dataList: Array<IData> = [
	{
		id: 'develop',
		name: '开发',
		version: 0,
		type: 'file',
		enable: false,
		url: '',
		cronKey: config.defaultCronKey,
	},
	{
		id: 'test',
		name: '测试',
		version: 0,
		type: 'file',
		enable: false,
		url: '',
		cronKey: config.defaultCronKey,
	},
];

export default createStore({
	state: {
		isDark: true,
		historyLimit: 50,
		dataList: dataList,
		currentHosts: {},
		refreshHostsId: ':',
		historyList: [],
		language: 'zh-cn',
		init: false,
	},
	mutations: {
		updateIsDark(state, isDark) {
			state.isDark = isDark;
		},
		updateHistoryLimit(state, historyLimit) {
			state.historyLimit = historyLimit;
		},
		updateDataList(state, dataList) {
			state.dataList = dataList;
		},
		updateCurrentHosts(state, currentHosts) {
			state.currentHosts = currentHosts;
		},
		updateRefreshHostsId(state, refreshHostsId) {
			state.refreshHostsId = refreshHostsId;
		},
		updateLanguage(state, language) {
			state.language = language;
		},
		updateInit(state, init) {
			state.init = init;
		},
	},
	actions: {
		updateIsDark({ commit }, isDark) {
			commit('updateIsDark', isDark);
		},
		updateHistoryLimit({ commit }, historyLimit) {
			commit('updateHistoryLimit', historyLimit);
		},
	},
	modules: {},
	getters: {
		getCount(state) {
			return state;
		},
	},
	plugins: [
		persist({
			storage: window.localStorage,
		}),
	],
});
