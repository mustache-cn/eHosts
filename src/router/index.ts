import { createRouter, createWebHashHistory } from 'vue-router';
import Host from '../views/Hosts.vue';
const routes = [
	{
		path: '/',
		component: Host,
		name: 'home',
	},
];

const router = createRouter({
	history: createWebHashHistory(), //哈希值模式
	routes,
});

export default router;
