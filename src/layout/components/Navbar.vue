<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggle-click="toggleSideBar"
    />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <div class="nav-user-pill desktop-only">
          <span class="user-pill-name">{{ name || 'HAM' }}</span>
          <span v-if="callsign" class="user-pill-callsign">{{ callsign }}</span>
        </div>

        <button
          v-if="billingEnabled"
          class="expire-toggle right-menu-item hover-effect desktop-only"
          :class="`expire-toggle--${expireLevel}`"
          :title="$t('navbar.renew')"
          @click="goRenew"
        >
          {{ expireText }}
        </button>

        <button class="lang-toggle right-menu-item hover-effect desktop-only" @click="toggleLanguage">
          {{ language === 'zh' ? 'EN' : '中' }}
        </button>

        <el-dropdown class="theme-picker-container right-menu-item hover-effect desktop-only" trigger="click" popper-class="platform-theme-user-dropdown">
          <div class="theme-trigger">
            <span class="theme-icon">{{ currentTheme.icon }}</span>
            <span class="theme-name">{{ currentTheme.name }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="(theme, key) in themes" :key="key" @click="switchTheme(key)">
                <span class="theme-option">
                  <span class="theme-option-icon">{{ theme.icon }}</span>
                  <span class="theme-option-name">{{ theme.name }}</span>
                  <el-icon v-if="platformThemeKey === key" class="theme-check"><Check /></el-icon>
                </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click" popper-class="platform-theme-user-dropdown">
          <div class="avatar-wrapper">
            <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar" alt="Avatar">
            <el-icon class="el-icon-caret-bottom">
              <CaretBottom />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <router-link to="/profile/index">
                <el-dropdown-item>{{ $t('navbar.profile') }}</el-dropdown-item>
              </router-link>
              <router-link to="/dashboard">
                <el-dropdown-item>{{ $t('navbar.dashboard') }}</el-dropdown-item>
              </router-link>

              <el-dropdown-item divided>
                <span style="display:block;" @click="logout">{{ $t('navbar.logOut') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- Direct Logout button for admin backend (Obsidian Arc Style) -->
        <button
          type="button"
          class="nav-logout-btn desktop-only"
          :title="$t('navbar.logOut')"
          @click="logout"
        >
          <el-icon class="logout-icon"><SwitchButton /></el-icon>
          <span class="logout-text">{{ $t('navbar.logOut') }}</span>
        </button>
      </template>

      <template v-if="device==='mobile'">
        <img :src="avatar+'?imageView2/1/w/80/h/80'" class="mobile-avatar" alt="Avatar">
        <button class="lang-toggle right-menu-item hover-effect" @click="toggleLanguage">
          {{ language === 'zh' ? 'EN' : '中' }}
        </button>
        <button class="mobile-logout right-menu-item hover-effect" :title="$t('navbar.logOut')" @click="logout">
          <el-icon><SwitchButton /></el-icon>
        </button>
      </template>
    </div>
  </div>
</template>

<script>
import { pinia } from '@/store'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { useSettingsStore } from '@/store/modules/settings'
import { themes } from '@/styles/themes'
import { setPlatformTheme } from '@/utils/theme'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import { computed } from 'vue'
import { setI18nLanguage } from '@/lang'
import router from '@/router'
import { Check, SwitchButton, CaretBottom } from '@element-plus/icons-vue'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    Check,
    SwitchButton,
    CaretBottom
  },
  setup() {
    const appStore = useAppStore(pinia)
    const userStore = useUserStore(pinia)
    const settingsStore = useSettingsStore(pinia)

    const sidebar = computed(() => appStore.sidebar)
    const device = computed(() => appStore.device)
    const language = computed(() => appStore.language)
    const name = computed(() => userStore.name)
    const callsign = computed(() => userStore.callsign)
    const avatar = computed(() => userStore.avatar)
    const billingEnabled = computed(() => userStore.billing_enabled)
    const expireText = computed(() => {
      const v = userStore.expire_time
      if (!v) return '--'
      const m = String(v).match(/^\d{4}-\d{2}-\d{2}/)
      return m ? m[0] : String(v)
    })
    // 距到期 <= 1 周或已过期：红色(danger)；<= 1 个月：黄色(warning)；其余：正常(ok)
    const expireLevel = computed(() => {
      const v = userStore.expire_time
      if (!v) return 'ok'
      const t = new Date(String(v).replace(' ', 'T')).getTime()
      if (Number.isNaN(t)) return 'ok'
      const days = (t - Date.now()) / 86400000
      if (days <= 7) return 'danger'
      if (days <= 30) return 'warning'
      return 'ok'
    })
    const platformThemeKey = computed(() => settingsStore.platformThemeKey)
    const currentTheme = computed(() => themes[platformThemeKey.value] || themes.default)

    const toggleSideBar = () => {
      appStore.toggleSideBar()
    }

    const toggleLanguage = () => {
      const locale = language.value === 'zh' ? 'en' : 'zh'
      setI18nLanguage(locale)
      appStore.setLanguage(locale)
    }

    const switchTheme = (key) => {
      settingsStore.setPlatformTheme(key)
      setPlatformTheme(key)
    }

    const logout = async() => {
      try {
        await userStore.logout()
      } catch (e) {
        console.warn('logout api error, clearing local session anyway:', e)
      }
      router.push(`/login?redirect=${window.location.pathname}`)
    }

    const goRenew = () => {
      router.push('/renew/index')
    }

    return {
      sidebar,
      device,
      language,
      name,
      callsign,
      avatar,
      billingEnabled,
      expireText,
      expireLevel,
      platformThemeKey,
      currentTheme,
      toggleSideBar,
      toggleLanguage,
      switchTheme,
      logout,
      goRenew
    }
  },
  data() {
    return {
      themes
    }
  }
}
</script>

<style lang="scss">
.platform-theme-user-dropdown {
  border: 1px solid var(--platform-border) !important;
  border-radius: 14px !important;
  background: var(--platform-surface) !important;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.45) !important;
  overflow: hidden;

  .el-dropdown-menu {
    padding: 6px;
    background: transparent !important;
  }

  .el-dropdown-menu__item {
    min-width: 136px;
    margin: 2px 0;
    padding: 8px 12px;
    border-radius: 8px;
    color: var(--platform-ink-dim) !important;
    font-size: 13px;
    font-weight: 500;
    transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
  }

  .el-dropdown-menu__item:not(.is-disabled):hover,
  .el-dropdown-menu__item:not(.is-disabled):focus {
    background: var(--platform-surface-soft) !important;
    color: var(--platform-ink) !important;
    transform: translateX(2px);
  }

  .el-dropdown-menu__item--divided {
    border-top: 1px solid var(--platform-border) !important;
    margin-top: 4px;
    padding-top: 8px;
  }

  .el-dropdown-menu__item--divided:before {
    display: none;
  }

  .el-popper__arrow::before {
    background: var(--platform-surface) !important;
    border-color: var(--platform-border) !important;
  }

  a {
    text-decoration: none;
  }
}
</style>

<style lang="scss" scoped>
.navbar {
  height: 54px;
  overflow: hidden;
  position: relative;
  background: var(--platform-surface) !important;
  border-bottom: 1px solid var(--platform-border);
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;

  .hamburger-container {
    line-height: 54px;
    flex: 0 0 auto;
    height: 100%;
    cursor: pointer;
    transition: background 0.2s;
    -webkit-tap-highlight-color: transparent;
    display: flex;
    align-items: center;
    padding: 0 8px;
    border-radius: 8px;

    &:hover {
      background: var(--platform-surface-soft);
    }
  }

  .breadcrumb-container {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    margin-left: 8px;
  }

  .right-menu {
    margin-left: auto;
    flex: 0 0 auto;
    min-width: 0;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 8px;

    &:focus {
      outline: none;
    }

    .nav-user-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 9999px;
      background: var(--platform-surface-soft);
      border: 1px solid var(--platform-border);
      font-size: 12.5px;

      .user-pill-name {
        font-weight: 600;
        color: var(--platform-ink);
      }

      .user-pill-callsign {
        color: var(--platform-accent);
        font-weight: 700;
      }
    }

    .lang-toggle {
      appearance: none;
      border: 1px solid var(--platform-border);
      border-radius: 9999px;
      background: var(--platform-surface-soft);
      color: var(--platform-ink-dim);
      cursor: pointer;
      font-size: 12.5px;
      font-weight: 600;
      padding: 0 10px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--platform-border-strong);
        color: var(--platform-ink);
        background: var(--platform-surface-light);
      }
    }

    .expire-toggle {
      appearance: none;
      border: 1px solid var(--platform-border);
      border-radius: 9999px;
      background: var(--platform-surface-soft);
      color: var(--platform-ink-dim);
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      padding: 0 12px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--platform-border-strong);
        color: var(--platform-ink);
      }

      &.expire-toggle--warning {
        color: #f59e0b;
        border-color: rgba(245, 158, 11, 0.4);
        background: rgba(245, 158, 11, 0.12);
      }

      &.expire-toggle--danger {
        color: #ef4444;
        border-color: rgba(239, 68, 68, 0.4);
        background: rgba(239, 68, 68, 0.12);
      }
    }

    .theme-picker-container {
      .theme-trigger {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0 12px;
        height: 32px;
        border: 1px solid var(--platform-border);
        border-radius: 9999px;
        background: var(--platform-surface-soft);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--platform-border-strong);
          background: var(--platform-surface-light);
        }

        .theme-icon {
          font-size: 14px;
        }

        .theme-name {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--platform-ink-dim);
        }
      }
    }

    .avatar-container {
      height: 100%;
      display: inline-flex;
      align-items: center;
      cursor: pointer;

      .avatar-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 4px;

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1.5px solid var(--platform-border);
          object-fit: cover;
          transition: border-color 0.2s ease;
        }

        &:hover .user-avatar {
          border-color: var(--platform-accent);
        }

        .el-icon-caret-bottom {
          font-size: 12px;
          color: var(--platform-ink-dim);
        }
      }
    }

    // Direct Logout Button in Desktop Header
    .nav-logout-btn {
      appearance: none;
      border: 1px solid rgba(239, 68, 68, 0.28);
      border-radius: 9999px;
      background: rgba(239, 68, 68, 0.08);
      color: #f87171;
      height: 32px;
      padding: 0 12px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      outline: none;
      transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);

      .logout-icon {
        font-size: 14px;
        flex-shrink: 0;
      }

      .logout-text {
        white-space: nowrap;
      }

      &:hover {
        border-color: #ef4444;
        background: #ef4444;
        color: #ffffff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .mobile-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid var(--platform-border);
      object-fit: cover;
    }

    .mobile-logout {
      appearance: none;
      border: 1px solid rgba(239, 68, 68, 0.28);
      border-radius: 8px;
      background: rgba(239, 68, 68, 0.08);
      color: #f87171;
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }
}

@media (max-width: 900px) {
  .navbar .right-menu .nav-user-pill {
    display: none;
  }
}

@media (max-width: 767px) {
  .navbar {
    padding: 0 10px;
    height: 48px;

    .hamburger-container,
    .breadcrumb-container {
      display: none;
    }

    .right-menu {
      width: 100%;
      justify-content: flex-end;
      gap: 6px;
    }
  }
}
</style>
