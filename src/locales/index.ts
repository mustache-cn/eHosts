import { createI18n } from 'vue-i18n'; // import from runtime only
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useStore } from 'vuex';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import elementEnLocale from 'element-plus/lib/locale/lang/en';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import elementZhLocale from 'element-plus/lib/locale/lang/zh-cn';
// User defined lang
import enLocale from './lang/en';
import zhLocale from './lang/zh-cn';
const messages = {
	en: {
		...enLocale,
		...elementEnLocale,
	},
	'zh-cn': {
		...zhLocale,
		...elementZhLocale,
	},
};

export const getLocale = () => {
	const store = useStore();
	//读取cookie存入的当前语言
	const cookieLanguage = 'en';
	//如果有返回当前语言
	if (cookieLanguage) {
		return cookieLanguage;
	}
	//如果没有，获取系统语言
	const language = navigator.language.toLowerCase();
	//获取messages 语言 遍历
	const locales = Object.keys(messages);
	for (const locale of locales) {
		//如果messsage 包里面有系统语言返回
		if (language.indexOf(locale) > -1) {
			return locale;
		}
	}
	// 默认语言 简体中文
	return 'zh-cn';
};

const i18n = createI18n({
	globalInjection: true,
	legacy: false,
	locale: getLocale(),
	messages: messages,
});
export default i18n;
