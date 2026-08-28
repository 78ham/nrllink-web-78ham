import { createApp } from 'vue'
import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import 'virtual:svg-icons-register'
import './styles/element-variables.scss'
import {
  CaretBottom,
  Clock,
  Close,
  Delete,
  Document,
  Download,
  Edit,
  Search,
  Setting,
  Share,
  Upload
} from '@element-plus/icons-vue'

// unplugin-vue-components does not resolve @element-plus/icons-vue,
// so the icons used in templates are registered globally here.
const globalIcons = {
  CaretBottom,
  Clock,
  Close,
  Delete,
  Document,
  Download,
  Edit,
  Search,
  Setting,
  Share,
  Upload
}

import '@/styles/index.scss' // global css

import App from './App.vue'
import router from './router'
import { setupStore } from './store'
import { pinia } from './store'
import { useSettingsStore } from '@/store/modules/settings'

import i18n from './lang' // internationalization
import { setupIcons } from './icons' // icon
import './permission' // permission control
import { setupErrorLog } from './utils/error-log' // error log
import { setElementPlusTheme, setPlatformTheme } from './utils/theme'

import * as filters from './filters' // global filters

// import Print from 'vue-print-nb'
// import 'default-passive-events'

/**
 * If you don't want to use mock-server
 * you want to use mockjs for request interception
 * you can execute:
 *
 * import { mockXHR } from '../mock'
 * mockXHR()
 */

const app = createApp(App)

Object.entries(globalIcons).forEach(([name, component]) => {
  app.component(name, component)
})

setupStore(app)
setupIcons(app)
app.use(router)
app.use(i18n)
setupErrorLog(app)

const settingsStore = useSettingsStore(pinia)
setElementPlusTheme(settingsStore.theme)
setPlatformTheme(settingsStore.platformThemeKey)

// register global utility filters (Vue3 removes template filters, use $filters)
app.config.globalProperties.$filters = filters

app.mount('#app')
