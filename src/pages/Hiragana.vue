<script setup lang="ts">
import FreeHand from '../components/FreeHand.vue'

import { useHead } from '@vueuse/head'

useHead({
    title: 'Nihon Moji | Belajar Hiragana',
})

const hiraganaDatabase = {
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
</script>

<template>
  <FreeHand :database="hiraganaDatabase" />
</template>
