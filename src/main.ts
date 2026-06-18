import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import './tailwind.css'
import App from './App.vue'
import { router } from './routes'

const app = createApp(App)

const head = createHead()

app.use(head)
app.use(router)
app.mount('#app')
