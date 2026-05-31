<template>
  <el-config-provider :size="elementSize" :locale="elementLocale">
    <div id="app" :class="{ 'is-mobile': isMobile }">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script>
import Cookies from 'js-cookie'
import elementEnLocale from 'element-plus/es/locale/lang/en'
import elementZhLocale from 'element-plus/es/locale/lang/zh-cn'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { computed } from 'vue'

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
      return this.$attrs && false // placeholder
    }
  },
  mounted() {
    this.registerServiceWorker()
  },
  methods: {
    registerServiceWorker() {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(() => {
            // SW registration failed, ignore silently
          })
        })
      }
    }
  }
}
</script>
