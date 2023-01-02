<template>
	<el-drawer v-model="drawerVisible" direction="rtl" :show-close="false" style="min-width: 500px">
		<template #title>
			<h4 class="eh-drawer-header">
				<el-icon :size="18" style="vertical-align: text-bottom">
					<Operation />
				</el-icon>
				{{ $t('system.form.preferencesTitle') }}
			</h4>
		</template>
		<template #default>
			<div style="padding-top: 0px">
				<el-tabs v-model="activeType" class="demo-tabs">
					<el-tab-pane :label="$t('system.form.general')" name="General">
						<el-form ref="ruleFormRef" label-position="right" label-width="120px" :model="formData" :rules="rules" style="max-width: 460px">
							<div style="margin: 20px" />
							<el-form-item :label="$t('system.form.languageTitle')" prop="language" class="eh-from-item">
								<el-select v-model="formData.language" :placeholder="$t('system.form.selectTitle')">
									<el-option key="zh-cn" label="简体中文" value="zh-cn" />
									<el-option key="en" label="English" value="en" />
								</el-select>
							</el-form-item>
							<el-form-item class="eh-from-item" :label="$t('system.form.historyLimitTitle')" prop="historyLimit">
								<el-input-number v-model="formData.historyLimit" :step="1" />
							</el-form-item>
						</el-form>
					</el-tab-pane>
					<el-tab-pane :label="$t('system.form.advanced')" name="Advanced">
						<table class="demo-typo-size">
							<tbody>
								<tr>
									<td>{{ $t('system.systemHosts') }} {{ $t('system.location') }}:</td>
									<td style="padding: 10px 0px 10px 20px; text-align: left">
										{{ FileUtil.getSystemHostsPath() }}
									</td>
								</tr>
								<tr>
									<td>eHosts {{ $t('system.data') }} {{ $t('system.location') }}：</td>
									<td style="padding: 10px 0px 10px 20px; text-align: left">
										{{ FileUtil.getHomeDir() }}
									</td>
								</tr>
								<tr>
									<td style="text-align: right">{{ $t('system.currentVersion') }}：</td>
									<td style="padding: 10px 0px 10px 20px; text-align: left">
										{{ config.version }} <span v-if="loading" v-loading="loading" style="margin: 0px 30px 0px 0px"></span>
										<el-link v-if="versionTip > 0" type="info" :href="config.releaseUrl" target="_blank">
											{{ $t('system.findLatestVersion') }}: {{ newVersion }} {{ $t('system.clickDownload') }}
										</el-link>
										<el-link v-if="versionTip === 0" type="info" disabled>{{ $t('system.latestVersion') }}</el-link>
										<el-link type="primary" style="margin-left: 8px" @click="getVersion">{{ $t('system.checkUpdate') }}</el-link>
									</td>
								</tr>
							</tbody>
						</table>
					</el-tab-pane>
				</el-tabs>
			</div>
		</template>
		<template #footer>
			<div style="flex: auto">
				<el-button @click="cancelClick"> {{ $t('system.form.button.cancel') }} </el-button>
				<el-button type="primary" @click="submitForm(ruleFormRef)"> {{ $t('system.form.button.submit') }} </el-button>
			</div>
		</template>
	</el-drawer>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useStore } from 'vuex';
import { TabsPaneContext, FormRules, FormInstance, ElMessage } from 'element-plus';
import { Operation } from '@element-plus/icons-vue';
import { FileUtil } from '../util/FileUtil';
import { StoreUtil } from '../util/StoreUtil';
import { HttpUtil } from '../util/HttpUtil';
import { config } from '../config/config';
import { ipcRenderer } from 'electron';
import { menuConfig } from '../config/menuConfig';
import { CommonUtil } from '../util/CommonUtil';
import i18n from '../locales/index';
import { IVersion } from '../interface/upgradeInterface';

const store = useStore();
const drawerVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const activeType = ref('General');
const VERSION = config.version;
let loading = ref(false);
let versionTip = ref(null);
let newVersion = ref('');

const cancelClick = () => {
	drawerVisible.value = false;
};
const submitForm = async (formEl: FormInstance | undefined) => {
	if (activeType.value === 'Advanced') {
		drawerVisible.value = false;
		return;
	}
	if (!formEl) return;
	await formEl.validate((valid, fields) => {
		if (valid) {
			StoreUtil.updateSetting(formData.historyLimit, formData.language);

			drawerVisible.value = false;
			ElMessage.success(i18n.global.t('system.form.result.success'));
		} else {
			ElMessage.error(i18n.global.t('system.form.result.error'));
		}
	});
};

const formData = reactive({
	language: store.state.language,
	historyLimit: store.state.historyLimit,
});

const rules = reactive<FormRules>({
	historyLimit: [
		{
			required: true,
			message: i18n.global.t('system.form.historyLimitTitle') + ' ' + i18n.global.t('system.form.validateTip.notEmpty'),
			trigger: 'blur',
		},
	],
	language: [
		{
			required: true,
			message: i18n.global.t('system.form.languageTitle') + ' ' + i18n.global.t('system.form.validateTip.notEmpty'),
			trigger: 'blur',
		},
	],
});

ipcRenderer.on(menuConfig.menuCommand, (event, arg) => {
	if (menuConfig.commandSetting === arg) {
		setDrawerVisible(true);
	}
});

const getVersion = () => {
	versionTip.value = null;
	loading.value = true;
	try {
		const content = HttpUtil.getSync(config.updateUrl + '?t=' + Date.now());
		content.then((val) => {
			let upgrade: IVersion = typeof val == 'string' ? JSON.parse(val) : val;
			const compareResult = CommonUtil.compareVersion(upgrade.version, config.version);
			versionTip.value = compareResult;
			loading.value = compareResult >= 0 ? false : true;
			newVersion.value = upgrade.version;
		});
	} catch (err) {
		loading.value = false;
	}
};
getVersion();

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

.demo-tabs > .el-tabs__content {
	padding: 0px 32px 32px 32px;
	color: #6b778c;
	font-size: 32px;
	font-weight: 600;
}

:deep(.ep-drawer__header) {
	margin-bottom: 0px;
}
.eh-from-item {
	margin: 10px 20px 20px 0px;
}

:deep(.circular) {
	width: 18px;
	margin-left: 10px;
}
</style>
