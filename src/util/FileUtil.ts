import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import { config } from '../config/config';
import { StoreUtil } from './StoreUtil';

export class FileUtil {
	static existsDir(dir: string) {
		return fs.existsSync(dir) && fs.lstatSync(dir).isDirectory();
	}

	static existsFile(dir: string) {
		return fs.existsSync(dir) && fs.lstatSync(dir).isFile();
	}

	static createDir(dir: string) {
		if (this.existsDir(dir)) {
			return true;
		}
		fs.mkdir(dir, function (error) {
			if (error) {
				// console.log(error);
				return false;
			}
			// console.log("创建目录成功");
			return true;
		});
	}

	static initData() {
		if (StoreUtil.getInit()) {
			return;
		}
		this.createDir(this.getHomeDir());
		this.createDir(this.getDataDir());
		this.createDir(path.join(this.getDataDir(), 'history'));
		this.writeHostsSync('develop', config.defaultHosts);
		this.writeHostsSync('test', config.defaultHosts);
		StoreUtil.updateInit(true);
	}

	static getHomeDir() {
		return path.join(homedir(), '.eHosts');
	}

	static getDataDir() {
		return path.join(homedir(), '.eHosts', 'data');
	}

	static getHostsPath(id: string) {
		return path.join(homedir(), '.eHosts', 'data', id + config.dataFileSuffix);
	}

	static getHistoryHostsPath(id: string) {
		return path.join(homedir(), '.eHosts', 'data', 'history', id + config.dataFileSuffix);
	}

	static getSystemHostsPath() {
		if (process.platform === 'darwin') {
			return config.hostsPathMacOS;
		} else if (process.platform === 'win32') {
			return config.hostsPathWin;
		} else {
			return config.hostsPathMacOS;
		}
	}

	static writeFile(fileName: string, content: string) {
		fs.writeFile(fileName, content, 'utf8', function (error) {
			if (error) {
				// console.log(error);
				return false;
			}
			return true;
		});
	}

	static writeFileSync(fileName: string, content: string) {
		fs.writeFileSync(fileName, content, 'utf8');
	}

	static writeHostsSync(id: string, content: string) {
		const hostFileName = this.getHostsPath(id);
		this.writeFileSync(hostFileName, content);
	}

	static writeSystemHostsSync(content: string) {
		const hostFileName = this.getSystemHostsPath();
		this.writeFileSync(hostFileName, content);
	}

	static readFileSync(fileName: string) {
		return fs.readFileSync(fileName, 'utf8');
	}

	static readHostsSync(id: string) {
		const hostFileName = this.getHostsPath(id);
		return this.readFileSync(hostFileName);
	}

	static readHistoryHostsSync(id: string) {
		const hostFileName = this.getHistoryHostsPath(id);
		return this.readFileSync(hostFileName);
	}

	static existsHostsFile(id: string) {
		const hostFileName = this.getHostsPath(id);
		return fs.existsSync(hostFileName) && fs.lstatSync(hostFileName).isFile();
	}

	static delFileSync(fileName: string) {
		fs.unlinkSync(fileName);
	}

	static delHistoryHosts(id: string) {
		this.delFileSync(this.getHistoryHostsPath(id));
	}

	static async checkAccess(fileName: string): Promise<boolean> {
		try {
			await fs.promises.access(fileName, fs.constants.W_OK);
			return true;
		} catch (e) {
			//console.error(e);
		}
		return false;
	}
}
