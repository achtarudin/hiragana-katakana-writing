import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		tailwindcss(),
		VitePWA({
			registerType: 'autoUpdate', // Otomatis update service worker jika ada versi baru
			includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'], // Sesuaikan dengan nama file icon kamu
			manifest: {
				name: 'Nihon Moji - Belajar Kana',
				short_name: 'Nihon Moji',
				description: 'Kuasai Huruf Jepang dengan Mudah via Kanvas Interaktif',
				theme_color: '#fbfbfb', // Sesuai dengan bg-neutral-50
				background_color: '#fbfbfb',
				display: 'standalone', // Membuatnya tampil full screen seperti app biasa
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable' // Penting untuk Android (icon bisa menyesuaikan bentuk)
					}
				]
			},
			workbox: {
				// Otomatis meng-cache file statis agar bisa dibuka offline
				globPatterns: ['**/*.{js,css,html,ico,png,svg}']
			}
		})

	],
})
