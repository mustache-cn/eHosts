import { config } from '../../config/config';

export default {
	system: {
		systemHosts: 'System Hosts',
		line: 'lines',
		readOnly: 'Read only',
		location: 'location',
		data: 'data',
		systemInfo: 'System info',
		checkUpdate: 'Check update',
		currentVersion: 'Version',
		latestVersion: 'Latest version',
		findLatestVersion: 'Latest version',
		clickDownload: 'click to download',
		shortcutMenu: {
			aboutTip: 'About eHosts',
			historyTip: 'Historical version of the system Hosts',
			settingTip: 'Preference setting',
			templateTip: 'Switch dark and light modes',
			newTip: 'Add a new hosts configuration',
			openTip: 'Open',
			exitTip: 'Exit',
		},
		dropdownMenu: {
			edit: 'Edit',
			delete: 'Delete',
			refresh: 'Refresh',
		},
		operationStatus: {
			success: 'Success',
			fail: 'Fail',
			error: 'Error',
		},
		hostsType: {
			folder: 'Folder',
			file: 'File',
			network: 'Remote Hosts',
			system: 'System Hosts',
		},
		form: {
			hostsTitle: 'Hosts Title',
			folderTitle: 'Folder Name',
			selectTitle: 'Please select',
			refreshTitle: 'Auto refresh',
			cronTitle: {
				never: 'Never',
				m1: '1 minute',
				m5: '5 minutes',
				m15: '15 minutes',
				m30: '30 minutes',
				h1: '1 hour',
				h24: '24 hours',
			},
			languageTitle: 'Language',
			historyLimitTitle: 'History limit',
			general: 'General',
			advanced: 'Advanced',
			preferencesTitle: 'Preferences',
			historyVersion: 'Historical version',
			button: {
				submit: 'Submit',
				cancel: 'Cancel',
			},
			validateTip: {
				hostsTitle: 'Cannot empty and between 2 and 10 words',
				urlTitle: 'URL is mandatory and begins with http or https',
				notEmpty: 'mandatory',
			},
			result: {
				success: 'Operation succeeded！',
				fail: 'Operation failed, please see details！',
				error: 'An error occurred. Please see details！ ',
				noPermissionWin: 'No permission, please start as administrator!',
				noPermissionCancel: 'You have not successfully entered the password, no permission, this operation cannot take effect!',
				noPermission: 'No operation permission, please follow the operation instructions!',
				cronNotExists: 'cron expression does not exist, please re-select!',
			},
			operate: {
				new: 'New',
				edit: 'Edit',
				close: 'Close',
			},
		},
	},
	menu: {
		eHosts: {
			about: 'About eHosts',
			hide: 'Hide',
			hideOthers: 'HideOthers',
			unhide: 'Unhide',
			quit: 'Quit',
		},
		file: {
			file: 'File',
			new: 'New',
			preferences: 'Preferences',
		},
		edit: {
			edit: 'Edit',
			undo: 'Undo',
			redo: 'Redo',
			cut: 'Cut',
			copy: 'Copy',
			paste: 'Paste',
			delete: 'Delete',
			selectAll: 'Select All',
		},
		view: {
			view: 'View',
			reload: 'Reload',
			forceReload: 'Force Reload',
			toggleDevTools: 'Toggle Developer Tools',
			resetZoom: 'Reset Zoom',
			zoomIn: 'Zoom In',
			zoomOut: 'Zoom Out',
			toggleFullScreen: 'Toggle Full Screen',
		},
		window: {
			window: 'Window',
			minimize: 'Minimize',
			zoom: 'Zoom',
			front: 'Bring All To Front',
			close: 'Close',
		},
		help: {
			help: 'Help',
			feedback: 'Feedback',
			homepage: 'Homepage',
			sourceCode: 'Source code',
		},
	},
};