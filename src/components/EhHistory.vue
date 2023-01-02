<template>
	<el-drawer v-model="drawerVisible" direction="rtl" :show-close="false" style="min-width: 600px">
		<template #title>
			<h4 class="eh-drawer-header">
				<el-icon :size="18" style="vertical-align: text-bottom">
					<Camera />
				</el-icon>
				{{ $t('system.systemHosts') }} {{ $t('system.form.historyVersion') }}
			</h4>
		</template>
		<template #default>
			<div style="height: 100%">
				<el-row :gutter="10" style="height: 100%">
					<el-col :span="18" style="height: 100%; overflow: scroll">
						<codemirror
							v-model="hostValue"
							:style="options.style"
							:mode="options.mode"
							:spellcheck="options.spellcheck"
							:autofocus="options.autofocus"
							:indent-with-tab="options.indentWithTab"
							:tab-size="options.tabSize"
							:extensions="options.extensions"
							:disabled="true"
							style="text-align: left; font-size: larger; height: 100%; background-color: #f5f5f5"
						/>
					</el-col>
					<el-col :span="6" class="grid-content ep-bg-purple-light" style="height: 100%; overflow: scroll">
						<el-timeline>
							<el-timeline-item
								v-for="item in store.state.historyList"
								:key="item.id"
								:label="item.date"
								:value="item.date"
								:timestamp="dateFormat(item.date)"
								placement="top"
								style="cursor: pointer"
								@click="readHosts(item.id)"
							>
								<el-card>
									<p style="font-size: 11px">{{ item.line }}{{ $t('system.line') }} {{ CommonUtil.renderSize(item.length) }}</p>
								</el-card>
							</el-timeline-item>
						</el-timeline>
					</el-col>
				</el-row>
			</div>
		</template>
		<template #footer>
			<div style="flex: auto">
				<el-button @click="cancelClick"> {{ $t('system.form.button.submit') }} </el-button>
			</div>
		</template>
	</el-drawer>
</template>
<script lang="ts" setup>
import { ref, reactive, toRefs, watch } from 'vue';
import { Camera } from '@element-plus/icons-vue';
import { Codemirror } from 'vue-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { r } from '@codemirror/legacy-modes/mode/r';
import { oneDark } from '@codemirror/theme-one-dark';
import { config, dataTypeDict } from '../config/config';
import { useDark, useToggle } from '@vueuse/core';
import { useStore } from 'vuex';
import { FileUtil } from '../util/FileUtil';
import { CommonUtil } from '../util/CommonUtil';

const store = useStore();
let hostValue = ref(config.defaultHosts);
const options = reactive({
	style: { height: '400px' },
	mode: 'text/x-c++src',
	spellcheck: true,
	autofocus: true,
	indentWithTab: true,
	tabSize: 2,
	extensions: [StreamLanguage.define(r)], //传递给CodeMirror EditorState。创建({扩展})
});

toRefs(options);

const drawerVisible = ref(false);
const radio1 = ref('Option 1');

const cancelClick = () => {
	drawerVisible.value = false;
};

const readHosts = (id: string) => {
	if (id && id.length > 0) {
		hostValue.value = FileUtil.readHistoryHostsSync(id);
	}
};

readHosts(store.state.historyList.length > 0 ? store.state.historyList[0].id : '');

// 改变主题
function changeTheme(dark: boolean) {
	if (dark) {
		options.extensions = [StreamLanguage.define(r), oneDark];
	} else {
		options.extensions = [StreamLanguage.define(r)];
	}
}

const dateFormat = (value: number) => {
	return CommonUtil.dateFormat(new Date(value), 'yyyy-MM-dd HH:mm:ss');
};

const getValue = () => {
	return store.state.isDark;
};

watch(getValue, (newVal, oldVal) => {
	// console.log("watch监听isDark的变化 newVal ------>", newVal);
	// console.log("watch监听isDark的变化 oldVal ------>", oldVal);
	changeTheme(newVal);
});

useDark({
	onChanged(dark: boolean) {
		// update the dom, call the API or something
		// console.log("emit:Dark" + dark);
		changeTheme(dark);
	},
});

const setDrawerVisible = (value: boolean) => {
	drawerVisible.value = value;
};
defineExpose({
	setDrawerVisible,
});
</script>
<style lang="scss" scoped>
.eh-drawer-header {
	margin: 0px;
	padding: 0px;
	text-align: left;
}

.el-col {
	border-radius: 4px;
}

:deep(.ͼq) {
	color: #cfd3dc;
}

:deep(.ͼu) {
	color: #66b1ff;
	font-weight: bolder;
}

.grid-content {
	border-radius: 4px;
	min-height: 36px;
	background-color: #f5f5f5;
}

html.dark {
	.grid-content {
		border-radius: 4px;
		min-height: 36px;
		background-color: #282c34;
	}
}

html,
body {
	overflow: hidden;
	height: 100%;
}
:v-deep(.ep-drawer__body) {
	overflow: hidden;
}

.ep-timeline {
	padding: 10px 0px 20px 10px;
}
:v-deep(.ep-card__body) {
	padding: 0px;
}
</style>
