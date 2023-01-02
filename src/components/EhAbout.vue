<template>
	<el-dialog v-model="dialogVisible" :show-close="false" class="eh-dialog-about">
		<el-form label-position="right" label-width="120px">
			<div>
				<div class="block">
					<el-avatar :size="80" :src="circleUrl" />
				</div>
			</div>
			<div class="eh-title">eHosts</div>
			<div class="eh-version">{{ config.version }}</div>
			<div class="eh-info">
				<el-link href="https://mustache.com.cn/eHosts" target="_blank" :underline="false" type="primary">{{ $t('menu.help.homepage') }}</el-link>
				<el-link href="https://github.com/mustache-cn/eHosts" target="_blank" :underline="false" type="primary">
					{{ $t('menu.help.sourceCode') }}
				</el-link>
			</div>
			<div class="eh-title">{{ $t('system.systemInfo') }}</div>
			<el-form-item class="eh-from-item" label="Electron:"> {{ VERSIONS.electron }} </el-form-item>
			<el-form-item class="eh-from-item" label="Chromium:"> {{ VERSIONS.chrome }} </el-form-item>
			<el-form-item class="eh-from-item" label="V8:"> {{ VERSIONS.v8 }} </el-form-item>
			<el-form-item class="eh-from-item" label="NodeJS:"> {{ VERSIONS.node }} </el-form-item>
			<el-form-item class="eh-from-item" label="OS:"> {{ type() }} {{ arch() }} {{ release() }}</el-form-item>
		</el-form>

		<template #footer>
			<span class="dialog-footer">
				<el-button @click="dialogVisible = false"> {{ $t('system.form.operate.close') }} </el-button>
			</span>
		</template>
	</el-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import logo from '/images/logo-256x1.png';
import { ipcRenderer } from 'electron';
import { menuConfig } from '../config/menuConfig';
import { release, type, arch, userInfo } from 'os';
import { config } from '../config/config';

let dialogVisible = ref(false);
const VERSIONS = process.versions;

const circleUrl = logo;

ipcRenderer.on(menuConfig.menuCommand, (event, arg) => {
	if (menuConfig.commandAbout === arg) {
		setDialogVisible(true);
	}
});

const setDialogVisible = (value: boolean) => {
	dialogVisible.value = value;
};
defineExpose({
	setDialogVisible,
});
</script>
<style lang="scss" scoped>
.eh-title {
	font-size: larger;
	font-weight: bolder;
	padding: 10px 0px 10px 0px;
}
.eh-version {
	color: #525457;
}
.eh-info {
	padding: 10px 0px 10px 0px;
}
.eh-info a {
	padding: 0px 10px 0px 10px;
}
.eh-from-item {
	padding: 0xp 0px 0px 20px;
	margin-bottom: 0px;
}
</style>
<style lang="scss">
.eh-dialog-about {
	border-radius: 8px;
	width: 400px;
}
.eh-dialog-about .ep-dialog__body {
	padding: 0px 10px 0px 10px;
}
</style>
