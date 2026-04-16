import { createApp } from 'vue'
import App from './App.vue'

// 全局样式
import './assets/styles/base.css'
import './assets/styles/theme.css'

// 引入 router（你已经做对了）
import router from './router'

// 创建应用
const app = createApp(App)

// 使用 router
app.use(router)

// 挂载
app.mount('#app')