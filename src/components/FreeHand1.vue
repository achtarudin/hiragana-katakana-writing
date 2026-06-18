<script lang="ts" setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "../utils/util";

type Point = [number, number, number]

// DEFINISI PROPS: Menerima database dinamis dari komponen induk (parent)
const props = defineProps<{
	database: Record<string, Array<{ kana: string; romaji: string }>>
}>()

type GroupKey = string;

// 2. STATE UTAMA APLIKASI (Menggunakan props.database secara dinamis)
const selectedGroup = ref<GroupKey>(Object.keys(props.database)[0])
const currentIndex = ref(0)
const isSidebarOpen = ref(true)

const currentGroup = computed(() => props.database[selectedGroup.value] || [])

// Watcher untuk mereset indeks jika grup baris diubah lewat sidenav
watch(selectedGroup, () => {
	currentIndex.value = 0
	clearCanvas()
})

// Otomatis update pilihan grup default jika data internal props.database berganti (misal saat pindah route)
watch(() => props.database, (newDatabase) => {
	selectedGroup.value = Object.keys(newDatabase)[0]
	currentIndex.value = 0
	clearCanvas()
}, { deep: true })

watch(currentIndex, () => {
	clearCanvas()
})

const options = reactive({
	size: 10,
	smoothing: 0.5,
	thinning: 0.5,
	streamline: 0.65,
	easing: (t: number) => t,
	start: { taper: 0, cap: true },
	end: { taper: 0, cap: true },
});

onMounted(() => {
	if (window.innerWidth < 768) {
		options.size = 5;
	}
})

const completedLines = ref<string[]>([])
const points = ref<Point[]>([])
const isGridActive = ref(false)

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
	<div
		class="relative w-full h-screen bg-neutral-50 overflow-hidden select-none flex flex-row font-sans text-neutral-800">

		<button @click="isSidebarOpen = !isSidebarOpen"
			class="absolute top-4 left-4 z-40 p-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl shadow-md hover:bg-neutral-50 transition-all active:scale-95 flex items-center justify-center pointer-events-auto"
			title="Toggle Menu">
			<span v-if="!isSidebarOpen" class="text-xl leading-none">☰</span>
			<span v-else class="text-xl leading-none">✕</span>
		</button>

		<div v-if="isSidebarOpen" @click="isSidebarOpen = false"
			class="absolute inset-0 bg-black/20 backdrop-blur-xs z-30 lg:hidden"></div>

		<aside :class="[
			'absolute top-0 left-0 bottom-0 w-80 bg-white border-r border-neutral-200 z-30 shadow-2xl lg:shadow-md flex flex-col transition-transform duration-300 ease-in-out pointer-events-auto',
			isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
		]">
			<div class="h-18 shrink-0"></div>

			<div class="px-4 py-2 flex gap-2">
				<RouterLink to="/" class="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
					:class="$route.path === '/' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'">
					Home
				</RouterLink>

				<RouterLink to="/hiragana" class="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
					:class="$route.path.startsWith('/hiragana') ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'">
					Hiragana
				</RouterLink>

				<RouterLink to="/katakana" class="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
					:class="$route.path.startsWith('/katakana') ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'">
					Katakana
				</RouterLink>
			</div>

			<div class="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scrollbar-none pb-10">
				<div class="flex flex-col gap-2 shrink-0">
					<label class="text-xs font-bold text-neutral-400 tracking-wider uppercase">Pilih Baris Kana</label>
					<div class="relative w-full shrink-0">
						<select v-model="selectedGroup"
							class="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold pl-3 pr-10 py-2.5 rounded-xl border border-transparent outline-none text-sm cursor-pointer transition-colors focus:border-neutral-400 appearance-none">
							<option v-for="(_, key) in props.database" :key="key" :value="key">
								{{ key }}
							</option>
						</select>
						<div
							class="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-neutral-500 text-xs">
							▼
						</div>
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
							<span
								:class="['text-[10px] font-mono font-medium tracking-normal leading-none mt-0.5', currentIndex === index ? 'text-neutral-300' : 'text-neutral-400']">
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
							<span class="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 font-mono">{{ options.size
							}}px</span>
						</div>
						<input type="range" min="4" max="64" step="1" v-model.number="options.size"
							class="w-full accent-neutral-800 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
					</div>
					<div class="flex flex-col gap-1.5">
						<div class="flex justify-between text-xs font-semibold text-neutral-600">
							<label>Efek Tekanan (Thinning)</label>
							<span class="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 font-mono">{{
								options.thinning }}</span>
						</div>
						<input type="range" min="-1" max="1" step="0.1" v-model.number="options.thinning"
							class="w-full accent-neutral-800 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
					</div>
					<div class="flex flex-col gap-1.5">
						<div class="flex justify-between text-xs font-semibold text-neutral-600">
							<label>Penstabil Garis</label>
							<span class="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 font-mono">{{
								options.streamline }}</span>
						</div>
						<input type="range" min="0" max="1" step="0.05" v-model.number="options.streamline"
							class="w-full accent-neutral-800 h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
					</div>
				</div>

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
			<div
				class="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto bg-white/95 border border-neutral-200 p-1.5 rounded-xl shadow-md backdrop-blur-sm">
				<button @click="prevPage" :disabled="currentIndex === 0"
					class="w-9 h-9 bg-neutral-50 border border-neutral-200 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors font-bold flex items-center justify-center">◀</button>
				<button @click="nextPage" :disabled="currentIndex === currentGroup.length - 1"
					class="w-9 h-9 bg-neutral-50 border border-neutral-200 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors font-bold flex items-center justify-center">▶</button>
				<div class="w-[1px] h-5 bg-neutral-200 mx-1"></div>
				<button @click="undoLast" :disabled="completedLines.length === 0"
					class="px-3 h-9 bg-white border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-700 font-bold rounded-lg transition-colors text-xs flex items-center justify-center">Undo</button>
				<button @click="clearCanvas" :disabled="completedLines.length === 0 && points.length === 0"
					class="px-3 h-9 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors text-xs flex items-center justify-center">Reset</button>
			</div>

			<div class="relative flex-1 w-full h-full">
				<!-- KONTEN WATERMARK LATAR BELAKANG YANG DINAMIS & RESPONSIF -->
				<div
					class="absolute inset-0 flex flex-row flex-wrap items-center justify-center content-center gap-x-4 gap-y-6 md:gap-x-8 md:gap-y-8 pointer-events-none select-none z-0 p-6 pt-16 pb-6 md:px-16 overflow-hidden">

					<div v-for="(item, index) in currentGroup" :key="index" :class="[
						'flex flex-col items-center justify-center transition-all duration-300 select-none',
						// Jika jumlah huruf <= 3 (seperti baris Ya, Yu, Yo), beri ruang lebih lebar.
						// Jika jumlah huruf 5, batasi lebar dasar per item agar otomatis melakukan wrap (pindah baris) di layar portrait tipis.
						currentGroup.length <= 3
							? 'w-[28%] sm:w-[20%] md:w-[16%]'
							: 'w-[28%] sm:w-[25%] md:w-[15%] lg:w-[14%]'
					]">

						<!-- Ukuran teks disesuaikan menggunakan clamp atau bertingkat agar tidak meluber saat patah menjadi 2 baris -->
						<span :class="[
							'font-medium font-sans leading-none transition-all duration-300 text-center',
							currentIndex === index
								? 'text-[10vh] sm:text-[14vh] md:text-[16vh] lg:text-[18vh] text-neutral-400 font-semibold'
								: 'text-[10vh] sm:text-[14vh] md:text-[16vh] lg:text-[18vh] text-neutral-400/25 font-semibold'
						]">
							{{ item.kana }}
						</span>

						<span :class="[
							'font-mono font-bold tracking-wide transition-all duration-300 leading-none mt-1 md:mt-3 text-center',
							currentIndex === index
								? 'text-[3.5vh] sm:text-[4vh] lg:text-[5vh] text-black'
								: 'text-[3.5vh] sm:text-[4vh] lg:text-[5vh] text-neutral-400/25'
						]">
							{{ item.romaji }}
						</span>
					</div>

				</div>
				<div v-if="false"
					class="absolute inset-0 grid grid-cols-2 grid-rows-3 gap-4 md:gap-8 items-center justify-items-center justify-center pointer-events-none select-none z-0 p-6 pt-16 pb-6 md:py-6 md:grid-cols-5 md:grid-rows-1 md:px-24 overflow-hidden">
					<div v-for="(item, index) in currentGroup" :key="index" :class="[
						'flex flex-col items-center justify-center transition-all duration-300 select-none w-full',
						currentIndex === index ? 'scale-105' : 'opacity-60 md:opacity-100'
					]">
						<span
							:class="['font-medium font-sans leading-none transition-all duration-300 text-center', currentIndex === index ? 'text-[14vh] md:text-[16vh] lg:text-[20vh] text-neutral-400 font-semibold' : 'text-[14vh] md:text-[16vh] lg:text-[20vh] text-neutral-400/25 font-semibold']">
							{{ item.kana }}
						</span>
						<span
							:class="['font-mono font-bold tracking-wide transition-all duration-300 leading-none mt-1 md:mt-3 text-center', currentIndex === index ? 'text-[4vh] lg:text-[6vh] text-black' : 'text-[4vh] lg:text-[6vh] text-neutral-400/25']">
							{{ item.romaji }}
						</span>
					</div>
				</div>

				<svg @pointerdown="handlePointerDown" @pointermove="handlePointerMove" @pointerup="handlePointerUp"
					class="w-full h-full bg-transparent cursor-crosshair relative z-10 touch-none"
					style="touch-action: none;">
					<defs v-if="isGridActive">
						<pattern id="full-canvas-grid" width="40" height="40" patternUnits="userSpaceOnUse">
							<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" class="text-neutral-300/30"
								stroke-width="1" />
						</pattern>
					</defs>
					<rect v-if="isGridActive" width="100%" height="100%" fill="url(#full-canvas-grid)"
						pointer-events-none />
					<path v-for="(path, index) in completedLines" :key="index" :d="path" fill="black" />
					<path v-if="points.length > 0" :d="pathData" fill="black" />
				</svg>
			</div>

			<div
				class="absolute bottom-4 left-4 bg-neutral-900/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none z-20 shadow">
				Jumlah Guratan: <span class="font-bold text-yellow-400">{{ completedLines.length }}</span>
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
</style>
