import { defineStore } from 'pinia'
import Cookies from 'js-cookie'
import { getLanguage } from '@/lang/index'

function desktopSidebarOpen() {
  return Cookies.get('sidebarStatus') !== '0'
}

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: {
      opened: desktopSidebarOpen(),
      withoutAnimation: false
    },
    device: 'desktop',
    language: getLanguage(),
    size: Cookies.get('size') || 'medium'
  }),
  getters: {
    isMobile: (state) => state.device === 'mobile',
    isTablet: (state) => state.device === 'tablet',
    isDesktop: (state) => state.device === 'desktop'
  },
  actions: {
    toggleSideBar() {
      this.sidebar.opened = !this.sidebar.opened
      this.sidebar.withoutAnimation = false
      if (this.device === 'desktop') {
        Cookies.set('sidebarStatus', this.sidebar.opened ? 1 : 0)
      }
    },
    closeSideBar({ withoutAnimation }) {
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = withoutAnimation
    },
    toggleDevice(device) {
      if (this.device === device) return
      this.device = device
      this.sidebar.opened = device === 'desktop' && desktopSidebarOpen()
      this.sidebar.withoutAnimation = true
    },
    setLanguage(language) {
      this.language = language
      Cookies.set('language', language)
    },
    setSize(size) {
      this.size = size
      Cookies.set('size', size)
    }
  }
})
