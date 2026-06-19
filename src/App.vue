<script setup lang="ts">
import { Analytics } from '@vercel/analytics/vue';

import { useHead } from '@unhead/vue'
useHead({
	title: 'Nihon Moji | Belajar Hiragana, Katakana, Kanji',
	meta: [
		{ name: 'description', content: 'Aplikasi interaktif gratis untuk belajar, berlatih menulis, dan menguasai huruf Jepang: Hiragana, Katakana, dan Kanji.' },
		// Open Graph
		{ property: 'og:title', content: 'Nihon Moji - Belajar Huruf Jepang' },
		{ property: 'og:description', content: 'Kuasai Hiragana, Katakana, dan Kanji dengan mudah melalui kanvas interaktif.' },
		{ property: 'og:url', content: 'https://nihon-moji.vercel.app' },
		{ property: 'og:type', content: 'website' },
		{ property: 'og:image', content: 'https://nihon-moji.vercel.app/og-image.png' },
		{ property: 'og:locale', content: 'id_ID' }
	]
})

</script>
<template>
	<Analytics />
	<Suspense>
		<template #default>
			<RouterView />
		</template>
		<template #fallback>
			<div class="loading-placeholder"></div> <!-- Mencegah layout bergeser -->
		</template>
	</Suspense>
</template>
