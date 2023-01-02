import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './locales/index';
import { FileUtil } from './util/FileUtil';
import { CronUtil } from './util/CronUtil';

import '~/styles/index.scss';
import 'uno.css';
import 'element-plus/dist/index.css';

import 'element-plus/theme-chalk/src/message.scss';

import 'element-plus/es/components/message-box/style/index';
import 'element-plus/es/components/message/style/index';

FileUtil.initData();
CronUtil.initTask();
const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.use(store);
app.use(i18n);

app.mount('#app').$nextTick(() => {
	postMessage({ payload: 'removeLoading' }, '*');
});
