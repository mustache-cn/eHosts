const schedule = require('node-schedule');
import { StoreUtil } from './StoreUtil';
import { HostsUtil } from './HostsUtil';
import { ConfigUtil } from './ConfigUtil';
import { IData } from '../interface/dataInterface';
import { config } from '../config/config';

export class CronUtil {
	static initTask() {
		this.destroyTask();
		const jobList = StoreUtil.listEnableNetWorkHosts();
		// console.log('listEnableNetWorkHosts:', jobList);

		for (const item of jobList) {
			this.addJob(item);
		}
	}

	static addJob(item: IData) {
		const cron = ConfigUtil.getConfigByKey(item.cronKey);
		if (!cron || cron.cron === config.defaultCronValue) {
			return;
		}
		const job = schedule.scheduleJob(item.id, cron.cron, function () {
			// console.log(item.cronKey + ' . execute:' + item.id + '///' + new Date());
			HostsUtil.refreshNetWorkHosts(item.id, true);
		});
	}

	static destroyTask() {
		schedule.gracefulShutdown();
	}
}
