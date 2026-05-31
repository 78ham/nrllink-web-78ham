<template>
  <nav v-if="isMobile" class="mobile-tabbar">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="tabbar-item"
      :class="{ active: isActive(tab.path) }"
    >
      <span class="tabbar-icon">{{ tab.icon }}</span>
      <span class="tabbar-label">{{ $t(tab.label) || tab.fallback }}</span>
    </router-link>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'

export default {
  name: 'MobileTabBar',
  setup() {
    const route = useRoute()
    const appStore = useAppStore()

    const isMobile = computed(() => appStore.device === 'mobile')

    const tabs = [
      { path: '/dashboard', icon: '🏠', label: 'route.dashboard', fallback: '首页' },
      { path: '/pub/totaldevices', icon: '📡', label: 'route.totaldevices', fallback: '设备' },
      { path: '/pub/groups', icon: '👥', label: 'route.grouproom', fallback: '群组' },
      { path: '/pub/relay', icon: '🗼', label: 'route.relay', fallback: '中继' },
      { path: '/profile/index', icon: '👤', label: 'route.profile', fallback: '我的' }
    ]

    const isActive = (path) => {
      return route.path === path || route.path.startsWith(path + '/')
    }

    return { isMobile, tabs, isActive }
  }
}
</script>

<style lang="scss" scoped>
.mobile-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  height: 56px;
  height: calc(56px + var(--sab, 0px));
  padding-bottom: var(--sab, 0px);
  background: var(--platform-deep-98, rgba(10, 23, 41, 0.98));
  border-top: 1px solid var(--platform-border, rgba(104, 176, 255, 0.14));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.3);
  user-select: none;
  -webkit-user-select: none;
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  color: var(--platform-ink-dim, rgba(228, 239, 255, 0.56));
  transition: color 0.2s, transform 0.15s;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  min-height: 48px;

  &.active {
    color: var(--platform-accent, #8ff9de);

    .tabbar-icon {
      transform: scale(1.15);
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 25%;
      right: 25%;
      height: 2px;
      background: linear-gradient(90deg, var(--platform-accent, #8ff9de), var(--platform-accent-2, #3f8dff));
      border-radius: 0 0 4px 4px;
    }
  }

  &:active {
    transform: scale(0.92);
  }
}

.tabbar-icon {
  font-size: 22px;
  line-height: 1;
  transition: transform 0.2s;
}

.tabbar-label {
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.02em;
}
</style>
