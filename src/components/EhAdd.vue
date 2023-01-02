<!-- eslint-disable no-useless-escape -->
<!-- eslint-disable no-useless-escape -->
<!-- eslint-disable no-useless-escape -->
<template>
	<el-drawer v-model="drawerVisible" direction="rtl" :show-close="false" style="min-width: 500px">
		<template #title>
			<h4 class="eh-drawer-header">
				<el-icon :size="18" style="vertical-align: text-bottom">
					<Edit />
				</el-icon>
				{{ $t('system.form.operate.new') }}/{{ $t('system.form.operate.edit') }}
			</h4>
		</template>
		<template #default>
			<div>
				<el-form ref="ruleFormRef" :label-position="right" label-width="105px" :model="formLabelAlign" :rules="rules" style="max-width: 460px">
					<el-form-item class="eh-from-item">
						<el-radio-group v-model="formLabelAlign.type" label="label position" :disabled="typeDisabled">
							<el-radio :label="config.dataTypeFile">
								<el-icon style="padding-right: 0px; vertical-align: text-bottom" :size="18">
									<Document />
								</el-icon>
								{{ $t('system.hostsType.file') }}
							</el-radio>
							<el-radio :label="config.dataTypeNetWork">
								<el-icon style="padding-right: 0px; vertical-align: text-bottom" :size="18">
									<Eleme />
								</el-icon>
								{{ $t('system.hostsType.network') }}
							</el-radio>
							<el-radio :label="config.dataTypeFolder">
								<el-icon style="padding-right: 0px; vertical-align: text-bottom" :size="18">
									<Folder />
								</el-icon>
								{{ $t('system.hostsType.folder') }}
							</el-radio>
						</el-radio-group>
					</el-form-item>
					<div style="margin: 20px" />
					<el-form-item class="eh-from-item" :label="getNameLabel()" prop="name">
						<el-input v-model="formLabelAlign.name" />
					</el-form-item>
					<el-form-item v-if="formLabelAlign.type === config.dataTypeNetWork" class="eh-from-item" label="URL" prop="url">
						<el-input v-model="formLabelAlign.url" />
					</el-form-item>
					<el-form-item
						v-if="formLabelAlign.type === config.dataTypeNetWork"
						:label="$t('system.form.refreshTitle')"
						prop="cronKey"
						class="eh-from-item"
					>
						<el-select v-model="formLabelAlign.cronKey" placeholder="{{$t('system.form.selectTitle')}}">
							<el-option v-for="item in cronDefaultData" :key="item.key" :label="$t('system.form.cronTitle.' + item.key)" :value="item.key" />
						</el-select>
					</el-form-item>
				</el-form>
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
import { ElMessage, FormRules, FormInstance } from 'element-plus';
import { Edit, Document, Eleme, Folder } from '@element-plus/icons-vue';
import { right } from '@popperjs/core';
import { config, cronDefaultData } from '../config/config';
import { StoreUtil } from '../util/StoreUtil';
import { IData } from '../interface/dataInterface';
import { ipcRenderer } from 'electron';
import { menuConfig } from '../config/menuConfig';
import i18n from '../locales/index';

const drawerVisible = ref(false);
let data = ref(null);
const ruleFormRef = ref<FormInstance>();
let typeDisabled = ref(false);

const cancelClick = () => {
	drawerVisible.value = false;
};

const submitForm = async (formEl: FormInstance | undefined) => {
	if (!formEl) return;
	await formEl.validate((valid, fields) => {
		if (valid) {
			const result = StoreUtil.addData(formLabelAlign.id, formLabelAlign.type, formLabelAlign.cronKey, formLabelAlign.url, formLabelAlign.name);
			if (result != 'ok') {
				ElMessage.error('Error:' + result);
			} else {
				drawerVisible.value = false;
				ElMessage.success(i18n.global.t('system.form.result.success'));
			}
		} else {
			ElMessage.error(i18n.global.t('system.form.result.error'));
		}
	});
};

const formLabelAlign = reactive({
	id: '',
	name: '',
	type: config.dataTypeFile,
	cronKey: config.defaultCronKey,
	url: '',
});

const getNameLabel = () => {
	if (formLabelAlign.type === config.dataTypeFolder) {
		return i18n.global.t('system.form.folderTitle');
	}
	return i18n.global.t('system.form.hostsTitle');
};

const isUrl = (url: string) => {
	// eslint-disable-next-line no-useless-escape
	var reg = /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/;
	// console.log('isUrl', url, reg.test(url));
	return reg.test(url);
};

const validateUrl = (rule, value, callback) => {
	if (formLabelAlign.type == config.dataTypeNetWork) {
		isUrl(formLabelAlign.url);
		if (!formLabelAlign.url || formLabelAlign.url.length === 0 || !isUrl(formLabelAlign.url)) {
			callback(new Error(i18n.global.t('system.form.validateTip.urlTitle')));
		}
	}
	callback();
};

const validateName = (rule, value, callback) => {
	if (!formLabelAlign.name || formLabelAlign.name.length < 2 || formLabelAlign.name.length > 10) {
		callback(new Error(getNameLabel() + ' ' + i18n.global.t('system.form.validateTip.hostsTitle')));
	}
	callback();
};

const rules = reactive<FormRules>({
	name: [{ required: true, validator: validateName, trigger: 'blur' }],
	url: [{ required: true, validator: validateUrl, trigger: 'blur' }],
	cronKey: [
		{
			required: true,
			message: i18n.global.t('system.form.cronTitle') + ' ' + i18n.global.t('system.form.validateTip.notEmpty'),
			trigger: 'blur',
		},
	],
});

ipcRenderer.on(menuConfig.menuCommand, (event, arg) => {
	if (menuConfig.commandNew === arg) {
		setDrawerVisible(true, null);
	}
});

const setDrawerVisible = (value: boolean, data: IData) => {
	drawerVisible.value = value;
	// console.log('setDrawerVisible', data);
	if (data) {
		formLabelAlign.id = data.id;
		formLabelAlign.cronKey = data.cronKey;
		formLabelAlign.name = data.name;
		formLabelAlign.type = data.type;
		formLabelAlign.url = data.url;
		typeDisabled.value = true;
	} else {
		formLabelAlign.id = '';
		formLabelAlign.cronKey = config.defaultCronKey;
		formLabelAlign.name = '';
		formLabelAlign.type = config.dataTypeFile;
		formLabelAlign.url = '';
	}
};
defineExpose({
	setDrawerVisible,
});
</script>

<style scoped>
.eh-drawer-header {
	margin: 0px;
	text-align: left;
}
.eh-from-item {
	margin: 20px 0px 10px 0px;
}
.ep-radio {
	margin-right: 18px;
}
</style>
