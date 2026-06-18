import Home from '../pages/Home.vue'

// Ekspor array routes ini secara terpisah
export const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/hiragana',
        name: 'Hiragana',
        component: () => import('../pages/Hiragana.vue')
    },
    {
        path: '/katakana',
        name: 'Katakana',
        component: () => import('../pages/Katakana.vue')
    }
]

