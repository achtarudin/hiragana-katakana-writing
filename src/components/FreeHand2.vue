<script lang="ts" setup>
import { ref, computed, reactive } from 'vue'
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "../utils/util";

type Point = [number, number, number]

// Mengubah options menjadi reactive agar nilainya bisa diatur dari UI
const options = reactive({
    size: 16,
    smoothing: 0.5,
    thinning: 0.5,
    streamline: 0.65,
    easing: (t: number) => t,
    start: { taper: 0, cap: true },
    end: { taper: 0, cap: true },
});

// State untuk mengatur buka/tutup Modal Pengaturan
const isSettingsOpen = ref(false)

// STATE BARU: Huruf Hiragana/Katakana yang ingin dijadikan bayangan template
const currentKana = ref('さ')

function getCanvasCoordinates(e: PointerEvent): Point {
    const svgElement = e.currentTarget as SVGSVGElement;
    const rect = svgElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return [x, y, e.pressure];
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

const completedLines = ref<string[]>([])
const points = ref<Point[]>([])

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
    <div class="relative w-full h-screen bg-neutral-50 overflow-hidden select-none">

        <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
            <span class="text-[45vh] font-medium text-neutral-200/70 font-sans tracking-normal leading-none">
                {{ currentKana }}
            </span>
        </div>

        <svg
            @pointerdown="handlePointerDown"
            @pointermove="handlePointerMove"
            @pointerup="handlePointerUp"
            class="w-full h-full bg-transparent cursor-crosshair relative z-10"
            style="touch-action: none;"
        >
            <path v-for="(path, index) in completedLines" :key="index" :d="path" fill="black" />
            <path v-if="points.length > 0" :d="pathData" fill="black" />
        </svg>

        <div class="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button
                @click="isSettingsOpen = true"
                class="p-2.5 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-lg shadow-sm transition-colors"
                title="Pengaturan Kuas"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.767a1.123 1.123 0 0 0-.417 1.03c.004.074.006.148.006.222 0 .074-.002.148-.006.222a1.123 1.123 0 0 0 .417 1.03l1.003.767a1.125 1.125 0 0 1 .26 1.43l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.216-.456a1.125 1.125 0 0 0-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281a1.125 1.125 0 0 0-.646-.87a6.538 6.538 0 0 1-.218-.127a1.125 1.125 0 0 0-1.078-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.767a1.122 1.122 0 0 0 .416-1.03a6.57 6.57 0 0 1-.006-.222c0-.074.002-.148.006-.222a1.122 1.122 0 0 0-.416-1.03l-1.004-.767a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128c.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            </button>

            <button
                @click="undoLast"
                :disabled="completedLines.length === 0"
                class="px-4 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 font-semibold rounded-lg shadow-sm transition-colors text-sm flex items-center gap-1"
            >
                Undo
            </button>

            <button
                @click="clearCanvas"
                :disabled="completedLines.length === 0 && points.length === 0"
                class="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-sm transition-colors text-sm"
            >
                Reset
            </button>
        </div>

        <div class="absolute bottom-4 left-4 bg-neutral-900/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none z-20">
            Jumlah Guratan: <span class="font-bold text-yellow-400">{{ completedLines.length }}</span>
        </div>

        <div
            v-if="isSettingsOpen"
            class="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            @click.self="isSettingsOpen = false"
        >
            <div class="w-full max-w-sm bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden flex flex-col p-5 gap-4">
                <div class="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <h3 class="text-base font-bold text-neutral-800">Pengaturan Kuas</h3>
                    <button @click="isSettingsOpen = false" class="text-neutral-400 hover:text-neutral-600 font-bold p-1 text-sm">✕</button>
                </div>

                <div class="flex flex-col gap-4 py-2">
                    <div class="flex flex-col gap-1">
                        <div class="flex justify-between text-xs font-semibold text-neutral-600">
                            <label for="modal-brush-size">Ukuran Kuas</label>
                            <span class="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 font-mono">{{ options.size }}px</span>
                        </div>
                        <input id="modal-brush-size" type="range" min="4" max="64" step="1" v-model.number="options.size" class="w-full accent-neutral-800 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
                    </div>

                    <div class="flex flex-col gap-1">
                        <div class="flex justify-between text-xs font-semibold text-neutral-600">
                            <label for="modal-brush-thinning">Efek Tekanan (Thinning)</label>
                            <span class="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 font-mono">{{ options.thinning }}</span>
                        </div>
                        <input id="modal-brush-thinning" type="range" min="-1" max="1" step="0.1" v-model.number="options.thinning" class="w-full accent-neutral-800 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
                    </div>

                    <div class="flex flex-col gap-1">
                        <div class="flex justify-between text-xs font-semibold text-neutral-600">
                            <label for="modal-brush-streamline">Penstabil Garis (Streamline)</label>
                            <span class="bg-neutral-100 px-2 py-0.5 rounded text-neutral-800 font-mono">{{ options.streamline }}</span>
                        </div>
                        <input id="modal-brush-streamline" type="range" min="0" max="1" step="0.05" v-model.number="options.streamline" class="w-full accent-neutral-800 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                </div>

                <button @click="isSettingsOpen = false" class="w-full mt-2 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm rounded-lg shadow transition-colors">
                    Simpan & Tutup
                </button>
            </div>
        </div>

    </div>
</template>
