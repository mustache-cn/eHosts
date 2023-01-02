# eHosts

Homepage: [https://mustache.com.cn/eHosts](https://mustache.com.cn/eHosts)

An open source and easy to use multi-platform Hosts management and switching tools, it is based on [Electron](http://electron.atom.io/)
, [Vue3](https://cn.vuejs.org/), [Element Plus](https://github.com/element-plus/element-plus)
, [node-schedule](https://github.com/node-schedule/node-schedule), [CodeMirror](http://codemirror.net/), etc.

## Screenshot

<img src="https://raw.githubusercontent.com/mustache-cn/eHosts/master/docs/eHosts_light.png" alt="Capture" width="960">

## Features

- Switch hosts quickly
- Syntax highlight
- Remote hosts
- Switch from system tray

## Install

### Download

You can download the source code and build it yourself, or download the built version from following
links:

- [eHosts Download Page (GitHub release)](https://github.com/mustache-cn/eHosts/releases)

## Backup

eHosts stores data at `~/.eHosts` (Or folder `.eHosts` under the current user's home
path on Windows), the `~/.eHosts/data` folder contains data

## Develop and build

### Development

- Install [Node.js](https://nodejs.org/)
- Change to the folder `./`, run `npm install` to install dependented libraries
- Then run `npm run dev` to start the app for developing or debuging

### Build and package

- It is recommended to use [electron-builder](https://github.com/electron-userland/electron-builder)
  for packaging
- Go to the `./` folder
- Run `npm run build`, if everything goes well, the packaged files will be in the `./releases` folder.
- This command may take several minutes to finish when you run it the first time, as it needs time
  to download dependent files. You can download the dependencies
  manually [here](https://github.com/electron/electron/releases),
  or [Taobao mirror](https://npmmirror.com/mirrors/electron/), then save the files to `~/.electron`
  . You can check the [Electron Docs](http://electron.atom.io/docs/) for more infomation.

```bash
# build
npm run build-mac
npm run build-win
npm run build-linux

## Copyright

eHosts is a free and open source software, it is released under the [MIT](./LICENSE).
