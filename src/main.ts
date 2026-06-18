// src/main.ts
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'

import './assets/tailwind.css'

// Export const createApp menggunakan ViteSSG
export const createApp = ViteSSG(
    // 1. Root Component
    App,

    // 2. Opsi Router
    {
        routes,
        base: import.meta.env.BASE_URL
    },

    // 3. Fungsi Setup untuk Plugins (seperti Pinia, Google Analytics, dll)
    (instance) => {
		console.log('ViteSSG instance:', instance)
    }
)
