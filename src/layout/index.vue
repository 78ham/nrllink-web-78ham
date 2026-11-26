<template>
  <div :class="classObj" class="app-wrapper">
    <el-drawer
      v-if="device === 'mobile'"
      :model-value="sidebar.opened"
      :title="$t('navbar.navigation')"
      direction="ltr"
      size="min(84vw, 320px)"
      class="mobile-navigation"
      @update:model-value="closeMobileMenu"
    >
      <sidebar @click="onMenuClick" />
    </el-drawer>
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
        mobile: this.device === 'mobile',
        tablet: this.device === 'tablet'
      }
    }
  },
  methods: {
    onMenuClick(event) {
      if (event.target.closest('a[href]')) this.closeMobileMenu()
    },
    closeMobileMenu() {
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
}

.fixed-header {
  position: relative;
  flex: 0 0 auto;
  top: 0;
  z-index: 9;
  width: 100%;
}
</style>

<style lang="scss">
.el-drawer.mobile-navigation {
  --el-drawer-bg-color: var(--sidebar-bg);
  --el-drawer-padding-primary: 0;

  .el-drawer__header {
    margin: 0;
    padding: max(12px, var(--sat)) 16px 12px;
    color: var(--platform-ink);
    border-bottom: 1px solid var(--platform-border);
  }

  .el-drawer__body {
    min-height: 0;
    padding: 0 0 var(--sab);
  }
}
</style>
