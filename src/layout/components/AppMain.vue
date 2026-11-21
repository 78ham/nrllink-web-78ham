<template>
  <section class="app-main">
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="key" />
        </keep-alive>
      </transition>
    </router-view>
  </section>
</template>

<script>
import { mapState } from 'pinia'
import { useTagsViewStore } from '@/store/modules/tagsView'

export default {
  name: 'AppMain',
  computed: {
    ...mapState(useTagsViewStore, ['cachedViews']),
    key() {
      return this.$route.fullPath
    }
  }
}
</script>

<style lang="scss" scoped>
.app-main {
  width: 100%;
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: var(--platform-deep-98);
  scrollbar-width: thin;
  scrollbar-color: var(--platform-border-strong) transparent;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--platform-border-strong);
    border-radius: 999px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--platform-ink-muted);
    background-clip: padding-box;
  }

  &::-webkit-scrollbar-corner {
    background: var(--platform-surface-soft);
  }
}

.hasTagsView {
  .app-main {
    flex: 1 1 auto;
    min-height: 0;
  }
}
</style>
