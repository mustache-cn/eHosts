const crypto = require('crypto');

export class CommonUtil {
	//格式化文件大小
	static renderSize(value) {
		if (null == value || value == '') {
			return '0 Bytes';
		}
		const unitArr = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		let index = 0;
		const srcSize = parseFloat(value);
		index = Math.floor(Math.log(srcSize) / Math.log(1024));
		const size = srcSize / Math.pow(1024, index);
		return size.toFixed(2) + ' ' + unitArr[index];
	}

	static md5(value: string) {
		const _md5 = crypto.createHash('md5');
		return _md5.update(value).digest('hex');
	}

	/**
	 * 对日期进行格式化， 和C#大致一致 默认yyyy-MM-dd HH:mm:ss
	 * 可不带参数 一个日期参数 或一个格式化参数
	 * @param date 要格式化的日期
	 * @param format 进行格式化的模式字符串
	 *     支持的模式字母有：
	 *     y:年,
	 *     M:年中的月份(1-12),
	 *     d:月份中的天(1-31),
	 *     H:小时(0-23),
	 *     h:小时(0-11),
	 *     m:分(0-59),
	 *     s:秒(0-59),
	 *     f:毫秒(0-999),
	 *     q:季度(1-4)
	 * @return String
	 * @author adswads@gmail.com
	 */
	static dateFormat(date?: any, format?: string): string {
		//无参数
		if (date == undefined && format == undefined) {
			date = new Date();
			format = 'yyyy-MM-dd HH:mm:ss';
		}
		//无日期
		else if (typeof date == 'string') {
			format = date;
			date = new Date();
		}
		//无格式化参数
		else if (format === undefined) {
			format = 'yyyy-MM-dd HH:mm:ss';
		}
		//没有分隔符的特殊处理
		const map = {
			y: date.getFullYear() + '', //年份
			M: date.getMonth() + 1 + '', //月份
			d: date.getDate() + '', //日
			H: date.getHours(), //小时 24
			m: date.getMinutes() + '', //分
			s: date.getSeconds() + '', //秒
			q: Math.floor((date.getMonth() + 3) / 3) + '', //季度
			f: date.getMilliseconds() + '', //毫秒
		};
		//小时 12
		if (map['H'] > 12) {
			map['h'] = map['H'] - 12 + '';
		} else {
			map['h'] = map['H'] + '';
		}
		map['H'] += '';
		const reg = 'yMdHhmsqf';
		let all = '',
			str = '';
		for (let i = 0, n = 0; i < reg.length; i++) {
			n = format.indexOf(reg[i]);
			if (n < 0) {
				continue;
			}
			all = '';
			for (; n < format.length; n++) {
				if (format[n] != reg[i]) {
					break;
				}
				all += reg[i];
			}
			if (all.length > 0) {
				if (all.length == map[reg[i]].length) {
					str = map[reg[i]];
				} else if (all.length > map[reg[i]].length) {
					if (reg[i] == 'f') {
						str = map[reg[i]] + this.charString('0', all.length - map[reg[i]].length);
					} else {
						str = this.charString('0', all.length - map[reg[i]].length) + map[reg[i]];
					}
				} else {
					switch (reg[i]) {
						case 'y':
							str = map[reg[i]].substr(map[reg[i]].length - all.length);
							break;
						case 'f':
							str = map[reg[i]].substr(0, all.length);
							break;
						default:
							str = map[reg[i]];
							break;
					}
				}
				format = format.replace(all, str);
			}
		}
		return format;
	}
	/**
	 * 返回字符串 为n个char构成
	 * @param char 重复的字符
	 * @param count 次数
	 * @return String
	 * @author steven@mustache.com.cn
	 */
	static charString(char: string, count: number): string {
		let str = '';
		while (count--) {
			str += char;
		}
		return str;
	}

	static compareVersion(v1, v2) {
		if (v1 === v2) {
			return 0;
		}
		const arr1 = v1.split(/\D/);
		const arr2 = v2.split(/\D/);

		// 默认版本号长度一样
		for (let i = 0; i < arr1.length; ) {
			// 字符串相减将字符串隐式转成数字
			if (arr1[i] - arr2[i] > 0) {
				return 1;
			}
			if (arr1[i] - arr2[i] < 0) {
				return -1;
			}
			if (arr1[i] === arr2[i]) {
				i++;
			}
		}
	}
}
