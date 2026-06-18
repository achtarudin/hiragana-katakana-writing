<script lang="ts" setup>
import { ref, computed, reactive, watch, onMounted, onBeforeUnmount,shallowRef } from 'vue'
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "../utils/util";

type Point = [number, number, number]

// DEFINISI PROPS
const props = defineProps<{
    database: Record<string, Array<{ kana: string; romaji: string }>>
}>()

type GroupKey = string;

// STATE UTAMA APLIKASI
const selectedGroup = ref<GroupKey>(Object.keys(props.database)[0])
const currentIndex = ref(0)

// STATE SIDEBARS
const isSidebarOpen = ref(false) // Sidebar Tools/Kana
const isNavOpen = ref(false)     // Sidebar Navigasi Halaman Utama

// STATE FULLSCREEN
const isFullscreen = ref(false)

// STATE NAVIGASI BARIS
const groupKeys = computed(() => Object.keys(props.database))
const currentGroupIndex = computed(() => groupKeys.value.indexOf(selectedGroup.value))

// REFS UNTUK DETEKSI CLICK OUTSIDE
const sidebarRef = ref<HTMLElement | null>(null)
const toggleBtnRef = ref<HTMLElement | null>(null)
const navSidebarRef = ref<HTMLElement | null>(null)
const navToggleBtnRef = ref<HTMLElement | null>(null)

// FUNGSI TOGGLE SIDEBAR
function toggleTools() {
    isSidebarOpen.value = !isSidebarOpen.value;
    if (isSidebarOpen.value) isNavOpen.value = false;
}

function toggleNav() {
    isNavOpen.value = !isNavOpen.value;
    if (isNavOpen.value) isSidebarOpen.value = false;
}

function closeAllSidebars() {
    isSidebarOpen.value = false;
    isNavOpen.value = false;
}

function handleClickOutside(event: MouseEvent | TouchEvent) {
    const target = event.target as Node;

    if (isSidebarOpen.value) {
        const clickedOutsideSidebar = sidebarRef.value && !sidebarRef.value.contains(target);
        const clickedOutsideToggleBtn = toggleBtnRef.value && !toggleBtnRef.value.contains(target);
        if (clickedOutsideSidebar && clickedOutsideToggleBtn) isSidebarOpen.value = false;
    }

    if (isNavOpen.value) {
        const clickedOutsideNav = navSidebarRef.value && !navSidebarRef.value.contains(target);
        const clickedOutsideNavToggle = navToggleBtnRef.value && !navToggleBtnRef.value.contains(target);
        if (clickedOutsideNav && clickedOutsideNavToggle) isNavOpen.value = false;
    }
}

const currentGroup = computed(() => props.database[selectedGroup.value] || [])

watch(selectedGroup, () => {
	if (isShowWatermark.value === false){
		isShowWatermark.value = true
	}

    currentIndex.value = 0
    clearCanvas()
})

watch(() => props.database, (newDatabase) => {
    selectedGroup.value = Object.keys(newDatabase)[0]
    currentIndex.value = 0
    clearCanvas()
}, { deep: true })

watch(currentIndex, () => {
	if (isShowWatermark.value === false){
		isShowWatermark.value = true
	}
    // clearCanvas()
})

// Konfigurasi perfect-freehand
const options = reactive({
    size: 10,
    smoothing: 0.5,
    thinning: 0.5,
    streamline: 0.65,
    easing: (t: number) => t,
    start: { taper: 0, cap: true },
    end: { taper: 0, cap: true },
});

// FUNGSI RESET KONFIGURASI KUAS
function resetBrushOptions() {
    options.size = window.innerWidth < 768 ? 5 : 10;
    options.thinning = 0.5;
    options.streamline = 0.65;
}

// State untuk Kanvas, Warna, Bayangan, & Mode Pen
type StrokeData = { path: string; color: string }
const points = shallowRef<Point[]>([])
const completedLines = shallowRef<StrokeData[]>([])
const isGridActive = ref(false)
const isShowWatermark = ref(true)
const isPenOnly = ref(false)

const brushColors = [
    { name: 'Hitam', value: '#171717' },
    { name: 'Biru', value: '#3B82F6' },
    { name: 'Merah', value: '#EF4444' }
]
const selectedColor = ref(brushColors[0].value)

// --- FITUR FULLSCREEN ---
async function toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        }
    } catch (err) {
        console.warn("Fullscreen API tidak didukung atau diblokir oleh browser ini.");
    }
}

function onFullscreenChange() {
    isFullscreen.value = !!document.fullscreenElement;
}

// --- FITUR CACHE / LOCAL STORAGE ---
onMounted(() => {
    const savedOptions = localStorage.getItem('app-brush-options')
    if (savedOptions) {
        const parsed = JSON.parse(savedOptions)
        options.size = parsed.size ?? options.size
        options.thinning = parsed.thinning ?? options.thinning
        options.streamline = parsed.streamline ?? options.streamline
    } else if (window.innerWidth < 768) {
        options.size = 5;
    }

    const savedColor = localStorage.getItem('app-brush-color')
    if (savedColor) selectedColor.value = savedColor

    const savedGrid = localStorage.getItem('app-grid-active')
    if (savedGrid) isGridActive.value = savedGrid === 'true'

    const savedWatermark = localStorage.getItem('app-watermark-active')
    if (savedWatermark) isShowWatermark.value = savedWatermark === 'true'

    const savedPenOnly = localStorage.getItem('app-pen-only-active')
    if (savedPenOnly) isPenOnly.value = savedPenOnly === 'true'

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('fullscreenchange', onFullscreenChange)
})

watch(options, (newVal) => {
    localStorage.setItem('app-brush-options', JSON.stringify({
        size: newVal.size,
        thinning: newVal.thinning,
        streamline: newVal.streamline
    }))
}, { deep: true })

watch(selectedColor, (newVal) => {
    localStorage.setItem('app-brush-color', newVal)
})

watch(isGridActive, (newVal) => {
    localStorage.setItem('app-grid-active', newVal.toString())
})

watch(isShowWatermark, (newVal) => {
    localStorage.setItem('app-watermark-active', newVal.toString())
})

watch(isPenOnly, (newVal) => {
    localStorage.setItem('app-pen-only-active', newVal.toString())
})

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside)
    document.removeEventListener('touchstart', handleClickOutside)
    document.removeEventListener('fullscreenchange', onFullscreenChange)
})

// Fungsi Navigasi Huruf
function nextPage() {
    if (currentIndex.value < currentGroup.value.length - 1) currentIndex.value++
}

function prevPage() {
    if (currentIndex.value > 0) currentIndex.value--
}

// Fungsi Navigasi Baris Kana
function nextGroup() {
    if (currentGroupIndex.value < groupKeys.value.length - 1) {
        selectedGroup.value = groupKeys.value[currentGroupIndex.value + 1]
    }
}

function prevGroup() {
    if (currentGroupIndex.value > 0) {
        selectedGroup.value = groupKeys.value[currentGroupIndex.value - 1]
    }
}

function getCanvasCoordinates(e: PointerEvent): Point {
    const svgElement = e.currentTarget as SVGSVGElement;
    const rect = svgElement.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top, e.pressure];
}

function handlePointerDown(e: PointerEvent) {
    if (isSidebarOpen.value || isNavOpen.value) return;
    if (isPenOnly.value && e.pointerType !== 'pen') return;

    const target = e.target as HTMLElement;
    target.setPointerCapture(e.pointerId);
    points.value = [getCanvasCoordinates(e)];
}

function handlePointerMove(e: PointerEvent) {
    if (isPenOnly.value && e.pointerType !== 'pen') return;
    if (e.buttons !== 1) return;
    points.value = [...points.value, getCanvasCoordinates(e)];
}

function handlePointerUp() {
    if (points.value.length > 0) {
        const stroke = getStroke(points.value, options)
        const path = getSvgPathFromStroke(stroke)
        completedLines.value.push({ path, color: selectedColor.value })
        points.value = []
    }
}

const pathData = computed(() => {
    if (points.value.length === 0) return ''
    const stroke = getStroke(points.value, options)
    return getSvgPathFromStroke(stroke)
})

function undoLast() {
    if (completedLines.value.length > 0) completedLines.value.pop()
}

function clearCanvas() {
    completedLines.value = []
    points.value = []
}
</script>

<template>
    <div class="relative w-full h-[100dvh] bg-neutral-50 overflow-hidden select-none flex flex-row font-sans text-neutral-800">

        <div class="absolute top-4 left-4 z-40 flex flex-col gap-2.5 pointer-events-none">

            <button v-show="!isSidebarOpen" ref="navToggleBtnRef" @click="toggleNav"
                class="w-10 h-10 bg-white border border-neutral-200 text-neutral-700 rounded-xl shadow-md hover:bg-neutral-50 transition-all active:scale-95 flex items-center justify-center pointer-events-auto"
                title="Menu Navigasi Halaman">
                <svg v-if="!isNavOpen" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span v-else class="text-xl leading-none">✕</span>
            </button>

            <button v-show="!isNavOpen" ref="toggleBtnRef" @click="toggleTools"
                class="w-10 h-10 bg-white border border-neutral-200 text-neutral-700 rounded-xl shadow-md hover:bg-neutral-50 transition-all active:scale-95 flex items-center justify-center pointer-events-auto"
                title="Tools & Pengaturan Kana">
                <svg v-if="!isSidebarOpen" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
                <span v-else class="text-xl leading-none">✕</span>
            </button>

            <button v-show="!isSidebarOpen && !isNavOpen" @click="undoLast" :disabled="completedLines.length === 0"
                class="w-10 h-10 rounded-xl shadow-md transition-all flex items-center justify-center pointer-events-auto active:scale-95 border bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800 disabled:bg-white disabled:border-neutral-200 disabled:text-neutral-400 disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed disabled:shadow-sm"
                title="Undo (Mundur 1 Guratan)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 7v6h6" />
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                </svg>
            </button>

            <button v-show="!isSidebarOpen && !isNavOpen" @click="clearCanvas" :disabled="completedLines.length === 0 && points.length === 0"
                class="w-10 h-10 rounded-xl shadow-md transition-all flex items-center justify-center pointer-events-auto active:scale-95 border bg-red-500 border-red-500 text-white hover:bg-red-600 disabled:bg-white disabled:border-neutral-200 disabled:text-neutral-400 disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed disabled:shadow-sm"
                title="Reset (Hapus Semua Guratan)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                    <path d="M22 21H7" />
                    <path d="m5 11 9 9" />
                </svg>
            </button>
        </div>

        <div v-if="isSidebarOpen || isNavOpen" @click="closeAllSidebars"
            class="absolute inset-0 bg-black/20 backdrop-blur-xs z-30 lg:hidden"></div>

        <aside ref="navSidebarRef" :class="[
            'absolute top-0 left-0 bottom-0 w-72 bg-white border-r border-neutral-200 z-30 shadow-2xl lg:shadow-md flex flex-col transition-transform duration-300 ease-in-out pointer-events-auto',
            isNavOpen ? 'translate-x-0' : '-translate-x-full'
        ]">
            <div class="h-20 shrink-0"></div>

            <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5 scrollbar-none pb-10">
                <label class="text-xs font-bold text-neutral-400 tracking-wider uppercase mb-2 px-1">Menu Halaman</label>

                <RouterLink to="/"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
                    :class="$route.path === '/' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Beranda
                </RouterLink>

                <RouterLink to="/hiragana"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
                    :class="$route.path.startsWith('/hiragana') ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'">
                    <div class="w-[18px] h-[18px] flex items-center justify-center font-bold text-lg leading-none pt-0.5">あ</div>
                    Hiragana
                </RouterLink>

                <RouterLink to="/katakana"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
                    :class="$route.path.startsWith('/katakana') ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'">
                    <div class="w-[18px] h-[18px] flex items-center justify-center font-bold text-lg leading-none pt-0.5">ア</div>
                    Katakana
                </RouterLink>
            </div>
        </aside>

        <aside ref="sidebarRef" :class="[
            'absolute top-0 left-0 bottom-0 w-80 bg-white border-r border-neutral-200 z-30 shadow-2xl lg:shadow-md flex flex-col transition-transform duration-300 ease-in-out pointer-events-auto',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]">
            <div class="h-20 shrink-0"></div>

            <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scrollbar-none pb-4 pt-1">
                <div class="flex flex-col gap-2 shrink-0">
                    <label class="text-xs font-bold text-neutral-400 tracking-wider uppercase">Pilih Baris {{ $route.name }}</label>
                    <div class="relative w-full shrink-0">
                        <select v-model="selectedGroup"
                            class="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold pl-3 pr-10 py-2.5 rounded-xl border border-transparent outline-none text-sm cursor-pointer transition-colors focus:border-neutral-400 appearance-none">
                            <option v-for="(_, key) in props.database" :key="key" :value="key">
                                {{ key }}
                            </option>
                        </select>
                        <div class="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-neutral-500 text-xs">▼</div>
                    </div>
                </div>

                <div class="flex flex-col gap-2 shrink-0">
                    <label class="text-xs font-bold text-neutral-400 tracking-wider uppercase">Daftar Huruf</label>
                    <div class="grid grid-cols-5 gap-2">
                        <button v-for="(item, index) in currentGroup" :key="index" @click="currentIndex = index" :class="[
                            'py-2 rounded-xl font-bold text-base transition-all flex flex-col items-center justify-center border aspect-square',
                            currentIndex === index
                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm scale-105'
                                : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        ]">
                            <span class="text-lg leading-tight">{{ item.kana }}</span>
                            <span :class="['text-[10px] font-mono font-medium tracking-normal leading-none mt-0.5', currentIndex === index ? 'text-neutral-300' : 'text-neutral-400']">
                                {{ item.romaji }}
                            </span>
                        </button>
                    </div>
                </div>

                <div class="h-[1px] bg-neutral-100 w-full shrink-0"></div>

                <div class="flex flex-col gap-4 shrink-0">
                    <label class="text-xs font-bold text-neutral-400 tracking-wider uppercase">Konfigurasi Kuas</label>

                    <div class="flex flex-col gap-1.5">
                        <div class="flex justify-between text-xs font-semibold text-neutral-600">
                            <label>Ukuran Kuas</label>
                            <span class="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 font-mono">{{ options.size }}px</span>
                        </div>
                        <input type="range" min="4" max="64" step="1" v-model.number="options.size" class="w-full accent-neutral-800 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <div class="flex justify-between text-xs font-semibold text-neutral-600">
                            <label>Efek Tekanan</label>
                            <span class="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 font-mono">{{ options.thinning }}</span>
                        </div>
                        <input type="range" min="-1" max="1" step="0.1" v-model.number="options.thinning" class="w-full accent-neutral-800 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <div class="flex justify-between text-xs font-semibold text-neutral-600">
                            <label>Penstabil Garis</label>
                            <span class="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 font-mono">{{ options.streamline }}</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.05" v-model.number="options.streamline" class="w-full accent-neutral-800 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
                    </div>

                    <button @click="resetBrushOptions"
                        class="w-full py-2 mt-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        title="Kembalikan pengaturan kuas ke awal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <path d="M3 3v5h5"/>
                        </svg>
                        Reset Setelan Kuas
                    </button>
                </div>

                <div class="h-[1px] bg-neutral-100 w-full shrink-0"></div>

                <div class="flex flex-col gap-2 shrink-0">
                    <label class="text-xs font-bold text-neutral-400 tracking-wider uppercase">Warna Kuas</label>
                    <div class="flex gap-3">
                        <button v-for="color in brushColors" :key="color.value" @click="selectedColor = color.value"
                            class="w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center"
                            :style="{ backgroundColor: color.value, borderColor: selectedColor === color.value ? '#d4d4d4' : 'transparent' }"
                            :class="selectedColor === color.value ? 'scale-110 shadow-md outline outline-2 outline-offset-2 outline-neutral-300' : 'hover:scale-105 shadow-sm'"
                            :title="color.name">
                        </button>
                    </div>
                </div>

                <div class="h-[1px] bg-neutral-100 w-full shrink-0"></div>

                <div class="flex flex-col gap-2 shrink-0">
                    <label class="text-xs font-bold text-neutral-400 tracking-wider uppercase">Buku Kotak Bantu</label>
                    <div class="grid grid-cols-2 gap-2">
                        <button @click="isGridActive = true"
                            :class="['py-2 text-xs font-bold rounded-xl border transition-all', isGridActive ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100']">
                            Grid On
                        </button>
                        <button @click="isGridActive = false"
                            :class="['py-2 text-xs font-bold rounded-xl border transition-all', !isGridActive ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100']">
                            Grid Off
                        </button>
                    </div>
                </div>
            </div>
        </aside>

        <main class="flex-1 h-full relative flex flex-col overflow-hidden">

            <div class="absolute top-4 right-4 z-20 flex flex-wrap justify-end items-center gap-1.5 md:gap-2 pointer-events-auto bg-white/95 border border-neutral-200 p-1 md:p-1.5 rounded-xl shadow-md backdrop-blur-sm max-w-[calc(100vw-5rem)]">

                <button @click="isPenOnly = !isPenOnly"
                    :class="['w-9 h-9 rounded-lg transition-colors flex items-center justify-center border shrink-0', isPenOnly ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-400 hover:bg-neutral-50']"
                    :title="isPenOnly ? 'Mode Pen Saja Aktif (Abaikan Sentuhan Jari)' : 'Mode Bebas (Bisa Jari / Pen)'">
                    <svg v-if="isPenOnly" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
                        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
                        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
                        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
                    </svg>
                </button>

                <button @click="isShowWatermark = !isShowWatermark"
                    :class="['w-9 h-9 rounded-lg transition-colors flex items-center justify-center border shrink-0', isShowWatermark ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-400 hover:bg-neutral-50']"
                    title="Toggle Bayangan Huruf">
                    <svg v-if="isShowWatermark" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m2 2 20 20" />
                        <path d="M6.71 6.71A10.61 10.61 0 0 0 2 12s3 7 10 7a10.54 10.54 0 0 0 5.39-1.5" />
                        <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
                        <path d="M17.48 13.87A10.55 10.55 0 0 0 22 12s-3-7-10-7a10.5 10.5 0 0 0-4.48 1.02" />
                    </svg>
                </button>

                <button @click="toggleFullscreen"
                    :class="['w-9 h-9 rounded-lg transition-colors flex items-center justify-center border shrink-0', isFullscreen ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50']"
                    :title="isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (Sembunyikan Address Bar)'">
                    <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
                    </svg>
                </button>

                <div class="w-[1px] h-5 bg-neutral-200 mx-1 hidden sm:block"></div>

                <button @click="prevPage" :disabled="currentIndex === 0 || !isShowWatermark"
                    class="w-9 h-9 bg-neutral-50 border border-neutral-200 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center text-neutral-700 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>

                <div class="px-1 text-xs font-bold text-neutral-800 min-w-[30px] text-center hidden sm:block transition-opacity" :class="!isShowWatermark ? 'opacity-40' : ''">
                    {{ currentIndex + 1 }}/{{ currentGroup.length }}
                </div>

                <button @click="nextPage" :disabled="currentIndex === currentGroup.length - 1 || !isShowWatermark"
                    class="w-9 h-9 bg-neutral-50 border border-neutral-200 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center text-neutral-700 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </div>

            <div class="relative flex-1 w-full h-full">
                <div :class="[
                    'absolute inset-0 flex flex-row flex-wrap items-center justify-center content-center gap-x-4 gap-y-6 md:gap-x-8 md:gap-y-8 pointer-events-none select-none z-0 p-6 pt-16 pb-6 md:px-16 overflow-hidden transition-opacity duration-300',
                    isShowWatermark ? 'opacity-100' : 'opacity-0'
                ]">
                    <div v-for="(item, index) in currentGroup" :key="index" :class="[
                        'flex flex-col items-center justify-center transition-all duration-300 select-none',
                        currentGroup.length <= 3 ? 'w-[28%] sm:w-[20%] md:w-[16%]' : 'w-[28%] sm:w-[25%] md:w-[15%] lg:w-[14%]'
                    ]">
                        <span :class="[
                            'font-medium font-sans leading-none transition-all duration-300 text-center',
                            currentIndex === index ? 'text-[10vh] sm:text-[14vh] md:text-[16vh] lg:text-[18vh] text-neutral-400 font-semibold' : 'text-[10vh] sm:text-[14vh] md:text-[16vh] lg:text-[18vh] text-neutral-400/25 font-semibold'
                        ]">
                            {{ item.kana }}
                        </span>

                        <span :class="[
                            'font-mono font-bold tracking-wide transition-all duration-300 leading-none mt-1 md:mt-3 text-center',
                            currentIndex === index ? 'text-[3.5vh] sm:text-[4vh] lg:text-[5vh] text-neutral-900' : 'text-[3.5vh] sm:text-[4vh] lg:text-[5vh] text-neutral-400/25'
                        ]">
                            {{ item.romaji }}
                        </span>
                    </div>
                </div>

                <svg @pointerdown="handlePointerDown" @pointermove="handlePointerMove" @pointerup="handlePointerUp"
                    class="w-full h-full bg-transparent cursor-crosshair relative z-10 touch-none"
                    style="touch-action: none;">
                    <defs v-if="isGridActive">
                        <pattern id="full-canvas-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" class="text-neutral-500/30" stroke-width="1" />
                        </pattern>
                    </defs>
                    <rect v-if="isGridActive" width="100%" height="100%" fill="url(#full-canvas-grid)" pointer-events-none />

                    <path v-for="(line, index) in completedLines" :key="index" :d="line.path" :fill="line.color" />
                    <path v-if="points.length > 0" :d="pathData" :fill="selectedColor" />
                </svg>
            </div>

            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 z-20 flex items-center justify-center gap-2 pointer-events-auto">
                <button @click="prevGroup" :disabled="currentGroupIndex === 0"
                    class="w-10 h-10 bg-white border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-full shadow-md transition-colors flex items-center justify-center text-neutral-700 shrink-0"
                    title="Baris Sebelumnya">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>

                <div class="bg-neutral-900/80 text-white text-xs px-4 py-2.5 rounded-full backdrop-blur-sm pointer-events-none shadow flex items-center gap-2 shrink-0">
                    <span class="font-bold text-neutral-300 pr-2 border-r border-neutral-600">{{ selectedGroup }}</span>
                    <span>Guratan: <span class="font-bold text-yellow-400">{{ completedLines.length }}</span></span>
                </div>

                <button @click="nextGroup" :disabled="currentGroupIndex === groupKeys.length - 1"
                    class="w-10 h-10 bg-white border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-full shadow-md transition-colors flex items-center justify-center text-neutral-700 shrink-0"
                    title="Baris Selanjutnya">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </div>

        </main>
    </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
    display: none;
}

.scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* Memastikan elemen Fullscreen menutupi layar sepenuhnya */
:fullscreen {
    background-color: #fbfbfb; /* bg-neutral-50 */
}
</style>
