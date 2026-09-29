<template>
  <el-config-provider :size="elementSize" :locale="elementLocale">
    <div id="app">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script>
import Cookies from 'js-cookie'
import elementEnLocale from 'element-plus/es/locale/lang/en'
import elementZhLocale from 'element-plus/es/locale/lang/zh-cn'
import { ElMessageBox } from 'element-plus'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'

export default {
  name: 'App',
  computed: {
    ...mapState(useAppStore, ['size', 'language']),
    elementSize() {
      const sizeMap = {
        large: 'large',
        medium: 'default',
        small: 'small',
        default: 'default',
        '': 'default'
      }
      const rawSize = this.size || Cookies.get('size') || 'default'
      return sizeMap[rawSize] || 'default'
    },
    elementLocale() {
      return this.language === 'zh' ? elementZhLocale : elementEnLocale
    },
    isMobile() {
      return false
    }
  },
  mounted() {
    this.registerServiceWorker()
  },
  methods: {
    registerServiceWorker() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          // 新版本安装就绪时提示用户刷新（skipWaiting 下新 SW 会接管，
          // 但已打开的页面仍运行旧资源，需要主动 reload）
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (!newWorker) return
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.promptForRefresh()
              }
            })
          })
        }).catch(() => {})
      }
    },
    promptForRefresh() {
      ElMessageBox.confirm(
        this.$t('app.newVersionAvailable'),
        this.$t('app.updateReady'),
        {
          confirmButtonText: this.$t('app.refreshNow'),
          cancelButtonText: this.$t('app.later'),
          type: 'info'
        }
      ).then(() => {
        window.location.reload()
      }).catch(() => {})
    }
  }
}
</script>
