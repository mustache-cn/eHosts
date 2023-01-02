<template>
	<codemirror
		v-model="hostValue"
		:style="options.style"
		:mode="options.mode"
		:spellcheck="options.spellcheck"
		:autofocus="options.autofocus"
		:indent-with-tab="options.indentWithTab"
		:tab-size="options.tabSize"
		:extensions="options.extensions"
		:disabled="codemirrorDisabled"
		style="text-align: left; font-size: larger; height: 100%; padding-bottom: 58px; margin-bottom: 30px"
		@blur="useEditedCode"
		@change="formatHostsValue"
	/>
	<div
		class="radius"
		:style="{
			borderRadius: 'var(--el-border-radius-small)',
		}"
	>
		<el-affix position="bottom" style="height: 30px; width: 100%; background-color: aliceblue">
			<div class="footer-tooltips">
				<span>{{ hostsLineNum }} {{ $t('system.line') }}</span>
				<span>{{ hostsLength }}</span>
				<span v-if="hostsReadOrWrite">{{ hostsReadOrWrite }}</span>
				<span v-if="hostsType">{{ hostsType }}</span>
			</div>
		</el-affix>
	</div>
</template>
<script setup lang="ts">
import { onMounted, ref, reactive, toRefs, watch } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { r } from '@codemirror/legacy-modes/mode/r';
import { oneDark } from '@codemirror/theme-one-dark';
import { useDark } from '@vueuse/core';
import { useStore } from 'vuex';
import { FileUtil } from '../util/FileUtil';
import { config } from '../config/config';
import { StoreUtil } from '../util/StoreUtil';
import { HostsUtil } from '../util/HostsUtil';
import { CommonUtil } from '../util/CommonUtil';
import i18n from '../locales/index';

const store = useStore();

let hostsLength = ref('0');
let hostsLineNum = ref(0);
let hostsReadOrWrite = ref(i18n.global.t('system.readOnly'));
let codemirrorDisabled = ref(true);
let hostsType = ref(null);

let code = ref(``);
const options = reactive({
	style: { height: '400px' },
	mode: 'text/x-c++src',
	spellcheck: true,
	autofocus: true,
	indentWithTab: true,
	tabSize: 2,
	extensions: [StreamLanguage.define(r)],
});

toRefs(options);

let hostValue = ref(config.defaultHosts);

onMounted(() => {
	StoreUtil.setDefaultCurrentHosts();
	readHosts(true);
});

const readHosts = (isSystem: boolean) => {
	if (store.state.currentHosts.type === 'folder') {
		return;
	}

	codemirrorDisabled.value =
		store.state.currentHosts.id === config.systemHostsId || isSystem || store.state.currentHosts.type === config.dataTypeNetWork ? true : false;
	if (store.state.currentHosts.id === config.systemHostsId || isSystem) {
		hostValue.value = FileUtil.readFileSync(FileUtil.getSystemHostsPath());
	} else {
		if (FileUtil.existsHostsFile(store.state.currentHosts.id)) {
			hostValue.value = FileUtil.readHostsSync(store.state.currentHosts.id);
		} else {
			hostValue.value = config.defaultHosts;
		}
	}
	formatHostsValue();
};

const formatHostsValue = () => {
	hostsLineNum.value = hostValue.value.split('\n').length;
	hostsReadOrWrite.value = codemirrorDisabled.value ? i18n.global.t('system.readOnly') : null;
	hostsLength.value = CommonUtil.renderSize(hostValue.value.length);
	hostsType.value = i18n.global.t('system.hostsType.' + store.state.currentHosts.type);
	document.title = store.state.currentHosts.name;
};

// 方法
// 失去焦点时,使用已编辑的代码
function useEditedCode() {
	if (store.state.currentHosts.type != 'folder' && store.state.currentHosts.id != config.systemHostsId) {
		FileUtil.writeHostsSync(store.state.currentHosts.id, hostValue.value);
		if (store.state.currentHosts.enable) {
			HostsUtil.syncSystemHosts();
			// console.log('enable:true sync:' + store.state.currentHosts.id);
		}
	}
}

// 改变主题
function changeTheme(dark: boolean) {
	if (dark) {
		options.extensions = [StreamLanguage.define(r), oneDark];
	} else {
		options.extensions = [StreamLanguage.define(r)];
	}
}

useDark({
	onChanged(dark: boolean) {
		changeTheme(dark);
	},
});

const getValue = () => {
	return store.state.isDark;
};

watch(getValue, (newVal, oldVal) => {
	changeTheme(newVal);
});

const getCurrentHosts = () => {
	return store.state.currentHosts;
};

watch(getCurrentHosts, (newVal, oldVal) => {
	readHosts(false);
});

const getRefreshHostsId = () => {
	return store.state.refreshHostsId;
};

watch(getRefreshHostsId, (newVal, oldVal) => {
	if (StoreUtil.getRefreshHostsId() === store.state.currentHosts.id) {
		readHosts(false);
	}
});

const getLanguage = () => {
	return store.state.language;
};

watch(getLanguage, (newVal, oldVal) => {
	formatHostsValue();
});
</script>
<style lang="scss" scoped>
.radius {
	height: 4%;
	border: 1px solid var(--ep-border-color);
	border-radius: 0;
	text-align: left;
	font-size: small;
}

.footer-tooltips {
	padding: 6px 0px 0px 10px;
	height: 30px;
	width: 100%;
	background-color: #f5f5f5;
}
.footer-tooltips span {
	padding: 0px 20px 0px 10px;
	text-align: center;
	color: #6c6e72;
}

html.dark {
	.radius {
		height: 4%;
		border: 1px solid var(--ep-border-color);
		border-radius: 0;
		text-align: left;
		font-size: small;
		background-color: #282c34;
	}

	.footer-tooltips {
		background-color: #2b2b2c;
	}
	.footer-tooltips span {
		color: #6c6e72;
	}
}

:deep(.ͼq) {
	color: #cfd3dc;
}

:deep(.ͼu) {
	color: #66b1ff;
	font-weight: bolder;
}
</style>
