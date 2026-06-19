<script lang="ts" setup>
import { ref, computed, reactive, watch, onMounted, onBeforeUnmount, shallowRef } from 'vue'
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

// STATE FULLSCREEN & DARK MODE
const isFullscreen = ref(false)
const isDarkMode = ref(false)

// STATE NAVIGASI BARIS
const groupKeys = computed(() => Object.keys(props.database))
const currentGroupIndex = computed(() => groupKeys.value.indexOf(selectedGroup.value))
const currentGroup = computed(() => props.database[selectedGroup.value] || [])

// REFS UNTUK DETEKSI CLICK OUTSIDE
const sidebarRef = ref<HTMLElement | null>(null)
const toggleBtnRef = ref<HTMLElement | null>(null)
const navSidebarRef = ref<HTMLElement | null>(null)
const navToggleBtnRef = ref<HTMLElement | null>(null)

// --- FITUR CHALLENGE MODE & CEK JAWABAN ---
const isChallengeMode = ref(false)
const isAnswerRevealed = ref(false) // State untuk fitur intip jawaban

type ChallengeItem = { kana: string; romaji: string; showType?: 'kana' | 'romaji' }
const challengeItems = ref<ChallengeItem[]>([])

function shuffleArray<T>(array: T[]): T[] {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

function startChallenge() {
	const shuffled = shuffleArray(currentGroup.value);

	challengeItems.value = shuffled.map(item => ({
		...item,
		showType: Math.random() > 0.5 ? 'kana' : 'romaji'
	}));

	currentIndex.value = 0;
	isAnswerRevealed.value = false;
	clearCanvas();
}

function toggleChallengeMode() {
	if (isShowWatermark.value === false) {
		isShowWatermark.value = true
	}

	isChallengeMode.value = !isChallengeMode.value;
	isAnswerRevealed.value = false;

	if (isChallengeMode.value) {
		startChallenge();
	} else {
		currentIndex.value = 0;
		clearCanvas();
	}
}

// Data aktif yang dipantau UI: Data normal ATAU Data acak tantangan
const activeGroup = computed<ChallengeItem[]>(() => {
	return isChallengeMode.value ? challengeItems.value : currentGroup.value;
})

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

watch(selectedGroup, () => {
	if (isShowWatermark.value === false) {
		isShowWatermark.value = true
	}

	if (isChallengeMode.value) {
		startChallenge();
	} else {
		currentIndex.value = 0;
		isAnswerRevealed.value = false;
		clearCanvas();
	}
})

watch(() => props.database, (newDatabase) => {
	selectedGroup.value = Object.keys(newDatabase)[0]
	isChallengeMode.value = false;
	isAnswerRevealed.value = false;
	currentIndex.value = 0
	clearCanvas()
}, { deep: true })

watch(currentIndex, () => {
	isAnswerRevealed.value = false; // Reset intip jawaban saat ganti huruf

	if (isShowWatermark.value === false) {
		isShowWatermark.value = true
	}
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

// MODIFIKASI: Gunakan 'theme-default' agar warna bisa menyesuaikan mode Terang/Gelap
const brushColors = [
	{ name: 'Default (Hitam/Putih)', value: 'theme-default' },
	{ name: 'Biru', value: '#3B82F6' },
	{ name: 'Merah', value: '#EF4444' }
]
const selectedColor = ref(brushColors[0].value)

// Fungsi pembantu untuk merender warna dinamis di template/kanvas
function resolveColor(color: string) {
	if (color === 'theme-default') {
		return isDarkMode.value ? '#F5F5F5' : '#171717';
	}
	return color;
}

function toggleDarkMode() {
	isDarkMode.value = !isDarkMode.value;
	if (isDarkMode.value) {
		document.documentElement.classList.add('dark');
		localStorage.setItem('app-theme', 'dark');
	} else {
		document.documentElement.classList.remove('dark');
		localStorage.setItem('app-theme', 'light');
	}
}

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

onMounted(() => {
	// Inisialisasi Dark Mode
	const savedTheme = localStorage.getItem('app-theme')
	if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
		isDarkMode.value = true
		document.documentElement.classList.add('dark')
	} else {
		document.documentElement.classList.remove('dark')
	}

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
	if (currentIndex.value < activeGroup.value.length - 1) currentIndex.value++
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
		completedLines.value = [...completedLines.value, { path, color: selectedColor.value }]
		points.value = []
	}
}

const pathData = computed(() => {
	if (points.value.length === 0) return ''
	const stroke = getStroke(points.value, options)
	return getSvgPathFromStroke(stroke)
})

function undoLast() {
	if (completedLines.value.length > 0) {
		completedLines.value = completedLines.value.slice(0, -1)
	}
}

function clearCanvas() {
	completedLines.value = []
	points.value = []
}
</script>

<template>
	<div
		class="relative w-full h-[100dvh] bg-neutral-50 dark:bg-neutral-950 overflow-hidden select-none flex flex-row font-sans text-neutral-800 dark:text-neutral-100 transition-colors duration-300">

		<div class="absolute top-4 left-4 z-40 flex flex-col gap-2.5 pointer-events-none">

			<button v-show="!isSidebarOpen" ref="navToggleBtnRef" @click="toggleNav"
				class="w-10 h-10 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl shadow-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all active:scale-95 flex items-center justify-center pointer-events-auto"
				title="Menu Navigasi Halaman">
				<svg v-if="!isNavOpen" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
					fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
					<polyline points="9 22 9 12 15 12 15 22" />
				</svg>
				<span v-else class="text-xl leading-none">✕</span>
			</button>

			<button v-show="!isNavOpen" ref="toggleBtnRef" @click="toggleTools"
				class="w-10 h-10 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl shadow-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all active:scale-95 flex items-center justify-center pointer-events-auto"
				title="Tools & Pengaturan Kana">
				<svg v-if="!isSidebarOpen" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
					fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path
						d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
				<span v-else class="text-xl leading-none">✕</span>
			</button>

			<button v-show="!isSidebarOpen && !isNavOpen" @click="clearCanvas"
				:disabled="completedLines.length === 0 && points.length === 0"
				class="w-10 h-10 rounded-xl shadow-md transition-all flex items-center justify-center pointer-events-auto active:scale-95 border bg-red-500 dark:bg-red-600 border-red-500 dark:border-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 disabled:bg-white dark:disabled:bg-neutral-800 disabled:border-neutral-200 dark:disabled:border-neutral-700 disabled:text-neutral-400 dark:disabled:text-neutral-600 disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed disabled:shadow-sm"
				title="Reset (Hapus Semua Guratan)">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
					stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
					<path d="M22 21H7" />
					<path d="m5 11 9 9" />
				</svg>
			</button>

			<button v-show="!isSidebarOpen && !isNavOpen" @click="undoLast" :disabled="completedLines.length === 0"
				class="w-10 h-10 rounded-xl shadow-md transition-all flex items-center justify-center pointer-events-auto active:scale-95 border bg-neutral-900 dark:bg-neutral-700 border-neutral-900 dark:border-neutral-700 text-white hover:bg-neutral-800 dark:hover:bg-neutral-600 disabled:bg-white dark:disabled:bg-neutral-800 disabled:border-neutral-200 dark:disabled:border-neutral-700 disabled:text-neutral-400 dark:disabled:text-neutral-600 disabled:opacity-60 disabled:active:scale-100 disabled:cursor-not-allowed disabled:shadow-sm"
				title="Undo (Mundur 1 Guratan)">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
					stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 7v6h6" />
					<path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
				</svg>
			</button>
		</div>

		<div v-if="isSidebarOpen || isNavOpen" @click="closeAllSidebars"
			class="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-xs z-30 lg:hidden"></div>

		<aside ref="navSidebarRef" :class="[
			'absolute top-0 left-0 bottom-0 w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-30 shadow-2xl lg:shadow-md flex flex-col transition-transform duration-300 ease-in-out pointer-events-auto',
			isNavOpen ? 'translate-x-0' : '-translate-x-full'
		]">
			<div class="h-20 shrink-0"></div>

			<div class="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5 scrollbar-none pb-10">
				<label
					class="text-xs font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase mb-2 px-1">Menu
					Halaman</label>

				<RouterLink to="/"
					class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
					:class="$route.path === '/' ? 'bg-neutral-900 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200'">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
						<polyline points="9 22 9 12 15 12 15 22" />
					</svg>
					Beranda
				</RouterLink>

				<RouterLink to="/hiragana"
					class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
					:class="$route.path.startsWith('/hiragana') ? 'bg-neutral-900 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200'">
					<div
						class="w-[18px] h-[18px] flex items-center justify-center font-bold text-lg leading-none pt-0.5">
						あ</div>
					Hiragana
				</RouterLink>

				<RouterLink to="/katakana"
					class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
					:class="$route.path.startsWith('/katakana') ? 'bg-neutral-900 dark:bg-neutral-200 text-white dark:text-neutral-900 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200'">
					<div
						class="w-[18px] h-[18px] flex items-center justify-center font-bold text-lg leading-none pt-0.5">
						ア</div>
					Katakana
				</RouterLink>
			</div>
		</aside>

		<aside ref="sidebarRef" :class="[
			'absolute top-0 left-0 bottom-0 w-80 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-30 shadow-2xl lg:shadow-md flex flex-col transition-transform duration-300 ease-in-out pointer-events-auto',
			isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
		]">
			<div class="h-20 shrink-0"></div>

			<div class="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scrollbar-none pb-4 pt-1">
				<div class="flex flex-col gap-2 shrink-0">
					<label
						class="text-xs font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">Pilih
						Baris {{ $route.name }}</label>
					<div class="relative w-full shrink-0">
						<select v-model="selectedGroup"
							class="w-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold pl-3 pr-10 py-2.5 rounded-xl border border-transparent outline-none text-sm cursor-pointer transition-colors focus:border-neutral-400 dark:focus:border-neutral-500 appearance-none">
							<option v-for="(_, key) in props.database" :key="key" :value="key">
								{{ key }}
							</option>
						</select>
						<div
							class="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-neutral-500 dark:text-neutral-400 text-xs">
							▼</div>
					</div>
				</div>

				<div class="flex flex-col gap-2 shrink-0" v-if="!isChallengeMode">
					<label
						class="text-xs font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">Daftar
						Huruf</label>
					<div class="grid grid-cols-5 gap-2">
						<button v-for="(item, index) in activeGroup" :key="index" @click="currentIndex = index" :class="[
							'py-2 rounded-xl font-bold text-base transition-all flex flex-col items-center justify-center border aspect-square',
							currentIndex === index
								? 'bg-neutral-900 dark:bg-neutral-200 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-200 shadow-sm scale-105'
								: 'bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
						]">
							<span class="text-lg leading-tight">{{ (!isChallengeMode || item.showType === 'kana' ||
								isAnswerRevealed) ? item.kana : '?' }}</span>
							<span
								:class="['text-[10px] font-mono font-medium tracking-normal leading-none mt-0.5', currentIndex === index ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400 dark:text-neutral-500']">
								{{ (!isChallengeMode || item.showType === 'romaji' || isAnswerRevealed) ? item.romaji :
									'?' }}
							</span>
						</button>
					</div>
				</div>

				<div class="h-[1px] bg-neutral-100 dark:bg-neutral-800 w-full shrink-0"></div>

				<div class="flex flex-col gap-4 shrink-0">
					<label
						class="text-xs font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">Konfigurasi
						Kuas</label>

					<div class="flex flex-col gap-1.5">
						<div class="flex justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
							<label>Ukuran Kuas</label>
							<span
								class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-800 dark:text-neutral-200 font-mono">{{
									options.size }}px</span>
						</div>
						<input type="range" min="4" max="64" step="1" v-model.number="options.size"
							class="w-full accent-neutral-800 dark:accent-neutral-200 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer" />
					</div>

					<div class="flex flex-col gap-1.5">
						<div class="flex justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
							<label>Efek Tekanan</label>
							<span
								class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-800 dark:text-neutral-200 font-mono">{{
									options.thinning }}</span>
						</div>
						<input type="range" min="-1" max="1" step="0.1" v-model.number="options.thinning"
							class="w-full accent-neutral-800 dark:accent-neutral-200 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer" />
					</div>

					<div class="flex flex-col gap-1.5">
						<div class="flex justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
							<label>Penstabil Garis</label>
							<span
								class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-800 dark:text-neutral-200 font-mono">{{
									options.streamline }}</span>
						</div>
						<input type="range" min="0" max="1" step="0.05" v-model.number="options.streamline"
							class="w-full accent-neutral-800 dark:accent-neutral-200 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer" />
					</div>

					<button @click="resetBrushOptions"
						class="w-full py-2 mt-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
						title="Kembalikan pengaturan kuas ke awal">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
							<path d="M3 3v5h5" />
						</svg>
						Reset Setelan Kuas
					</button>
				</div>

				<div class="h-[1px] bg-neutral-100 dark:bg-neutral-800 w-full shrink-0"></div>

				<div class="flex flex-col gap-2 shrink-0">
					<label
						class="text-xs font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">Warna
						Kuas</label>
					<div class="flex gap-3">
						<button v-for="color in brushColors" :key="color.value" @click="selectedColor = color.value"
							class="w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center"
							:style="{ backgroundColor: resolveColor(color.value), borderColor: selectedColor === color.value ? (isDarkMode ? '#525252' : '#d4d4d4') : 'transparent' }"
							:class="selectedColor === color.value ? 'scale-110 shadow-md outline outline-2 outline-offset-2 outline-neutral-300 dark:outline-neutral-600' : 'hover:scale-105 shadow-sm'"
							:title="color.name">
						</button>
					</div>
				</div>

				<div class="h-[1px] bg-neutral-100 dark:bg-neutral-800 w-full shrink-0"></div>

				<div class="flex flex-col gap-2 shrink-0">
					<label
						class="text-xs font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase">Buku
						Kotak Bantu</label>
					<div class="grid grid-cols-2 gap-2">
						<button @click="isGridActive = true"
							:class="['py-2 text-xs font-bold rounded-xl border transition-all', isGridActive ? 'bg-neutral-900 dark:bg-neutral-200 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-200' : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700']">
							Grid On
						</button>
						<button @click="isGridActive = false"
							:class="['py-2 text-xs font-bold rounded-xl border transition-all', !isGridActive ? 'bg-neutral-900 dark:bg-neutral-200 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-200' : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700']">
							Grid Off
						</button>
					</div>
				</div>
			</div>
		</aside>

		<main class="flex-1 h-full relative flex flex-col overflow-hidden">

			<div
				class="absolute top-4 right-4 z-20 flex flex-col landscape:flex-row md:flex-row items-end md:items-center gap-2 md:gap-3 pointer-events-none">

				<div id="toolbars-2"
					class="flex items-center bg-white/95 dark:bg-neutral-800/95 border border-neutral-200 dark:border-neutral-700 p-1 md:p-1.5 rounded-xl shadow-md backdrop-blur-sm gap-1.5 md:gap-2 pointer-events-auto">

					<button @click="isPenOnly = !isPenOnly"
						:class="['w-9 h-9 rounded-lg transition-colors flex items-center justify-center border shrink-0', isPenOnly ? 'bg-neutral-900 dark:bg-neutral-200 border-neutral-900 dark:border-neutral-200 text-white dark:text-neutral-900' : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-700']"
						:title="isPenOnly ? 'Mode Pen Saja Aktif (Abaikan Sentuhan Jari)' : 'Mode Bebas (Bisa Jari / Pen)'">
						<svg v-if="isPenOnly" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
							stroke-linecap="round" stroke-linejoin="round">
							<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
						</svg>
						<svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
							fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
							stroke-linejoin="round">
							<path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
							<path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
							<path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
							<path
								d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
						</svg>
					</button>

					<button @click="isShowWatermark = !isShowWatermark" :disabled="isChallengeMode"
						:class="['w-9 h-9 rounded-lg transition-colors flex items-center justify-center border shrink-0',
							isChallengeMode ? 'opacity-50 cursor-not-allowed' : '',
							isShowWatermark ? 'bg-neutral-900 dark:bg-neutral-200 border-neutral-900 dark:border-neutral-200 text-white dark:text-neutral-900' : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-700']"
						title="Toggle Bayangan Huruf">
						<svg v-if="isShowWatermark" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round">
							<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
							<circle cx="12" cy="12" r="3" />
						</svg>
						<svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
							fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
							stroke-linejoin="round">
							<path d="m2 2 20 20" />
							<path d="M6.71 6.71A10.61 10.61 0 0 0 2 12s3 7 10 7a10.54 10.54 0 0 0 5.39-1.5" />
							<path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
							<path d="M17.48 13.87A10.55 10.55 0 0 0 22 12s-3-7-10-7a10.5 10.5 0 0 0-4.48 1.02" />
						</svg>
					</button>

					<button @click="toggleDarkMode"
						class="w-9 h-9 rounded-lg transition-colors flex items-center justify-center border shrink-0 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
						:title="isDarkMode ? 'Mode Terang' : 'Mode Gelap'">
						<svg v-if="!isDarkMode" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
							stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
						</svg>
						<svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
							fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
							stroke-linejoin="round">
							<circle cx="12" cy="12" r="5"></circle>
							<line x1="12" y1="1" x2="12" y2="3"></line>
							<line x1="12" y1="21" x2="12" y2="23"></line>
							<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
							<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
							<line x1="1" y1="12" x2="3" y2="12"></line>
							<line x1="21" y1="12" x2="23" y2="12"></line>
							<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
							<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
						</svg>
					</button>

					<button @click="toggleFullscreen"
						:class="['w-9 h-9 rounded-lg transition-colors flex items-center justify-center border shrink-0', isFullscreen ? 'bg-neutral-900 dark:bg-neutral-200 border-neutral-900 dark:border-neutral-200 text-white dark:text-neutral-900' : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700']"
						:title="isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (Sembunyikan Address Bar)'">
						<svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
							viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
							stroke-linecap="round" stroke-linejoin="round">
							<path d="M8 3H5a2 2 0 0 0-2 2v3" />
							<path d="M21 8V5a2 2 0 0 0-2-2h-3" />
							<path d="M3 16v3a2 2 0 0 0 2 2h3" />
							<path d="M16 21h3a2 2 0 0 0 2-2v-3" />
						</svg>
						<svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
							fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
							stroke-linejoin="round">
							<path d="M8 3v3a2 2 0 0 1-2 2H3" />
							<path d="M21 8h-3a2 2 0 0 1-2-2V3" />
							<path d="M3 16h3a2 2 0 0 1 2 2v3" />
							<path d="M16 21v-3a2 2 0 0 1 2-2h3" />
						</svg>
					</button>

					<template v-if="true">
						<div class="w-[1px] h-5 bg-neutral-200 dark:bg-neutral-700 mx-1"></div>

						<button @click="prevPage" :disabled="currentIndex === 0 || !isShowWatermark || isChallengeMode"
							class="w-9 h-9 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
								stroke-linejoin="round">
								<path d="m15 18-6-6 6-6" />
							</svg>
						</button>

						<div class="px-1 text-xs font-bold text-neutral-800 dark:text-neutral-200 min-w-[30px] h-9 hidden sm:flex items-center justify-center transition-opacity"
							v-if="!isChallengeMode" :class="!isShowWatermark ? 'opacity-40' : ''">
							{{ currentIndex + 1 }}/{{ activeGroup.length }}
						</div>

						<button @click="nextPage"
							:disabled="currentIndex === activeGroup.length - 1 || !isShowWatermark || isChallengeMode"
							class="w-9 h-9 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
								fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
								stroke-linejoin="round">
								<path d="m9 18 6-6-6-6" />
							</svg>
						</button>
					</template>
				</div>

				<div id="toolbars-1"
					class="flex bg-white/95 dark:bg-neutral-800/95 border border-neutral-200 dark:border-neutral-700 p-1 md:p-1.5 rounded-xl shadow-md backdrop-blur-sm gap-1.5 pointer-events-auto">

					<button v-if="isChallengeMode" @click="isAnswerRevealed = !isAnswerRevealed" :class="[
						'h-9 rounded-lg transition-all flex items-center justify-center border shrink-0 text-xs font-bold gap-0 sm:gap-1.5 shadow-sm',
						'w-9 sm:w-auto sm:px-3',
						isAnswerRevealed ? 'bg-neutral-900 dark:bg-neutral-200 border-neutral-900 dark:border-neutral-200 text-white dark:text-neutral-900' : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'
					]" title="Lihat Jawaban">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
							<path d="M7 11V7a5 5 0 0 1 9.9-1" />
						</svg>
						<span class="hidden sm:inline-block">Cek Jawaban</span>
					</button>

					<button @click="toggleChallengeMode" :class="[
						'h-9 rounded-lg transition-colors flex items-center justify-center border shrink-0 text-xs font-bold gap-0 sm:gap-1.5',
						'w-9 sm:w-auto sm:px-3',
						isChallengeMode ? 'bg-neutral-900 dark:bg-neutral-200 border-neutral-900 dark:border-neutral-200 text-white dark:text-neutral-900 shadow-inner' : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
					]" title="Mode Tantangan (Acak Urutan & Tampilan)">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<rect width="20" height="12" x="2" y="6" rx="2" />
							<path d="M6 12h4" />
							<path d="M8 10v4" />
							<path d="M15 13h.01" />
							<path d="M18 11h.01" />
						</svg>
						<span class="hidden sm:inline-block">Challenge</span>
					</button>
				</div>

			</div>

			<div class="relative flex-1 w-full h-full">
				<div :class="[
					'absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 p-4 pt-16 pb-20 md:p-12 overflow-hidden transition-opacity duration-300',
					isShowWatermark ? 'opacity-100' : 'opacity-0'
				]">

					<div
						class="flex flex-wrap justify-center gap-4 md:gap-8 w-full max-w-sm sm:max-w-md md:max-w-5xl landscape:max-w-3xl landscape:md:max-w-5xl">

						<div v-for="(item, index) in activeGroup" :key="index" :class="[
							/* Container utama (tetap sama) */
							'w-[28%] landscape:w-[16%] md:w-[16%] aspect-square flex flex-col items-center justify-center rounded-3xl transition-all duration-300',
							currentIndex === index && !isChallengeMode
								? 'scale-110'
								: 'scale-100 opacity-60'
						]">

							<div :class="[
								'relative flex items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 border-2',
								/* Jika Kana sedang disembunyikan/ditanyakan -> Munculkan border dashed */
								(isChallengeMode && item.showType === 'romaji' && !isAnswerRevealed)
									? 'border-dashed border-neutral-300 dark:border-neutral-600 bg-neutral-100/50 dark:bg-neutral-800/50'
									: 'border-transparent' // Border transparan agar layout tidak lompat saat border muncul
							]">
								<span :class="[
									'font-medium font-sans leading-none transition-all duration-300 text-center',
									currentIndex === index && !isChallengeMode
										? 'text-6xl sm:text-7xl md:text-8xl lg:text-[140px] landscape:text-5xl landscape:md:text-8xl text-neutral-400 dark:text-neutral-500 font-semibold'
										: 'text-6xl sm:text-7xl md:text-8xl lg:text-[140px] landscape:text-5xl landscape:md:text-8xl text-neutral-500/40 dark:text-neutral-600/30 font-semibold',
									(isChallengeMode && item.showType === 'romaji' && !isAnswerRevealed) ? 'opacity-0' : 'opacity-100'
								]">
									{{ item.kana }}
								</span>

								<span v-if="isChallengeMode && item.showType === 'romaji' && !isAnswerRevealed"
									class="absolute inset-0 flex items-center justify-center font-medium font-sans leading-none text-6xl sm:text-7xl md:text-8xl lg:text-[140px] landscape:text-5xl landscape:md:text-8xl text-neutral-400 dark:text-neutral-500 font-semibold">
									?
								</span>
							</div>

							<div :class="[
								'relative flex items-center justify-center px-3 py-1.5 mt-2 md:mt-6 rounded-xl transition-all duration-300 border-2',
								/* Jika Romaji sedang disembunyikan/ditanyakan -> Munculkan border dashed */
								(isChallengeMode && item.showType === 'kana' && !isAnswerRevealed)
									? 'border-dashed border-neutral-300 dark:border-neutral-600 bg-neutral-100/50 dark:bg-neutral-800/50'
									: 'border-transparent'
							]">
								<span :class="[
									'font-mono font-bold tracking-wide transition-all duration-300 leading-none text-center',
									currentIndex === index && !isChallengeMode
										? 'text-xl sm:text-2xl lg:text-4xl landscape:text-lg landscape:md:text-4xl text-neutral-400 dark:text-neutral-500'
										: 'text-xl sm:text-2xl lg:text-4xl landscape:text-lg landscape:md:text-4xl text-neutral-500/40 dark:text-neutral-500',
									(isChallengeMode && item.showType === 'kana' && !isAnswerRevealed) ? 'opacity-0' : 'opacity-100'
								]">
									{{ item.romaji }}
								</span>

								<span v-if="isChallengeMode && item.showType === 'kana' && !isAnswerRevealed"
									class="absolute inset-0 flex items-center justify-center font-mono font-bold tracking-wide text-xl sm:text-2xl lg:text-4xl landscape:text-lg landscape:md:text-4xl text-neutral-400 dark:text-neutral-500">
									?
								</span>
							</div>

						</div>

					</div>
				</div>

				<svg @pointerdown="handlePointerDown" @pointermove="handlePointerMove" @pointerup="handlePointerUp"
					@contextmenu.prevent="() => false"
					class="w-full h-full bg-transparent cursor-crosshair relative z-10 touch-none canvas-area"
					style="touch-action: none;">
					<defs v-if="isGridActive">
						<pattern id="full-canvas-grid" width="40" height="40" patternUnits="userSpaceOnUse">
							<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor"
								class="text-neutral-500/30 dark:text-neutral-400/20" stroke-width="1" />
						</pattern>
					</defs>
					<rect v-if="isGridActive" width="100%" height="100%" fill="url(#full-canvas-grid)"
						pointer-events-none />

					<path v-for="(line, index) in completedLines" :key="index" :d="line.path"
						:fill="resolveColor(line.color)" />
					<path v-if="points.length > 0" :d="pathData" :fill="resolveColor(selectedColor)" />
				</svg>
			</div>

			<div
				class="absolute bottom-4 left-0 right-0 px-4 md:px-6 z-20 flex flex-col md:flex-row-reverse items-center justify-center md:justify-between gap-4 pointer-events-none">
				<div class="flex items-center gap-2 shrink-0 pointer-events-auto">
					<button @click="prevGroup" :disabled="currentGroupIndex === 0"
						class="w-10 h-10 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-full shadow-md transition-colors flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0"
						title="Baris Sebelumnya">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="m15 18-6-6 6-6" />
						</svg>
					</button>

					<div
						class="bg-neutral-900/80 dark:bg-neutral-800/80 text-white text-xs px-4 py-2.5 rounded-full backdrop-blur-sm shadow flex items-center gap-2 shrink-0 border border-transparent dark:border-neutral-700">
						<span class="font-bold text-neutral-300 pr-2 border-r border-neutral-600">{{ selectedGroup
							}}</span>
						<span>Guratan: <span class="font-bold text-yellow-400">{{ completedLines.length }}</span></span>
					</div>

					<button @click="nextGroup" :disabled="currentGroupIndex === groupKeys.length - 1"
						class="w-10 h-10 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-full shadow-md transition-colors flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0"
						title="Baris Selanjutnya">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
							stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="m9 18 6-6-6-6" />
						</svg>
					</button>
				</div>

				<a href="https://www.instagram.com/encang_cutbray/" target="_blank" rel="noopener noreferrer"
					class="group flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 rounded-full md:rounded-xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm md:bg-neutral-100 md:dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 hover:border-pink-300 dark:hover:border-pink-800 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-sm transition-all duration-300 shrink-0 pointer-events-auto">

					<div class="flex items-center gap-1">
						<span
							class="text-xs font-bold leading-none text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
							@encang_cutbray
						</span>
					</div>
				</a>
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

:fullscreen {
	background-color: #fbfbfb;
}

.dark :fullscreen {
	background-color: #0a0a0a;
}

.canvas-area {
	touch-action: none;
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	user-select: none;
}
</style>
