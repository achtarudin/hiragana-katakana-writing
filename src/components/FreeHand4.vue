<script lang="ts" setup>
import { ref, computed, reactive, watch } from 'vue'
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "../utils/util";

type Point = [number, number, number]

// 1. DATABASE JEPANG YANG SUDAH DIVALIDASI DAN DIPERBAIKI (STANDAR GOJUON)
const database = {
    "Baris Vokal (a, i, u, e, o)": [
        { "kana": "あ", "romaji": "a" }, { "kana": "い", "romaji": "i" }, { "kana": "う", "romaji": "u" }, { "kana": "え", "romaji": "e" }, { "kana": "お", "romaji": "o" }
    ],
    "Baris K (ka, ki, ku, ke, ko)": [
        { "kana": "か", "romaji": "ka" }, { "kana": "き", "romaji": "ki" }, { "kana": "く", "romaji": "ku" }, { "kana": "け", "romaji": "ke" }, { "kana": "こ", "romaji": "ko" }
    ],
    "Baris S (sa, shi, su, se, so)": [
        { "kana": "さ", "romaji": "sa" }, { "kana": "し", "romaji": "shi" }, { "kana": "す", "romaji": "su" }, { "kana": "せ", "romaji": "se" }, { "kana": "そ", "romaji": "so" }
    ],
    "Baris T (ta, chi, tsu, te, to)": [
        { "kana": "た", "romaji": "ta" }, { "kana": "ち", "romaji": "chi" }, { "kana": "つ", "romaji": "tsu" }, { "kana": "て", "romaji": "te" }, { "kana": "と", "romaji": "to" }
    ],
    "Baris N (na, ni, nu, ne, no)": [
        { "kana": "な", "romaji": "na" }, { "kana": "に", "romaji": "ni" }, { "kana": "ぬ", "romaji": "nu" }, { "kana": "ね", "romaji": "ne" }, { "kana": "の", "romaji": "no" }
    ],
    "Baris H (ha, hi, fu, he, ho)": [
        { "kana": "は", "romaji": "ha" }, { "kana": "ひ", "romaji": "hi" }, { "kana": "ふ", "romaji": "fu" }, { "kana": "へ", "romaji": "he" }, { "kana": "ほ", "romaji": "ho" }
    ],
    "Baris M (ma, mi, mu, me, mo)": [
        { "kana": "ま", "romaji": "ma" }, { "kana": "み", "romaji": "mi" }, { "kana": "む", "romaji": "mu" }, { "kana": "め", "romaji": "me" }, { "kana": "も", "romaji": "mo" }
    ],
    "Baris Y (ya, yu, yo)": [
        { "kana": "や", "romaji": "ya" }, { "kana": "ゆ", "romaji": "yu" }, { "kana": "よ", "romaji": "yo" }
    ],
    "Baris R (ra, ri, ru, re, ro)": [
        { "kana": "ら", "romaji": "ra" }, { "kana": "り", "romaji": "ri" }, { "kana": "る", "romaji": "ru" }, { "kana": "れ", "romaji": "re" }, { "kana": "ろ", "romaji": "ro" }
    ],
    "Baris W & N (wa, wo, n)": [
        { "kana": "わ", "romaji": "wa" }, { "kana": "を", "romaji": "wo" }, { "kana": "ん", "romaji": "n" }
    ]
}

type GroupKey = keyof typeof database;

// 2. STATE UTAMA APLIKASI
const selectedGroup = ref<GroupKey>("Baris Vokal (a, i, u, e, o)")
const currentIndex = ref(0)

// Mengambil kelompok array yang aktif saat ini
const currentGroup = computed(() => database[selectedGroup.value])

// Reset penunjuk halaman ke awal jika pengguna mengganti kelompok baris huruf
watch(selectedGroup, () => {
    currentIndex.value = 0
    clearCanvas()
})

// Bersihkan coretan tinta jika halaman huruf bergeser (Paginasi)
watch(currentIndex, () => {
    clearCanvas()
})

// Konfigurasi Parameter Kuas Menggambar (Reactive)
const options = reactive({
    size: 16,
    smoothing: 0.5,
    thinning: 0.5,
    streamline: 0.65,
    easing: (t: number) => t,
    start: { taper: 0, cap: true },
    end: { taper: 0, cap: true },
});

const isSettingsOpen = ref(false)
const completedLines = ref<string[]>([])
const points = ref<Point[]>([])

// CONFIG TAMPILAN: true = Full Grid Aktif, false = Grid Mati
const isGridActive = ref(false)

// SISTEM NAVIGASI HALAMAN (TOMBOL PANAH KECIL)
function nextPage() {
    if (currentIndex.value < currentGroup.value.length - 1) {
        currentIndex.value++
    }
}

function prevPage() {
    if (currentIndex.value > 0) {
        currentIndex.value--
    }
}

// KALKULASI KOORDINAT REAL-TIME RELATIF TERHADAP KOTAK SVG
function getCanvasCoordinates(e: PointerEvent): Point {
    const svgElement = e.currentTarget as SVGSVGElement;
    const rect = svgElement.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top, e.pressure];
}

function handlePointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement;
    target.setPointerCapture(e.pointerId);
    points.value = [getCanvasCoordinates(e)];
}

function handlePointerMove(e: PointerEvent) {
    if (e.buttons !== 1) return;
    points.value = [...points.value, getCanvasCoordinates(e)];
}

function handlePointerUp() {
    if (points.value.length > 0) {
        const stroke = getStroke(points.value, options)
        const path = getSvgPathFromStroke(stroke)
        completedLines.value.push(path)
        points.value = []
    }
}

// Menghitung data alur path garis aktif yang sedang ditarik kursor secara real-time
const pathData = computed(() => {
    if (points.value.length === 0) return ''
    const stroke = getStroke(points.value, options)
    return getSvgPathFromStroke(stroke)
})

function undoLast() {
    if (completedLines.value.length > 0) {
        completedLines.value.pop()
    }
}

function clearCanvas() {
    completedLines.value = []
    points.value = []
}
</script>

<template>
    <div class="relative w-full h-screen bg-neutral-50 overflow-hidden select-none flex flex-col">

        <div class="absolute top-4 left-4 right-4 flex flex-col lg:flex-row gap-3 justify-between items-center z-20 pointer-events-none">

            <div class="bg-white/90 border border-neutral-200 p-2 rounded-xl shadow-sm backdrop-blur-sm pointer-events-auto flex items-center gap-3 flex-wrap max-w-full">
                <select v-model="selectedGroup"
                    class="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold px-3 py-2 rounded-lg border-none outline-none text-sm cursor-pointer transition-colors focus:ring-2 focus:ring-neutral-400 h-[46px]">
                    <option v-for="(_, key) in database" :key="key" :value="key">
                        {{ key }}
                    </option>
                </select>

                <div class="w-[1px] h-6 bg-neutral-200 hidden sm:block"></div>

                <div class="flex items-center gap-1.5 flex-wrap">
                    <button v-for="(item, index) in currentGroup" :key="index" @click="currentIndex = index" :class="[
                        'px-3 py-1 rounded-lg font-bold text-base transition-all flex flex-col items-center min-w-[42px] h-[46px] justify-center',
                        currentIndex === index
                            ? 'bg-neutral-900 text-white shadow-sm scale-105'
                            : 'bg-neutral-50 hover:bg-neutral-200 text-neutral-700'
                    ]">
                        <span>{{ item.kana }}</span>
                        <span
                            :class="['text-[9px] font-mono font-medium tracking-normal leading-none mt-0.5', currentIndex === index ? 'text-neutral-300' : 'text-neutral-400']">
                            {{ item.romaji }}
                        </span>
                    </button>
                </div>
            </div>

            <div class="flex items-center gap-2 pointer-events-auto bg-white/90 border border-neutral-200 p-2 rounded-xl shadow-sm backdrop-blur-sm">
                <button @click="prevPage" :disabled="currentIndex === 0"
                    class="px-3 h-[46px] bg-neutral-50 border border-neutral-200 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors font-bold text-base flex items-center justify-center">
                    ◀
                </button>

                <button @click="nextPage" :disabled="currentIndex === currentGroup.length - 1"
                    class="px-3 h-[46px] bg-neutral-50 border border-neutral-200 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors font-bold text-base flex items-center justify-center">
                    ▶
                </button>

                <div class="w-[1px] h-6 bg-neutral-300 mx-1"></div>

                <button @click="isSettingsOpen = true"
                    class="px-3 h-[46px] bg-neutral-50 border border-neutral-200 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-bold text-base flex items-center justify-center"
                    title="Pengaturan Kuas">
                    ⚙️
                </button>

                <button @click="undoLast" :disabled="completedLines.length === 0"
                    class="px-4 h-[46px] bg-white border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 font-bold rounded-lg shadow-xs transition-colors text-base flex items-center justify-center">
                    Undo
                </button>

                <button @click="clearCanvas" :disabled="completedLines.length === 0 && points.length === 0"
                    class="px-4 h-[46px] bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-xs transition-colors text-base flex items-center justify-center">
                    Reset
                </button>
            </div>
        </div>

        <div class="relative flex-1 w-full h-full">

            <div
                class="absolute inset-0 flex flex-row items-center justify-center gap-6 md:gap-14 pointer-events-none select-none z-0 px-4 overflow-hidden">

                <div v-for="(item, index) in currentGroup" :key="index"
                    class="flex flex-col items-center justify-center transition-all duration-300 select-none">
                    <span :class="[
                        'font-medium font-sans leading-none transition-all duration-300',
                        currentIndex === index
                            ? 'text-[24vh] text-neutral-400 font-semibold'
                            : 'text-[24vh] text-neutral-400/25 font-semibold'
                    ]">
                        {{ item.kana }}
                    </span>

                    <span :class="[
                        'font-mono font-bold tracking-wide transition-all duration-300 leading-none mt-2',
                        currentIndex === index
                            ? 'text-[8vh] text-black'
                            : 'text-[8vh] text-neutral-400/25'
                    ]">
                        {{ item.romaji }}
                    </span>
                </div>

            </div>

            <svg @pointerdown="handlePointerDown" @pointermove="handlePointerMove" @pointerup="handlePointerUp"
                class="w-full h-full bg-transparent cursor-crosshair relative z-10" style="touch-action: none;">

                <defs v-if="isGridActive">
                    <pattern id="full-canvas-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" class="text-neutral-400" stroke-width="1" />
                    </pattern>
                </defs>

                <rect v-if="isGridActive" width="100%" height="100%" fill="url(#full-canvas-grid)" pointer-events-none />

                <path v-for="(path, index) in completedLines" :key="index" :d="path" fill="black" />
                <path v-if="points.length > 0" :d="pathData" fill="black" />
            </svg>
        </div>

        <div
            class="absolute bottom-4 left-4 bg-neutral-900/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none z-20">
            Jumlah Guratan: <span class="font-bold text-yellow-400">{{ completedLines.length }}</span>
        </div>

        <div v-if="isSettingsOpen"
            class="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            @click.self="isSettingsOpen = false">
            <div
                class="w-full max-w-sm bg-white rounded-xl shadow-xl border border-neutral-200 p-5 flex flex-col gap-4">
                <div class="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <h3 class="text-base font-bold text-neutral-800">Pengaturan Kuas</h3>
                    <button @click="isSettingsOpen = false"
                        class="text-neutral-400 hover:text-neutral-600 font-bold p-1 text-sm">✕</button>
                </div>
                <div class="flex flex-col gap-4 py-2">
                    <div class="flex flex-col gap-1">
                        <div class="flex justify-between text-xs font-semibold text-neutral-600"><label>Ukuran Kuas</label>
                        <span class="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 font-mono">{{ options.size }}px</span></div>
                        <input type="range" min="4" max="64" step="1" v-model.number="options.size"
                            class="w-full accent-neutral-800 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <div class="flex justify-between text-xs font-semibold text-neutral-600"><label>Efek Tekanan (Thinning)</label>
                        <span class="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 font-mono">{{ options.thinning }}</span></div>
                        <input type="range" min="-1" max="1" step="0.1" v-model.number="options.thinning"
                            class="w-full accent-neutral-800 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <div class="flex justify-between text-xs font-semibold text-neutral-600"><label>Penstabil Garis (Streamline)</label>
                        <span class="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 font-mono">{{ options.streamline }}</span></div>
                        <input type="range" min="0" max="1" step="0.05" v-model.number="options.streamline"
                            class="w-full accent-neutral-800 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
                    </div>

                    <div class="w-full h-[1px] bg-neutral-200 my-1"></div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-semibold text-neutral-600">Buku Kotak Bantu (Full Grid)</label>
                        <div class="grid grid-cols-2 gap-2">
                            <button
                                @click="isGridActive = true"
                                :class="[
                                    'py-2 text-xs font-bold rounded-lg border transition-all',
                                    isGridActive
                                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                                ]"
                            >
                                Grid Aktif (On)
                            </button>

                            <button
                                @click="isGridActive = false"
                                :class="[
                                    'py-2 text-xs font-bold rounded-lg border transition-all',
                                    !isGridActive
                                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                                ]"
                            >
                                Sembunyikan (Off)
                            </button>
                        </div>
                    </div>
                </div>
                <button @click="isSettingsOpen = false"
                    class="w-full mt-2 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm rounded-lg shadow transition-colors">
                    Simpan & Tutup
                </button>
            </div>
        </div>

    </div>
</template>
