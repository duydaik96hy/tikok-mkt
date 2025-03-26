import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus, { ElNotification } from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import http from './http'

const app = createApp(App)

app.config.globalProperties.$toPage = (path: string) => {
  router.push({ path })
}

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

export enum INotificationType {
  success = 'success',
  error = 'error',
  warning = 'warning',
}

function copy(val) {
  try {
    navigator.clipboard.writeText(val).then(() => {
      // copySuccess.value = trues
      setTimeout(() => {
        // copySuccess.value = false
      }, 2000)
    })
  } catch (e) {
    console.log(e)
    const textarea = document.createElement('textarea')
    textarea.readOnly = true
    textarea.style.position = 'absolute'
    textarea.style.left = '999999999999'
    textarea.value = val
    document.body.appendChild(textarea)
    textarea.select()
    textarea.setSelectionRange(0, val.length)
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

app.config.globalProperties.$copy = (text: string) => copy(text)

app.config.globalProperties.$notification = (type: INotificationType, message: string) => {
  ElNotification[type]({
    message,
    showClose: true,
    duration: 3000,
    customClass:
      type == INotificationType.success
        ? 'success-notify'
        : type == INotificationType.error
          ? 'error-notify'
          : 'warning-notify',
  })
}

app.config.globalProperties.$http = (type: 'POST' | 'GET', url: string, data) => {
  return http({ type, data, url })
}

app.use(createPinia())
app.use(i18n)
app.use(router)
app.use(ElementPlus)

app.mount('#app')
