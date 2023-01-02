import { ICron } from '../interface/cronInterface';

export const config = {
	host: 'https://mustache.com.cn/eHosts',
	version: '0.10.0',
	defaultHosts: '# example\n127.0.0.1	localhost',
	defaultHostsNetWork: '',
	systemHostsId: 'systemHosts',
	systemHostsName: 'systemHosts',
	dataFileSuffix: '.json',
	hostsPathMacOS: '/etc/hosts',
	hostsPathWin: 'C:\\Windows\\System32\\drivers\\etc\\hosts',
	dataTypeFolder: 'folder',
	dataTypeFile: 'file',
	dataTypeNetWork: 'network',
	dataTypeSystem: 'system',
	defaultCronValue: 'never',
	defaultCronKey: 'never',
	updateUrl: 'https://upgrade.mustache.com.cn/eHosts/upgrade.json',
	releaseUrl: 'https://github.com/mustache-cn/eHosts/releases',
	menu: {
		menuCommand: 'menuCommand',
		commandAbout: 'about',
		commandNew: 'new',
		commandSetting: 'setting',
	},
};

export const dataTypeDict = {
	folder: '文件夹',
	file: '本地文件',
	network: '远程Hosts',
	system: '系统Hosts',
};

export const cronDefaultData: Array<ICron> = [
	{
		key: config.defaultCronKey,
		name: '从不',
		cron: config.defaultCronValue,
	},
	{
		key: 'm1',
		name: '1分钟',
		cron: '10 */1 * * * *',
	},
	{
		key: 'm5',
		name: '5分钟',
		cron: '20 */5 * * * *',
	},
	{
		key: 'm15',
		name: '15分钟',
		cron: '30 */15 * * * *',
	},
	{
		key: 'm30',
		name: '30分钟',
		cron: '40 */30 * * * *',
	},
	{
		key: 'h1',
		name: '1小时',
		cron: '0 0 0/1 * * ?',
	},
	{
		key: 'h24',
		name: '24小时',
		cron: '0 0 10 * * ?',
	},
];
