import { IHistoryData } from 'src/interface/historyInterface';
import { config } from '../config/config';
import { IData } from '../interface/dataInterface';
import createStore from '../store/index';
import { ConfigUtil } from '../util/ConfigUtil';
import { HostsUtil } from './HostsUtil';
import i18n from '../locales/index';
import { FileUtil } from './FileUtil';
const uuid = require('uuid');

export class StoreUtil {
	static setDefaultCurrentHosts() {
		const item: IData = {
			id: config.systemHostsId,
			name: config.systemHostsName,
			version: Date.now(),
			type: config.dataTypeSystem,
			enable: true,
			url: '',
			cronKey: config.defaultCronKey,
		};
		createStore.commit('updateCurrentHosts', item);
	}

	static listEnableHosts() {
		return this.listHostsAll().filter((item) => {
			return item.enable;
		});
	}

	static listHostsAll() {
		const enableList: Array<IData> = [];
		this.listHostsRecursive(enableList, createStore.state.dataList);
		return enableList;
	}

	private static listHostsRecursive(enableList: Array<IData>, dataList: Array<IData>) {
		for (const item of dataList) {
			// console.log("itemFor:", item);
			if (item.type != config.dataTypeFolder) {
				if (item.id != config.systemHostsId) {
					enableList.push(item);
				}
			} else {
				if (item.children) {
					this.listHostsRecursive(enableList, item.children);
				}
			}
		}
		return enableList;
	}

	static listEnableNetWorkHosts() {
		const enableList: Array<IData> = this.listEnableHosts();
		return enableList.filter((item) => {
			return item.type === config.dataTypeNetWork && item.enable && item.cronKey != config.defaultCronKey;
		});
	}

	static getHostsById(id: string) {
		return this.listHostsAll().find((item) => {
			return item.id === id;
		});
	}

	static addData(id: string, type: string, cronKey: string, url: string, name: string) {
		const data: IData = {
			id: id && id.length > 0 ? id : uuid.v4(),
			name: name,
			version: Date.now(),
			type: type,
			enable: false,
			url: url ? url : '',
			cronKey: cronKey,
		};
		if (type === config.dataTypeNetWork) {
			const cron = ConfigUtil.getConfigByKey(cronKey);
			if (!cron) {
				return i18n.global.t('system.form.result.cronNotExists');
			}
			data.cronKey = cronKey;
		}

		// console.log("addData222", data);
		if (id && id.length > 0) {
			this.editData(data, false);
		} else {
			createStore.state.dataList.push(data);
		}
		createStore.commit('updateDataList', createStore.state.dataList);
		FileUtil.writeHostsSync(data.id, config.defaultHosts);
		HostsUtil.refreshNetWorkHosts(data.id, false);
		return 'ok';
	}

	static editData(data: IData, onlyState: boolean) {
		let flag = true;
		createStore.state.dataList.every((item, idx, array) => {
			if (item.id === data.id) {
				if (onlyState) {
					createStore.state.dataList[idx].enable = data.enable;
				} else {
					createStore.state.dataList[idx].name = data.name;
					createStore.state.dataList[idx].version = data.version;
					createStore.state.dataList[idx].url = data.url;
					createStore.state.dataList[idx].cronKey = data.cronKey;
				}
				createStore.commit('updateDataList', createStore.state.dataList);
				flag = false;
				return flag;
			}
			if (item.children) {
				item.children.every((itemChildren, idxChildren, arrayChildren) => {
					if (itemChildren.id == data.id) {
						if (onlyState) {
							createStore.state.dataList[idx].children[idxChildren].enable = data.enable;
						} else {
							createStore.state.dataList[idx].children[idxChildren].name = data.name;
							createStore.state.dataList[idx].children[idxChildren].version = data.version;
							createStore.state.dataList[idx].children[idxChildren].url = data.url;
							createStore.state.dataList[idx].children[idxChildren].cronKey = data.cronKey;
						}
						createStore.commit('updateDataList', createStore.state.dataList);
						flag = false;
						return flag;
					}
					return flag;
				});
			}
			return flag;
		});
	}

	static delData(data: IData) {
		let flag = true;
		createStore.state.dataList.every((item, idx, array) => {
			if (item.id === data.id) {
				createStore.state.dataList.splice(idx, 1);

				createStore.commit('updateDataList', createStore.state.dataList);
				flag = false;
				return flag;
			}
			if (item.children) {
				item.children.every((itemChildren, idxChildren, arrayChildren) => {
					if (itemChildren.id == data.id) {
						createStore.state.dataList[idx].children.splice(idxChildren, 1);

						createStore.commit('updateDataList', createStore.state.dataList);
						flag = false;
						return flag;
					}
					return flag;
				});
			}
			return flag;
		});
	}

	static updateRefreshHostsId(id: string) {
		const idStr = id + ':' + Date.now();
		createStore.commit('updateRefreshHostsId', idStr);
	}

	static getRefreshHostsId() {
		return createStore.state.refreshHostsId.split(':')[0];
	}

	static updateHistoryLimit(historyLimit: number) {
		createStore.commit('updateHistoryLimit', historyLimit);
	}

	static operateHistoryList(id: string, line: number, length: number) {
		const history: IHistoryData = {
			id: id,
			line: line,
			length: length,
			date: Date.now(),
		};
		createStore.state.historyList.unshift(history);
		let listOver = [];
		if (createStore.state.historyList.length > createStore.state.historyLimit) {
			listOver = createStore.state.historyList.filter((item, index) => {
				return index >= createStore.state.historyLimit;
			});
			// console.log("listOver", listOver);
			createStore.state.historyList.splice(createStore.state.historyLimit);
		}
		return listOver;
	}

	static updateSetting(historyLimit: number, language: string) {
		createStore.commit('updateHistoryLimit', historyLimit);
		createStore.commit('updateLanguage', language);
	}

	static updateInit(init: boolean) {
		createStore.commit('updateInit', init);
	}

	static getInit() {
		return createStore.state.init;
	}
}
