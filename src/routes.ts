import { createWebHistory, createRouter } from 'vue-router'

import Home from './pages/Home.vue'
import Hiragana from './pages/Hiragana.vue'
import Katakana from './pages/Katakana.vue'

const routes = [
	{ path: '/', component: Home },
	{ path: '/hiragana', component: Hiragana },
	{ path: '/katakana', component: Katakana },
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
})
