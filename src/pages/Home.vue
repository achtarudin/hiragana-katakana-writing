<script lang="ts" setup>
import { onMounted } from 'vue'

onMounted(async () => {
	// 1. Ambil state dark mode dari storage agar UI tidak berkedip / salah tema
	// saat user me-refresh langsung di halaman Beranda ini
	const savedTheme = localStorage.getItem('app-theme')
	if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
		document.documentElement.classList.add('dark')
	} else {
		document.documentElement.classList.remove('dark')
	}

	// 2. Cek apakah browser sedang dalam mode layar penuh (fullscreen)
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
	<div
		class="w-full h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col font-sans text-neutral-800 dark:text-neutral-100 select-none overflow-hidden transition-colors duration-300">

		<header
			class="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 shadow-sm flex flex-row justify-between items-center gap-4 z-30 shrink-0 transition-colors duration-300">

			<div class="flex items-center gap-2.5">
				<div
					class="w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center rounded-lg shadow-sm font-bold text-lg leading-none transition-colors">
					書
				</div>
				<h1
					class="hidden sm:block font-bold text-sm tracking-widest uppercase text-neutral-900 dark:text-white mt-0.5">
					Nihon Moji
				</h1>
			</div>

			<nav
				class="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200/60 dark:border-neutral-700 shadow-inner transition-colors">
				<RouterLink to="/"
					class="px-3 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
					:class="$route.path === '/' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'">
					Beranda
				</RouterLink>
				<RouterLink to="/hiragana"
					class="px-3 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
					:class="$route.path === '/hiragana' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'">
					Hiragana
				</RouterLink>
				<RouterLink to="/katakana"
					class="px-3 sm:px-4 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
					:class="$route.path === '/katakana' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'">
					Katakana
				</RouterLink>
			</nav>

		</header>

		<div
			class="flex-1 w-full overflow-y-auto bg-neutral-50 dark:bg-neutral-950 flex flex-col px-4 py-6 md:p-8 transition-colors duration-300">

			<div class="w-full max-w-4xl mx-auto my-auto flex flex-col items-center text-center gap-8 py-2 md:py-6">

				<div class="flex flex-col items-center gap-3 max-w-lg">
					<div
						class="w-16 h-16 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-3xl flex items-center justify-center rounded-2xl shadow-md transition-colors">
						書
					</div>
					<h2 class="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
						Latih Tulisan Jepangmu Langkah demi Langkah
					</h2>
					<p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
						Tentukan aksara yang ingin kamu kuasai hari ini. Asah ingatanmu dengan menggambar setiap guratan
						secara presisi melalui kanvas interaktif kami.
					</p>
				</div>

				<div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-2">

					<RouterLink to="/hiragana"
						class="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-300 flex flex-col text-left relative overflow-hidden active:scale-[0.99]">
						<div
							class="absolute -right-4 -bottom-6 text-9xl font-bold text-neutral-100 dark:text-neutral-800 group-hover:text-neutral-200/70 dark:group-hover:text-neutral-700 transition-colors pointer-events-none">
							あ
						</div>
						<div
							class="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-4 group-hover:bg-neutral-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-neutral-900 transition-colors">
							あ
						</div>
						<h3 class="text-lg font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5">
							Belajar Hiragana
							<span class="inline-block transition-transform group-hover:translate-x-1">→</span>
						</h3>
					</RouterLink>

					<RouterLink to="/katakana"
						class="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-300 flex flex-col text-left relative overflow-hidden active:scale-[0.99]">
						<div
							class="absolute -right-4 -bottom-6 text-9xl font-bold text-neutral-100 dark:text-neutral-800 group-hover:text-neutral-200/70 dark:group-hover:text-neutral-700 transition-colors pointer-events-none">
							ア
						</div>
						<div
							class="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-4 group-hover:bg-neutral-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-neutral-900 transition-colors">
							ア
						</div>
						<h3 class="text-lg font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-1.5">
							Belajar Katakana
							<span class="inline-block transition-transform group-hover:translate-x-1">→</span>
						</h3>
					</RouterLink>

					<div class="group bg-neutral-50 dark:bg-neutral-950 border-2 border-neutral-200 dark:border-neutral-800 border-dashed p-6 rounded-2xl flex flex-col text-left relative overflow-hidden cursor-not-allowed transition-all duration-300 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50"
						title="Modul Kanji sedang dalam tahap pengembangan">
						<div
							class="absolute -right-4 -bottom-6 text-9xl font-bold text-neutral-200/40 dark:text-neutral-800/40 pointer-events-none select-none">
							漢
						</div>

						<div
							class="w-10 h-10 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-xl flex items-center justify-center text-neutral-500 dark:text-neutral-500 mb-4 shadow-inner">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
								stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
								<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
							</svg>
						</div>

						<div class="flex flex-col gap-1 z-10">
							<h3
								class="text-lg font-bold text-neutral-400 dark:text-neutral-500 flex items-center gap-2">
								Belajar Kanji
								<span
									class="text-[9px] bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold">
									Segera Hadir
								</span>
							</h3>
						</div>
					</div>

				</div>

				<div class="text-[12px] text-neutral-400 dark:text-neutral-600 font-mono tracking-wider mt-4">
					✦ SIAP BERLATIH? PILIH MODUL UNTUK MEMULAI ✦
				</div>

			</div>
		</div>
	</div>
</template>
