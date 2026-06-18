<script lang="ts" setup>
import { ref, computed } from 'vue'
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "../utils/util";

type Point = [number, number, number]

const options = {
    size: 16,
    smoothing: 0.5,
    thinning: 0.5,
    streamline: 0.5,
    easing: (t: number) => t,
    start: {
        taper: 0,
        cap: true,
    },
    end: {
        taper: 0,
        cap: true,
    },
};

// Array untuk menampung barisan garis yang SUDAH SELESAI digambar
const completedLines = ref<string[]>([])

// Array untuk menampung titik koordinat dari garis yang SEDANG AKTIF digambar
const points = ref<Point[]>([])

function handlePointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement
    target.setPointerCapture(e.pointerId)

    // Mulai garis baru tanpa menghapus completedLines
    points.value = [[e.pageX, e.pageY, e.pressure]]
}

function handlePointerMove(e: PointerEvent) {
    // Jika tombol kiri mouse / touch tidak ditekan, abaikan
    if (e.buttons !== 1) return

    // Menambahkan titik baru ke dalam array
    points.value = [...points.value, [e.pageX, e.pageY, e.pressure]]
}

// Fungsi saat jari/stylus diangkat (Garis Selesai)
function handlePointerUp() {
    if (points.value.length > 0) {
        const stroke = getStroke(points.value, options)
        const path = getSvgPathFromStroke(stroke)

        // Simpan path yang dihasilkan ke dalam riwayat
        completedLines.value.push(path)

        // Reset points aktif untuk bersiap membuat garis baru berikutnya
        points.value = []
    }
}

// Computed Property untuk menghitung garis aktif secara real-time
const pathData = computed(() => {
    if (points.value.length === 0) return ''
    const stroke = getStroke(points.value, options)
    return getSvgPathFromStroke(stroke)
})

// Fungsi untuk membuat tombol "Clear Canvas"
function clearCanvas() {
    completedLines.value = []
    points.value = []
}



</script>

<template>
    <div class="relative w-full h-screen">
        <svg
            @pointerdown="handlePointerDown"
            @pointermove="handlePointerMove"
            @pointerup="handlePointerUp"
            class="w-full h-full bg-neutral-50 cursor-crosshair border border-neutral-200"
            style="touch-action: none;"
        >
            <path v-for="(path, index) in completedLines" :key="index" :d="path" fill="black" />

            <path v-if="points.length > 0" :d="pathData" fill="black" />
        </svg>

        <button
            @click="clearCanvas"
            class="absolute top-4 right-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md shadow-sm transition-colors text-sm"
        >
            Reset
        </button>
    </div>
</template>
