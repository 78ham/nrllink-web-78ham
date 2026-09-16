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
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.$_resizeHandler, { passive: true })
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.$_resizeHandler)
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.$_resizeHandler)
    }
    if (rafId) {
      window.cancelAnimationFrame(rafId)
      rafId = null
    }
  },
  mounted() {
    this.$_applyDevice()
  },
  methods: {
    $_currentDevice() {
      return detectDevice()
    },
    $_applyDevice() {
      const appStore = useAppStore(pinia)
      const device = this.$_currentDevice()
      appStore.toggleDevice(device)
      if (device === DEVICE.MOBILE) {
        appStore.closeSideBar({ withoutAnimation: true })
      } else if (device === DEVICE.TABLET) {
        appStore.closeSideBar({ withoutAnimation: true })
      }
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
