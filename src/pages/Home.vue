<script lang="ts" setup>
import { onMounted } from 'vue'
import { useHead } from '@vueuse/head'

useHead({
	title: 'JP Kana Learn | Belajar Hiragana & Katakana',
	meta: [
		{
			name: 'description',
			content: 'Aplikasi interaktif untuk belajar dan berlatih menulis huruf Jepang (Hiragana dan Katakana) secara gratis.'
		},
		// Open Graph untuk Social Media Share (WhatsApp, FB, X)
		{ property: 'og:title', content: 'JP Kana Learn' },
		{ property: 'og:description', content: 'Belajar menulis huruf Jepang dengan mudah melalui kanvas interaktif.' },
		{ property: 'og:url', content: 'https://jp-kana-learn.vercel.com' },
		{ property: 'og:type', content: 'website' }
	]
})

onMounted(async () => {
	// Cek apakah browser sedang dalam mode layar penuh (fullscreen)
	if (document.fullscreenElement) {
		try {
			// Paksa keluar dari mode fullscreen
			await document.exitFullscreen()
		} catch (err) {
			console.warn("Gagal keluar dari mode fullscreen:", err)
		}
	}
})
</script>

<template>
	<div class="w-full h-screen bg-neutral-50 flex flex-col font-sans text-neutral-800 select-none overflow-hidden">

		<header
			class="bg-white border-b border-neutral-200 px-4 py-3 shadow-sm flex flex-row justify-between items-center gap-4 z-30 shrink-0">

			<div class="flex items-center gap-2.5">
				<div
					class="w-8 h-8 bg-neutral-900 text-white flex items-center justify-center rounded-lg shadow-sm font-bold text-lg leading-none">
					書
				</div>
				<h1 class="hidden sm:block font-bold text-sm tracking-widest uppercase text-neutral-900 mt-0.5">
					JP Kana Learn
				</h1>
			</div>

			<nav class="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200/60 shadow-inner">
				<RouterLink to="/"
					class="px-3 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
					:class="$route.path === '/' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'">
					Beranda
				</RouterLink>
				<RouterLink to="/hiragana"
					class="px-3 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
					:class="$route.path === '/hiragana' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'">
					Hiragana
				</RouterLink>
				<RouterLink to="/katakana"
					class="px-3 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
					:class="$route.path === '/katakana' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'">
					Katakana
				</RouterLink>
			</nav>

		</header>

		<div class="flex-1 w-full overflow-y-auto bg-neutral-50 flex items-center justify-center p-4 md:p-8">
			<div class="w-full max-w-3xl flex flex-col items-center text-center gap-8 py-6">

				<div class="flex flex-col items-center gap-3 max-w-lg">
					<div
						class="w-16 h-16 bg-neutral-900 text-white text-3xl flex items-center justify-center rounded-2xl shadow-md">
						書
					</div>
					<h2 class="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
						Kuasai Huruf Jepang dengan Mudah
					</h2>
					<p class="text-sm text-neutral-500 leading-relaxed">
						Pilih jenis huruf yang ingin kamu pelajari hari ini. Latih ingatanmu langsung dengan menulis
						guratan secara presisi di atas kanvas interaktif.
					</p>
				</div>

				<div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-2">

					<RouterLink to="/hiragana"
						class="group bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-neutral-400 transition-all duration-300 flex flex-col text-left relative overflow-hidden active:scale-[0.99]">
						<div
							class="absolute -right-4 -bottom-6 text-9xl font-bold text-neutral-100 group-hover:text-neutral-200/70 transition-colors pointer-events-none">
							あ
						</div>
						<div
							class="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-lg font-bold text-neutral-800 mb-4 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
							あ
						</div>
						<h3 class="text-lg font-bold text-neutral-900 mb-1 flex items-center gap-1.5">
							Belajar Hiragana
							<span class="inline-block transition-transform group-hover:translate-x-1">→</span>
						</h3>
					</RouterLink>

					<RouterLink to="/katakana"
						class="group bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-neutral-400 transition-all duration-300 flex flex-col text-left relative overflow-hidden active:scale-[0.99]">
						<div
							class="absolute -right-4 -bottom-6 text-9xl font-bold text-neutral-100 group-hover:text-neutral-200/70 transition-colors pointer-events-none">
							ア
						</div>
						<div
							class="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-lg font-bold text-neutral-800 mb-4 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
							ア
						</div>
						<h3 class="text-lg font-bold text-neutral-900 mb-1 flex items-center gap-1.5">
							Belajar Katakana
							<span class="inline-block transition-transform group-hover:translate-x-1">→</span>
						</h3>
					</RouterLink>

				</div>

				<div class="text-[10px] text-neutral-400 font-mono tracking-wider mt-4">
					PROGRES BELAJAR: PILIH MODUL UNTUK MEMULAI LATIHAN GURATAN
				</div>

			</div>
		</div>
	</div>
</template>
