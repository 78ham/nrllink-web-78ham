<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar v-if="device!=='mobile'" class="sidebar-container" />
    <div :class="{'hasTagsView':needTagsView,'is-mobile':device==='mobile'}" class="main-container">
      <div :class="{'fixed-header':fixedHeader}">
        <navbar />
        <tags-view v-if="needTagsView && device!=='mobile'" />
      </div>
      <app-main />
    </div>
    <mobile-tab-bar />
  </div>
</template>

<script>
// import RightPanel from '@/components/RightPanel'
import { AppMain, Navbar, Sidebar, TagsView } from './components'
import MobileTabBar from '@/components/MobileTabBar/index.vue'
import ResizeMixin from './mixin/ResizeHandler'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { useSettingsStore } from '@/store/modules/settings'

export default {
  name: 'Layout',
  components: {
    AppMain,
    Navbar,
    // RightPanel,
    // Settings,
    Sidebar,
    TagsView,
    MobileTabBar
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapState(useAppStore, ['sidebar', 'device']),
    ...mapState(useSettingsStore, ['showSettings', 'tagsView', 'fixedHeader']),
    needTagsView() {
      return this.tagsView && this.device !== 'mobile'
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  methods: {
    handleClickOutside() {
      const appStore = useAppStore()
      appStore.closeSideBar({ withoutAnimation: false })
    }
  }
}
</script>

<style lang="scss" scoped>
@use "@/styles/mixin.scss" as *;
@use "@/styles/variables.scss" as *;

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100vh;
  height: 100dvh;
  width: 100%;
  overflow: hidden;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.main-container {
  &.is-mobile {
    margin-left: 0 !important;
    width: 100% !important;
    padding-bottom: calc(56px + var(--sab, 0px));
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.fixed-header {
  position: relative;
  flex: 0 0 auto;
  top: 0;
  z-index: 9;
  width: 100%;
}
</style>
