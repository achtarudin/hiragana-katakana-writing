<script setup lang="ts">
import FreeHand from '../components/FreeHand.vue'
const katakanaDatabase = {
    "Baris Vokal (a, i, u, e, o)": [
        { "kana": "ア", "romaji": "a" }, { "kana": "イ", "romaji": "i" }, { "kana": "ウ", "romaji": "u" }, { "kana": "エ", "romaji": "e" }, { "kana": "オ", "romaji": "o" }
    ],
    "Baris K (ka, ki, ku, ke, ko)": [
        { "kana": "カ", "romaji": "ka" }, { "kana": "キ", "romaji": "ki" }, { "kana": "ク", "romaji": "ku" }, { "kana": "ケ", "romaji": "ke" }, { "kana": "コ", "romaji": "ko" }
    ],
    "Baris S (sa, shi, su, se, so)": [
        { "kana": "サ", "romaji": "sa" }, { "kana": "シ", "romaji": "shi" }, { "kana": "ス", "romaji": "su" }, { "kana": "セ", "romaji": "se" }, { "kana": "ソ", "romaji": "so" }
    ],
    "Baris T (ta, chi, tsu, te, to)": [
        { "kana": "タ", "romaji": "ta" }, { "kana": "チ", "romaji": "chi" }, { "kana": "ツ", "romaji": "tsu" }, { "kana": "テ", "romaji": "to" }, { "kana": "ト", "romaji": "to" }
    ],
    "Baris N (na, ni, nu, ne, no)": [
        { "kana": "ナ", "romaji": "na" }, { "kana": "ニ", "romaji": "ni" }, { "kana": "ヌ", "romaji": "nu" }, { "kana": "ネ", "romaji": "ne" }, { "kana": "ノ", "romaji": "no" }
    ],
    "Baris H (ha, hi, fu, he, ho)": [
        { "kana": "ハ", "romaji": "ha" }, { "kana": "ヒ", "romaji": "hi" }, { "kana": "フ", "romaji": "fu" }, { "kana": "ヘ", "romaji": "he" }, { "kana": "ホ", "romaji": "ho" }
    ],
    "Baris M (ma, mi, mu, me, mo)": [
        { "kana": "マ", "romaji": "ma" }, { "kana": "ミ", "romaji": "mi" }, { "kana": "ム", "romaji": "mu" }, { "kana": "メ", "romaji": "me" }, { "kana": "モ", "romaji": "mo" }
    ],
    "Baris Y (ya, yu, yo)": [
        { "kana": "ヤ", "romaji": "ya" }, { "kana": "ユ", "romaji": "yu" }, { "kana": "ヨ", "romaji": "yo" }
    ],
    "Baris R (ra, ri, ru, re, ro)": [
        { "kana": "ラ", "romaji": "ra" }, { "kana": "リ", "romaji": "ri" }, { "kana": "ル", "romaji": "ru" }, { "kana": "レ", "romaji": "re" }, { "kana": "ロ", "romaji": "ro" }
    ],
    "Baris W & N (wa, wo, n)": [
        { "kana": "ワ", "romaji": "wa" }, { "kana": "ヲ", "romaji": "wo" }, { "kana": "ン", "romaji": "n" }
    ]
}
</script>

<template>
  <FreeHand :database="katakanaDatabase" />
</template>
