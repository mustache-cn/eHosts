import { config, cronDefaultData } from '../config/config';

export class ConfigUtil {
	static getConfigByKey(key: string) {
		return cronDefaultData.find((item) => {
			return item.key === key;
		});
	}
}
