<template>
	<el-row class="eh-row-buttons" style="font-size: larger; font-size: 0.6cm; padding-left: 60px"> eHosts </el-row>
	<el-divider style="margin: 10px 0px 0px 0px" />
	<el-row class="eh-row-buttons">
		<el-tooltip class="box-item" :content="$t('system.shortcutMenu.aboutTip')" placement="bottom">
			<el-button type="primary" :icon="Avatar" size="small" circle @click="aboutDialogVisible()" />
		</el-tooltip>
		<el-tooltip class="box-item" :content="$t('system.shortcutMenu.settingTip')" placement="bottom">
			<el-button type="primary" :icon="Operation" size="small" circle @click="settingDrawerVisible()" />
		</el-tooltip>
		<el-tooltip class="box-item" :content="$t('system.shortcutMenu.templateTip')" placement="bottom">
			<el-button type="primary" size="small" circle @click="toggleDarkAction()">
				<el-icon v-if="store.state.isDark"><Sunny></Sunny></el-icon>
				<el-icon v-else><Moon></Moon></el-icon>
			</el-button>
		</el-tooltip>
		<el-tooltip class="box-item" :content="$t('system.shortcutMenu.newTip')" placement="bottom-end">
			<el-button type="primary" :icon="CirclePlus" size="small" circle @click="addDrawerVisible(null)" />
		</el-tooltip>
		<el-tooltip class="box-item" :content="$t('system.shortcutMenu.historyTip')" placement="bottom-end">
			<el-button type="primary" :icon="Camera" size="small" circle @click="historyDrawerVisible" />
		</el-tooltip>
	</el-row>
	<div class="custom-tree-container" style="width：280px;">
		<p style="text-align: left" @click="handleSystemClick">
			<el-icon style="float: left; padding-left: 10px; padding-right: 10px">
				<monitor />
			</el-icon>
			{{ $t('system.systemHosts') }}
		</p>
		<el-tree
			:data="dataList"
			node-key="id"
			default-expand-all
			:expand-on-click-node="true"
			draggable
			:allow-drop="allowDrop"
			:allow-drag="allowDrag"
			@node-click="handleNodeClick"
		>
			<template #default="{ data }">
				<span class="custom-tree-node">
					<el-icon>
						<folder v-if="data.type === 'folder'" />
						<document v-if="data.type === 'file'" />
						<eleme v-if="data.type === 'network'" />
					</el-icon>
					<span style="width: 100%; float: left; text-align: left">
						<el-dropdown trigger="contextmenu" @visible-change="handleChange(value)">
							{{ data.name }}
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item :icon="Edit" @click="addDrawerVisible(data)"> {{ $t('system.dropdownMenu.edit') }} </el-dropdown-item>
									<el-dropdown-item :icon="Delete" @click="delData(data)"> {{ $t('system.dropdownMenu.delete') }} </el-dropdown-item>
									<el-dropdown-item v-if="data.type === config.dataTypeNetWork" :icon="Refresh" @click="refreshData(data)">
										{{ $t('system.dropdownMenu.refresh') }}
									</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</span>
					<div v-if="data.type != 'folder'" style="float: right">
						<el-switch v-model="data.enable" size="small" @change="changeSwitch(data)" />
					</div>
				</span>
			</template>
		</el-tree>
		<span id="cc"></span>
	</div>
	<eh-about ref="aboutFun" />
	<eh-setting ref="settingFun" />
	<eh-add ref="addFun" />
	<eh-history ref="historyFun" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {
	Document,
	Folder,
	Plus,
	Monitor,
	Edit,
	Avatar,
	Sunny,
	Moon,
	Eleme,
	CirclePlus,
	Camera,
	Operation,
	Delete,
	Refresh,
} from '@element-plus/icons-vue';
import { useStore } from 'vuex';
import { useDark, useToggle } from '@vueuse/core';
import { ElMessage } from 'element-plus';
import { ipcRenderer } from 'electron';
import { IData } from 'src/interface/dataInterface';
import { config } from '../../config/config';
import { StoreUtil } from '../../util/StoreUtil';
import { HostsUtil } from '../../util/HostsUtil';
import { CronUtil } from '../../util/CronUtil';
import i18n from '../../locales/index';

const store = useStore();
const value = ref(true);
const dialogVisible = ref(false);
let dataList = store.state.dataList;

const changeSwitch = (value) => {
	// console.log("changeSwitch", value.level);
	value.version = Date.now();
	store.commit('updateDataList', store.state.dataList);
	HostsUtil.syncSystemHosts();
	if (value.type === config.dataTypeNetWork) {
		CronUtil.initTask();
	}
};

const handleChange = (visible: boolean) => {
	if (!visible) return;
	//Simulate mouse click event to close other right clicks
	document.getElementById('cc').click();
};

ipcRenderer.on('shortcut-select', (event, id, enable, isNoFolder) => {
	const data: IData = {
		id: id,
		name: '',
		version: 0,
		type: '',
		enable: enable,
		url: '',
		cronKey: config.defaultCronKey,
	};
	StoreUtil.editData(data, true);
	dataList = store.state.dataList;
	HostsUtil.syncSystemHosts();
	if (!isNoFolder) {
		CronUtil.initTask();
	}
});

let isDark = useDark();
isDark.value = store.state.isDark;
const toggleDark = useToggle(isDark);

const toggleDarkAction = () => {
	toggleDark();
	// console.log('DarkValue:' + isDark.value);
	store.commit('updateIsDark', isDark.value);
};

const confirmAbout = (params: boolean) => {
	dialogVisible.value = params;
};

const aboutFun = ref();
const aboutDialogVisible = () => {
	aboutFun.value.setDialogVisible(true);
};

const settingFun = ref();
const settingDrawerVisible = () => {
	settingFun.value.setDrawerVisible(true);
};

const addFun = ref();
const addDrawerVisible = (data: IData) => {
	addFun.value.setDrawerVisible(true, data);
};

const historyFun = ref();
const historyDrawerVisible = () => {
	historyFun.value.setDrawerVisible(true);
};

const handleNodeClick = (item, data) => {
	if (item.type != 'folder') {
		store.commit('updateCurrentHosts', item);
	}
};

const handleSystemClick = () => {
	StoreUtil.setDefaultCurrentHosts();
};

const delData = (value) => {
	StoreUtil.delData(value);
	ElMessage.success(i18n.global.t('system.operationStatus.success') + '！');
};

const refreshData = (value) => {
	HostsUtil.refreshNetWorkHosts(value.id, value.enable);
	ElMessage.success(i18n.global.t('system.dropdownMenu.refresh') + i18n.global.t('system.operationStatus.success') + '！');
};

const allowDrop = (draggingNode, dropNode, type) => {
	if (draggingNode.data.type === config.dataTypeNetWork && dropNode.data.type === config.dataFileSuffix && type === 'inner') {
		return false;
	}

	if (dropNode.data.type === config.dataTypeFile && type === 'inner') {
		return false;
	}

	if (dropNode.data.type === config.dataTypeNetWork && type === 'inner') {
		return false;
	}

	return true;
};

const allowDrag = (draggingNode) => {
	return true;
};
</script>
<style>
.custom-tree-node {
	flex: 1;
	display: flex;
	align-items: center;
	/*justify-content: space-between;*/
	font-size: 14px;
	padding-right: 8px;
	widows: 100%;
	/* min-width: 175px; */
}

.ep-tree-node__label {
	width: 100%;
}

.eh-row-buttons {
	padding: 10px 0px 0px 16px;
}

.custom-tree-container {
	cursor: pointer;
}
</style>
