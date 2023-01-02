import { app, BrowserWindow, shell, ipcMain, Menu, Tray, nativeImage, dialog } from 'electron';
import { release } from 'os';
import { join } from 'path';
import i18n from '../../src/locales';
import { menuConfig } from '../../src/config/menuConfig';
import { config } from '../../src/config/config';

const isMac = process.platform === 'darwin';

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
	app.quit();
	process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

export const ROOT_PATH = {
	// /dist
	dist: join(__dirname, '../..'),
	// /dist or /public
	public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
};

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin
const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`;
const indexHtml = join(ROOT_PATH.dist, 'index.html');

async function createWindow() {
	win = new BrowserWindow({
		title: 'Main window',
		width: 880,
		height: 660,
		minWidth: 800,
		minHeight: 600,
		titleBarStyle: 'hidden',
		titleBarOverlay: {
			color: '#303030',
			symbolColor: 'black',
		},
		// backgroundColor: '#303030',
		transparent: false,
		resizable: true,
		movable: true,
		show: false, // 先隐藏
		icon: join(ROOT_PATH.public, 'icon.ico'),
		webPreferences: {
			preload,
			// Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
			// Consider using contextBridge.exposeInMainWorld
			// Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
			nodeIntegration: true,
			contextIsolation: false,
			webSecurity: false,
		},
	});
	app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

	if (app.isPackaged) {
		win.loadFile(indexHtml);
	} else {
		win.loadURL(url);
		// Open devTool if the app is not packaged
		win.webContents.openDevTools();
	}

	// Test actively push message to the Electron-Renderer
	win.webContents.on('did-finish-load', () => {
		win?.webContents.send('main-process-message', new Date().toLocaleString());
	});

	// Make all links open with the browser, not with the application
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith('https:')) shell.openExternal(url);
		return { action: 'deny' };
	});

	win.on('ready-to-show', function () {
		win.show(); // 初始化后再显示
	});
}

app.whenReady().then(createWindow);

let tray = null;
app.whenReady().then(() => {
	const iconSrc = join(ROOT_PATH.public, isMac ? 'images/16@2x.png' : 'images/16x16.png');
	tray = new Tray(iconSrc);
	tray.setToolTip('eHosts');
});

const initContextMenu = (value) => {
	try {
		const dataList = JSON.parse(value);
		const menuContext = [];
		if (isMac) {
			for (const item of dataList) {
				const _isFolder = item.type === config.dataTypeFolder;
				menuContext.push({
					id: item.id,
					label: item.name,
					type: _isFolder ? 'normal' : 'checkbox',
					enabled: _isFolder ? false : true,
					checked: _isFolder ? false : item.enable,
					icon: nativeImage.createFromPath(convertContextMenuIcon(item.type)),
					click: (item) => {
						// console.log(item.id, item.enabled, item.checked);
						win.webContents.send('shortcut-select', item.id, item.checked, item.enabled);
					},
				});
				if (item.children) {
					for (const itemChildren of item.children) {
						menuContext.push({
							id: itemChildren.id,
							label: '    ' + itemChildren.name,
							type: 'checkbox',
							enabled: true,
							checked: itemChildren.enable,
							click: (item) => {
								// console.log(item.id, item.enabled, item.checked);
								win.webContents.send('shortcut-select', item.id, item.checked, item.enabled);
							},
						});
					}
				}
			}
			menuContext.push({ type: 'separator' });
		}
		menuContext.push({
			label: i18n.global.t('system.shortcutMenu.openTip') + ' eHosts',
			click: () => {
				if (win) {
					// Focus on the main window if the user tried to open another
					if (win.isMinimized()) win.restore();
					win.focus();
				} else {
					createWindow();
				}
			},
		});
		menuContext.push({
			label: i18n.global.t('system.shortcutMenu.exitTip'),
			click: () => {
				app.quit();
			},
		});
		const contextMenu = Menu.buildFromTemplate(menuContext);
		tray.setContextMenu(contextMenu);
	} catch (err) {
		dialog.showErrorBox('title', err.message);
	}
};

const convertContextMenuIcon = (value) => {
	if (value === config.dataTypeFolder) {
		return join(ROOT_PATH.public, 'images/folder.ico');
	}
	return '';
};

app.on('window-all-closed', () => {
	win = null;
	if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
	if (win) {
		// Focus on the main window if the user tried to open another
		if (win.isMinimized()) win.restore();
		win.focus();
	}
});

app.on('activate', () => {
	const allWindows = BrowserWindow.getAllWindows();
	if (allWindows.length) {
		allWindows[0].focus();
	} else {
		createWindow();
	}
});

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
	const childWindow = new BrowserWindow({
		webPreferences: {
			preload,
		},
	});

	if (app.isPackaged) {
		childWindow.loadFile(indexHtml, { hash: arg });
	} else {
		childWindow.loadURL(`${url}/#${arg}`);
		// childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
	}
});

ipcMain.on('second-instance', () => {
	if (win) {
		win.setSize(880, 660);
		win.focus();
	}
});

ipcMain.on('eh-reload', () => {
	if (win) {
		win.reload();
	}
});

const initTemplate = (arg) => {
	i18n.global.locale.value = arg;
	const template = [
		...(isMac
			? [
					{
						label: app.name,
						submenu: [
							{
								label: i18n.global.t('menu.eHosts.about'),
								click: () => {
									win.webContents.send(menuConfig.menuCommand, menuConfig.commandAbout);
								},
							},
							{
								label: i18n.global.t('menu.eHosts.hide'),
								role: 'hide',
							},
							{
								label: i18n.global.t('menu.eHosts.hideOthers'),
								role: 'hideOthers',
							},
							{
								label: i18n.global.t('menu.eHosts.unhide'),
								role: 'unhide',
							},
							{ type: 'separator' },
							{
								label: i18n.global.t('menu.eHosts.quit'),
								role: 'quit',
							},
						],
					},
			  ]
			: []),
		{
			label: i18n.global.t('menu.file.file'),
			// submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
			submenu: [
				{
					label: i18n.global.t('menu.file.new'),
					accelerator: 'CommandOrControl+n',
					click: () => {
						win.webContents.send(menuConfig.menuCommand, menuConfig.commandNew);
					},
				},
				{
					label: i18n.global.t('menu.file.preferences'),
					accelerator: 'CommandOrControl+,',
					click: () => {
						win.webContents.send(menuConfig.menuCommand, menuConfig.commandSetting);
					},
				},
			],
		},
		{
			label: i18n.global.t('menu.edit.edit'),
			submenu: [
				{
					label: i18n.global.t('menu.edit.undo'),
					role: 'undo',
				},
				{
					label: i18n.global.t('menu.edit.redo'),
					role: 'redo',
				},
				{ type: 'separator' },
				{
					label: i18n.global.t('menu.edit.cut'),
					role: 'cut',
				},
				{
					label: i18n.global.t('menu.edit.copy'),
					role: 'copy',
				},
				{
					label: i18n.global.t('menu.edit.paste'),
					role: 'paste',
				},
				...(isMac
					? [
							{
								label: i18n.global.t('menu.edit.delete'),
								role: 'delete',
							},
							{ type: 'separator' },
							{
								label: i18n.global.t('menu.edit.selectAll'),
								role: 'selectAll',
							},
					  ]
					: [
							{
								label: i18n.global.t('menu.edit.delete'),
								role: 'delete',
							},
							{ type: 'separator' },
							{
								label: i18n.global.t('menu.edit.selectAll'),
								role: 'selectAll',
							},
					  ]),
			],
		},
		{
			label: i18n.global.t('menu.view.view'),
			submenu: [
				{
					label: i18n.global.t('menu.view.reload'),
					role: 'reload',
				},
				{
					label: i18n.global.t('menu.view.forceReload'),
					role: 'forceReload',
				},
				{
					label: i18n.global.t('menu.view.toggleDevTools'),
					role: 'toggleDevTools',
				},
				{ type: 'separator' },
				{
					label: i18n.global.t('menu.view.resetZoom'),
					role: 'resetZoom',
				},
				{
					label: i18n.global.t('menu.view.zoomIn'),
					role: 'zoomIn',
				},
				{
					label: i18n.global.t('menu.view.zoomOut'),
					role: 'zoomOut',
				},
				{ type: 'separator' },
				{
					label: i18n.global.t('menu.view.toggleFullScreen'),
					role: 'togglefullscreen',
				},
			],
		},
		{
			label: i18n.global.t('menu.window.window'),
			submenu: [
				{
					label: i18n.global.t('menu.window.minimize'),
					role: 'minimize',
				},
				{
					label: i18n.global.t('menu.window.zoom'),
					role: 'zoom',
				},
				...(isMac
					? [
							{ type: 'separator' },
							{
								label: i18n.global.t('menu.window.front'),
								role: 'front',
							},
							{ type: 'separator' },
							{
								label: i18n.global.t('menu.window.window'),
								role: 'window',
							},
					  ]
					: [
							{
								label: i18n.global.t('menu.window.close'),
								role: 'close',
							},
					  ]),
			],
		},
		{
			label: i18n.global.t('menu.help.help'),
			role: 'help',
			submenu: [
				{
					label: i18n.global.t('menu.help.feedback'),
					click: async () => {
						await shell.openExternal('https://github.com/mustache-cn/eHosts/issues');
					},
				},
				{
					label: i18n.global.t('menu.help.homepage'),
					click: async () => {
						await shell.openExternal('https://mustache.com.cn/eHosts');
					},
				},
			],
		},
	];
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
};

ipcMain.on('language', (event, arg) => {
	i18n.global.locale.value = arg;
	initTemplate(arg);
});

ipcMain.on('data-list', (event, arg) => {
	initContextMenu(arg);
});

ipcMain.on('app.quit', (event, arg) => {
	app.quit();
});
