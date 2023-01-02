import { config } from '../config/config';
import { StoreUtil } from '../util/StoreUtil';
import { FileUtil } from '../util/FileUtil';
import { HttpUtil } from '../util/HttpUtil';
import { CommonUtil } from '../util/CommonUtil';
import { userInfo } from 'os';
import i18n from '../locales/index';
import { ElMessage } from 'element-plus';
const sudo = require('sudo-prompt');
const uuid = require('uuid');

export class HostsUtil {
	static async syncSystemHosts() {
		const hasAccess = await FileUtil.checkAccess(FileUtil.getSystemHostsPath());
		// console.log(hasAccess);
		if (!hasAccess) {
			return this.syncSystemHostsNoAccess();
		} else {
			const promise = this.syncSystemHostsWithSudo();
			promise.catch((err) => {
				if (err.code === 'EPERM' || err.message.indexOf('operation not permitted') > -1) {
					ElMessage({
						message: i18n.global.t('system.form.result.noPermission'),
						type: 'error',
					});
				}
			});
		}
	}

	static async syncSystemHostsWithSudo() {
		const list = StoreUtil.listEnableHosts();
		const contentArr = [];
		for (const item of list) {
			const hostsContent = FileUtil.readHostsSync(item.id);
			contentArr.push(hostsContent);
		}
		const content = contentArr.join('\n\n');

		const systemHostsContent = FileUtil.readFileSync(FileUtil.getSystemHostsPath());
		if (CommonUtil.md5(content) != CommonUtil.md5(systemHostsContent)) {
			FileUtil.writeSystemHostsSync(content);
			const historyId = uuid.v4();
			FileUtil.writeFileSync(FileUtil.getHistoryHostsPath(historyId), content);

			const listOver = StoreUtil.operateHistoryList(historyId, systemHostsContent.split('\n').length, systemHostsContent.length);

			for (const item of listOver) {
				FileUtil.delHistoryHosts(item.id);
			}
		}
	}

	static async syncSystemHostsNoAccess() {
		if (process.platform === 'darwin' || process.platform === 'linux') {
			const options = {
				name: 'eHosts',
			};
			const command = '/bin/chmod +a "user:' + userInfo().username + ':allow write" ' + FileUtil.getSystemHostsPath();
			await sudo.exec(command, options, function (error, stdout, stderr) {
				if (error) {
					ElMessage({
						message: i18n.global.t('system.form.result.noPermissionCancel'),
						type: 'error',
					});
				}
				HostsUtil.syncSystemHostsWithSudo();
			});
		} else {
			ElMessage({
				message: i18n.global.t('system.form.result.noPermissionWin'),
				type: 'error',
			});
		}
	}

	static refreshNetWorkHosts(id: string, isSyncSystemHosts: boolean) {
		const data = StoreUtil.getHostsById(id);
		if (!data || data.type != config.dataTypeNetWork || data.cronKey === config.defaultCronKey) {
			return;
		}
		const netContent = HttpUtil.getSync(data.url);
		netContent.then((val) => {
			// console.log('refreshNetWorkHosts' + new Date());
			FileUtil.writeHostsSync(data.id, val);
			if (isSyncSystemHosts) {
				this.syncSystemHosts();
			}
			StoreUtil.updateRefreshHostsId(id);
		});
	}
}
