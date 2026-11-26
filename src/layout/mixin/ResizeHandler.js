import { pinia } from '@/store'
import { useAppStore } from '@/store/modules/app'
import { detectDevice, DEVICE } from '@/utils/device'

let rafId = null

export default {
  watch: {
    $route() {
      const appStore = useAppStore(pinia)
      if (this.device === DEVICE.MOBILE && appStore.sidebar.opened) {
        appStore.closeSideBar({ withoutAnimation: false })
      }
    }
  },
  beforeMount() {
    window.addEventListener('resize', this.$_resizeHandler, { passive: true })
    this.$_applyDevice()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.$_resizeHandler)
    if (rafId) {
      window.cancelAnimationFrame(rafId)
      rafId = null
    }
  },
  methods: {
    $_currentDevice() {
      return detectDevice()
    },
    $_applyDevice() {
      const appStore = useAppStore(pinia)
      appStore.toggleDevice(this.$_currentDevice())
    },
    $_resizeHandler() {
      if (document.hidden) return
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = null
        this.$_applyDevice()
      })
    }
  }
}
