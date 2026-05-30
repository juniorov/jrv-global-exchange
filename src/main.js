import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')

// Register service worker (handled by vite-plugin-pwa)
