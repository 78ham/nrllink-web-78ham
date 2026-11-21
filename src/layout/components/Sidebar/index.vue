<template>
  <div class="sidebar-wrapper-inner" :class="{'has-logo': showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        background-color="var(--sidebar-bg)"
        text-color="var(--sidebar-text)"
        :unique-opened="false"
        active-text-color="var(--sidebar-active-text)"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in permission_routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>

    <div class="sidebar-rail-footer" :class="{ 'is-collapsed': isCollapse }">
      <router-link to="/profile/index" class="rail-user-info" :title="name || callsign">
        <img :src="avatar + '?imageView2/1/w/80/h/80'" class="rail-avatar" alt="">
        <div v-if="!isCollapse" class="rail-user-meta">
          <span class="rail-user-name">{{ name || 'HAM' }}</span>
          <span class="rail-user-callsign">{{ callsign || $t('route.profile') }}</span>
        </div>
      </router-link>
      <button
        type="button"
        class="rail-logout-action"
        :title="$t('navbar.logOut')"
        :aria-label="$t('navbar.logOut')"
        @click="logout"
      >
        <el-icon class="rail-logout-icon"><SwitchButton /></el-icon>
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { pinia } from '@/store'
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useSettingsStore } from '@/store/modules/settings'
import { useUserStore } from '@/store/modules/user'
import { SwitchButton } from '@element-plus/icons-vue'

export default {
  components: { SidebarItem, Logo, SwitchButton },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const permissionStore = usePermissionStore(pinia)
    const appStore = useAppStore(pinia)
    const settingsStore = useSettingsStore(pinia)
    const userStore = useUserStore(pinia)

    const activeMenu = computed(() => {
      const { meta, path } = route
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    })

    const sidebar = computed(() => appStore.sidebar)
    const permission_routes = computed(() => permissionStore.routes)
    const sidebarLogo = computed(() => settingsStore.sidebarLogo)
    const isCollapse = computed(() => !sidebar.value.opened)
    const name = computed(() => userStore.name)
    const callsign = computed(() => userStore.callsign)
    const avatar = computed(() => userStore.avatar)

    const logout = async() => {
      await userStore.logout()
      router.push(`/login?redirect=${route.fullPath}`)
    }

    return {
      activeMenu,
      permission_routes,
      showLogo: sidebarLogo,
      isCollapse,
      name,
      callsign,
      avatar,
      logout
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar-wrapper-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--sidebar-bg);

  .scrollbar-wrapper {
    flex: 1 1 0;
    min-height: 0;
  }
}

.sidebar-rail-footer {
  flex: 0 0 auto;
  border-top: 1px solid var(--platform-border);
  background: var(--sidebar-bg);
  padding: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;

  &.is-collapsed {
    flex-direction: column;
    padding: 8px 6px 12px;

    .rail-user-info {
      width: 38px;
      height: 38px;
      padding: 0;
      justify-content: center;
      background: transparent;
      border-color: transparent;
    }
  }
}

.rail-user-info {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  flex: 1;
  padding: 4px 6px;
  border-radius: 10px;
  background: var(--platform-surface-soft);
  border: 1px solid var(--platform-border-light);
  text-decoration: none;
  color: inherit;

  &:hover {
    border-color: var(--platform-border-strong);
  }

  .rail-avatar {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid var(--platform-border);
  }

  .rail-user-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;

    .rail-user-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--platform-ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }

    .rail-user-callsign {
      font-size: 11px;
      color: var(--platform-ink-dim);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
  }
}

.rail-logout-action {
  appearance: none;
  border: 1px solid var(--platform-border);
  border-radius: 10px;
  background: transparent;
  color: var(--platform-ink-dim);
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex: 0 0 auto;
  cursor: pointer;
  outline: none;

  .rail-logout-icon {
    font-size: 16px;
  }

  &:hover {
    border-color: rgba(239, 68, 68, 0.45);
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
  }
}
</style>
