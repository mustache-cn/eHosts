import path from 'path';
import { rmSync } from 'fs';
import { join } from 'path';
import { defineConfig, Plugin, UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import pkg from './package.json';
import eslintPlugin from 'vite-plugin-eslint';

import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

rmSync('dist', { recursive: true, force: true }); // v14.14.0

const pathSrc = path.resolve(__dirname, 'src');

import Unocss from 'unocss/vite';
import { presetAttributify, presetIcons, presetUno, transformerDirectives, transformerVariantGroup } from 'unocss';

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	resolve: {
		alias: {
			'~/': `${pathSrc}/`,
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: '@use "~/styles/element/index.scss" as *;',
			},
		},
	},
	plugins: [
		vue(),
		eslintPlugin({
			include: ['src/**/*.ts', 'src/**/*.vue', 'src/*.ts', 'src/*.vue'],
		}),
		Components({
			// allow auto load markdown components under `./src/components/`
			extensions: ['vue', 'md'],
			// allow auto import and register components used in markdown
			include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
			resolvers: [
				ElementPlusResolver({
					importStyle: 'sass',
				}),
			],
			dts: 'src/components.d.ts',
		}),
		electron({
			main: {
				entry: 'electron/main/index.ts',
				vite: withDebug({
					build: {
						outDir: 'dist/electron/main',
					},
				}),
			},
			preload: {
				input: {
					// You can configure multiple preload here
					index: join(__dirname, 'electron/preload/index.ts'),
				},
				vite: {
					build: {
						// For Debug
						sourcemap: 'inline',
						outDir: 'dist/electron/preload',
					},
				},
			},
			// Enables use of Node.js API in the Renderer-process
			renderer: {},
		}),

		// https://github.com/antfu/unocss
		// see unocss.config.ts for config
		Unocss({
			presets: [
				presetUno(),
				presetAttributify(),
				presetIcons({
					scale: 1.2,
					warn: true,
				}),
			],
			transformers: [transformerDirectives(), transformerVariantGroup()],
		}),
	],
	server: {
		host: pkg.env.VITE_DEV_SERVER_HOST,
		port: pkg.env.VITE_DEV_SERVER_PORT,
	},
});

function withDebug(config: UserConfig): UserConfig {
	if (process.env.VSCODE_DEBUG) {
		if (!config.build) config.build = {};
		config.build.sourcemap = true;
		config.plugins = (config.plugins || []).concat({
			name: 'eHosts-debug',
			configResolved(config) {
				const index = config.plugins.findIndex((p) => p.name === 'electron-main-watcher');
				// At present, Vite can only modify plugins in configResolved hook.
				(config.plugins as Plugin[]).splice(index, 1);
			},
		});
	}
	return config;
}
