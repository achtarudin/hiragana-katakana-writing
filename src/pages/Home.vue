<template>
    <div class="w-full h-screen bg-neutral-50 flex flex-col font-sans text-neutral-800 select-none overflow-hidden">

        <header
            class="bg-white border-b border-neutral-200 px-4 py-3 shadow-2xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 z-30 shrink-0">
            <div class="flex items-center gap-2">
                <span class="text-xl">書</span>
                <h1 class="font-bold text-base tracking-wide uppercase text-neutral-900">Kana Learn App</h1>
            </div>

            <nav class="flex items-center gap-2">
                <RouterLink to="/" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    :class="$route.path === '/' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'">
                    Home
                </RouterLink>
                <RouterLink to="/hiragana" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    :class="$route.path === '/hiragana' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'">
                    Hiragana
                </RouterLink>
                <RouterLink to="/katakana" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    :class="$route.path === '/katakana' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'">
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
