<script lang="ts" setup>
import { onMounted } from 'vue'
import { useHead } from '@vueuse/head'

useHead({
    title: 'Nihon Moji | Belajar Hiragana & Katakana',
    meta: [
        { name: 'description', content: 'Aplikasi interaktif gratis untuk belajar, berlatih menulis, dan menguasai huruf Jepang: Hiragana dan Katakana.' },
		{
            name: 'google-site-verification',
            content: 'Bz9SOQwkGMtAqTHWpLTeuJTrqZHTkeiTF7rE5FRh2vw'
        },
        // Open Graph
        { property: 'og:title', content: 'Nihon Moji - Belajar Huruf Jepang' },
        { property: 'og:description', content: 'Kuasai Hiragana dan Katakana dengan mudah melalui kanvas interaktif kami.' },
        { property: 'og:url', content: 'https://nihon-moji.vercel.app/' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: 'https://nihon-moji.vercel.app/og-image.png' },
        { property: 'og:locale', content: 'id_ID' }
    ],
    link: [
        {
            rel: 'icon',
            type: 'image/svg+xml',
            href: '/favicon.svg'
        }
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

        <!-- HEADER TETAP SAMA -->
        <header
            class="bg-white border-b border-neutral-200 px-4 py-3 shadow-sm flex flex-row justify-between items-center gap-4 z-30 shrink-0">

            <div class="flex items-center gap-2.5">
                <div
                    class="w-8 h-8 bg-neutral-900 text-white flex items-center justify-center rounded-lg shadow-sm font-bold text-lg leading-none">
                    書
                </div>
                <h1 class="hidden sm:block font-bold text-sm tracking-widest uppercase text-neutral-900 mt-0.5">
                    Nihon Moji
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

        <!-- KONTEN UTAMA YANG DIPERBAIKI -->
        <!-- Menghapus items-center dan justify-center, mengubah menjadi flex-col -->
        <div class="flex-1 w-full overflow-y-auto bg-neutral-50 flex flex-col px-4 py-6 md:p-8">

            <!-- Menambahkan mx-auto dan my-auto untuk 'safe centering' -->
            <div class="w-full max-w-4xl mx-auto my-auto flex flex-col items-center text-center gap-8 py-2 md:py-6">

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

                <div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-2">

                    <!-- Kartu Hiragana -->
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

                    <!-- Kartu Katakana -->
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

                    <!-- Kartu Kanji (Disabled / Coming Soon) -->
                    <div class="group bg-neutral-50 border-2 border-neutral-200 border-dashed p-6 rounded-2xl flex flex-col text-left relative overflow-hidden cursor-not-allowed transition-all duration-300 hover:bg-neutral-100/50"
                        title="Modul Kanji sedang dalam tahap pengembangan">
                        <div
                            class="absolute -right-4 -bottom-6 text-9xl font-bold text-neutral-200/40 pointer-events-none select-none">
                            漢
                        </div>

                        <div
                            class="w-10 h-10 bg-neutral-200/70 rounded-xl flex items-center justify-center text-neutral-500 mb-4 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>

                        <div class="flex flex-col gap-1 z-10">
                            <h3 class="text-lg font-bold text-neutral-400 flex items-center gap-2">
                                Belajar Kanji
                                <span
                                    class="text-[9px] bg-neutral-200 text-neutral-500 px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold">
                                    Segera Hadir
                                </span>
                            </h3>
                        </div>
                    </div>

                </div>

                <div class="text-[10px] text-neutral-400 font-mono tracking-wider mt-4">
                    PROGRES BELAJAR: PILIH MODUL UNTUK MEMULAI LATIHAN GURATAN
                </div>

            </div>
        </div>
    </div>
</template>
