<template>
	<el-config-provider namespace="ep" :locale="messages[locale]">
		<div class="common-layout">
			<el-container>
				<el-header @dblclick="dblclick">{{ title }}</el-header>
				<el-container>
					<el-aside width="200px"><BaseSide /></el-aside>
					<el-main><router-view></router-view></el-main>
				</el-container>
			</el-container>
		</div>
	</el-config-provider>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useStore } from 'vuex';
import { ipcRenderer } from 'electron';
import { useI18n } from 'vue-i18n';
import { config } from './config/config';
import i18n from './locales/index';

const { locale, messages } = useI18n();
const store = useStore();
let title = ref('');

locale.value = store.state.language;
ipcRenderer.send('language', store.state.language);

ipcRenderer.send('data-list', JSON.stringify(store.state.dataList));

const getLanguage = () => {
	return store.state.language;
};

watch(getLanguage, (newVal, oldVal) => {
	locale.value = store.state.language;
	ipcRenderer.send('language', store.state.language);
});

const dblclick = () => {
	ipcRenderer.send('second-instance', store.state.language);
};

const getCurrentHosts = () => {
	return store.state.currentHosts;
};

watch(getCurrentHosts, (newVal, oldVal) => {
	if (store.state.currentHosts.name === config.systemHostsName) {
		title.value = i18n.global.t('system.systemHosts');
	} else {
		title.value = store.state.currentHosts.name;
	}
});
</script>

<style>
#app {
	text-align: center;
	color: var(--ep-text-color-primary);
}
html,
body,
#app {
	height: 100%;
}
html,
body {
	overflow: hidden;
	height: 100%;
}
.ep-container,
.ep-aside {
	height: 100%;
}

.common-layout {
	height: 100%;
}

.ep-header {
	--ep-header-padding: 0px;
	background-color: #303030;
	height: 30px;
	border-bottom: 20px #e5eaf3;
	text-align: center;
	padding-top: 6px;
	color: #8d9095;
	-webkit-app-region: drag;
}
.ep-main {
	--ep-main-padding: 0px 0px 2px 0px;
	overflow: hidden;
}
.ep-container {
	height: 100%;
}

.ep-footer {
	--ep-footer-padding: 0px;
	--ep-footer-height: 36px;
}
</style>
