<template>
  <div class="login-container">
    <div ref="topbar" class="topbar" :class="{ 'topbar-stacked': topbarStacked }">
      <div ref="brandBlock" class="brand-block">
        <img :src="logo_url || '/images/logo.png'" alt="Logo" class="topbar-logo">
        <div class="brand-text">
          <h1>{{ title }}</h1>
          <p>{{ $t('login.brandDesc') }}</p>
          <p v-if="login_slogan" class="login-slogan">{{ login_slogan }}</p>
        </div>
      </div>

      <div ref="topbarRight" class="topbar-right">
        <live-platform-stats
          class="topbar-stats"
          :online-devices="monitorStats.onlineDevices"
          :connected-clients="monitorStats.connectedClients"
          :total-subs="monitorStats.totalSubs"
        />

        <div class="topbar-actions">
          <div class="language-switch">
            <button
              type="button"
              class="lang-toggle-button"
              :class="`lang-${nextLanguage}`"
              :aria-label="languageToggleTitle"
              :title="languageToggleTitle"
              @click="toggleLanguage"
            >
              <span class="lang-toggle-icon" aria-hidden="true">{{ languageToggleShort }}</span>
            </button>
          </div>

          <el-dropdown class="theme-picker-dropdown" trigger="click" popper-class="platform-theme-login-dropdown">
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
          <button
            v-if="hasHiddenPanels"
            type="button"
            class="topbar-button ghost panel-icon-button"
            :aria-label="$t('login.showAllPanels')"
            :title="$t('login.showAllPanels')"
            @click="restoreAllPanels"
          >
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M4 7a3 3 0 0 1 3-3h3a1 1 0 1 1 0 2H7a1 1 0 0 0-1 1v3a1 1 0 1 1-2 0V7Zm10-3a1 1 0 0 1 1-1h2a3 3 0 0 1 3 3v2a1 1 0 1 1-2 0V7a1 1 0 0 0-1-1h-2a1 1 0 0 1-1-1ZM5 14a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h2a1 1 0 1 1 0 2H7a3 3 0 0 1-3-3v-2a1 1 0 0 1 1-1Zm14 0a1 1 0 0 1 1 1v2a3 3 0 0 1-3 3h-3a1 1 0 1 1 0-2h3a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1ZM9 9h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1Zm1 2v2h4v-2h-4Z" />
            </svg>
          </button>
          <button type="button" class="topbar-button ghost" @click="openLoginDialog">{{ $t('login.login') }}</button>
          <button type="button" class="topbar-button solid" @click="openRegisterDialog">{{ $t('login.register') }}</button>
        </div>
      </div>
    </div>

    <div
      ref="contentWrapper"
      class="content-wrapper"
      :class="{ 'desktop-panels': isDesktopPanels }"
      :style="contentWrapperStyle"
    >
      <div
        v-if="panelLayouts.left.visible"
        class="column left-column floating-panel"
        :class="{ 'desktop-floating': isDesktopPanels }"
        :style="getPanelStyle('left')"
        @mousedown="bringPanelToFront('left')"
      >
        <div
          class="panel-toolbar"
          @mousedown="startPanelDrag('left', $event)"
        >
          <span class="panel-title">
            <span class="panel-title-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M4 7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5v4A3.5 3.5 0 0 1 16.5 15h-1.8l-2.3 2.8a.6.6 0 0 1-.9 0L9.2 15H7.5A3.5 3.5 0 0 1 4 11.5v-4Zm3.5-2.3A2.3 2.3 0 0 0 5.2 7.5v4a2.3 2.3 0 0 0 2.3 2.3h2a.6.6 0 0 1 .47.22l1.98 2.42 1.98-2.42a.6.6 0 0 1 .47-.22h2.05a2.3 2.3 0 0 0 2.3-2.3v-4a2.3 2.3 0 0 0-2.3-2.3h-9Z" />
                <circle cx="8.5" cy="9.5" r="1" />
                <circle cx="12" cy="9.5" r="1" />
                <circle cx="15.5" cy="9.5" r="1" />
              </svg>
            </span>
            <span>{{ $t('login.supportEntry') }}</span>
          </span>
          <button type="button" class="panel-close" @click.stop="closePanel('left')">×</button>
        </div>
        <div class="panel-content">
          <support-links @toggle-image="toggleImage" />
        </div>
        <button
          v-if="isDesktopPanels"
          type="button"
          class="panel-resize"
          aria-label="Resize support panel"
          @mousedown="startPanelResize('left', $event)"
        />
      </div>

      <div
        v-if="panelLayouts.middle.visible"
        class="column middle-column floating-panel"
        :class="{ 'desktop-floating': isDesktopPanels }"
        :style="getPanelStyle('middle')"
        @mousedown="bringPanelToFront('middle')"
      >
        <div
          class="panel-toolbar"
          @mousedown="startPanelDrag('middle', $event)"
        >
          <span class="panel-title">
            <span class="panel-title-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M5 18.5h14a1 1 0 0 1 0 2H5a1 1 0 1 1 0-2Zm2.2-3.23 2.15-2.86a1 1 0 0 1 1.67.12l1.57 2.35 3.14-5.18a1 1 0 1 1 1.71 1.04l-3.95 6.52a1 1 0 0 1-1.69.03l-1.64-2.46-1.35 1.8a1 1 0 0 1-1.6-1.2ZM6 4h12a2 2 0 0 1 2 2v8.5a1 1 0 1 1-2 0V6H6v8.5a1 1 0 1 1-2 0V6a2 2 0 0 1 2-2Z" />
              </svg>
            </span>
            <span>{{ $t('login.monitorPanel') }}</span>
          </span>
          <button type="button" class="panel-close" @click.stop="closePanel('middle')">×</button>
        </div>
        <div class="panel-content monitor-panel-content">
          <realtime-monitor-panel
            class="monitor-component-fill"
            @stats-change="handleMonitorStatsChange"
          />
        </div>
        <button
          v-if="isDesktopPanels"
          type="button"
          class="panel-resize"
          aria-label="Resize monitor panel"
          @mousedown="startPanelResize('middle', $event)"
        />
      </div>

      <div
        v-if="panelLayouts.right.visible"
        class="column right-column floating-panel"
        :class="{ 'desktop-floating': isDesktopPanels }"
        :style="getPanelStyle('right')"
        @mousedown="bringPanelToFront('right')"
      >
        <div
          class="panel-toolbar"
          @mousedown="startPanelDrag('right', $event)"
        >
          <span class="panel-title">
            <span class="panel-title-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M6.5 4A2.5 2.5 0 0 0 4 6.5v2A2.5 2.5 0 0 0 6.5 11h11A2.5 2.5 0 0 0 20 8.5v-2A2.5 2.5 0 0 0 17.5 4h-11Zm0 8A2.5 2.5 0 0 0 4 14.5v2A2.5 2.5 0 0 0 6.5 19h11a2.5 2.5 0 0 0 2.5-2.5v-2A2.5 2.5 0 0 0 17.5 12h-11Zm0-6.8h11c.72 0 1.3.58 1.3 1.3v2c0 .72-.58 1.3-1.3 1.3h-11a1.3 1.3 0 0 1-1.3-1.3v-2c0-.72.58-1.3 1.3-1.3Zm0 8h11c.72 0 1.3.58 1.3 1.3v2c0 .72-.58 1.3-1.3 1.3h-11a1.3 1.3 0 0 1-1.3-1.3v-2c0-.72.58-1.3 1.3-1.3Z" />
                <circle cx="8" cy="7.5" r="1" />
                <circle cx="8" cy="15.5" r="1" />
                <rect x="11" y="7" width="6" height="1" rx=".5" />
                <rect x="11" y="15" width="6" height="1" rx=".5" />
              </svg>
            </span>
            <span>{{ $t('login.serverListPanel') }}</span>
          </span>
          <button type="button" class="panel-close" @click.stop="closePanel('right')">×</button>
        </div>
        <div class="panel-content">
          <server-list :list="sortedServerList" />
        </div>
        <button
          v-if="isDesktopPanels"
          type="button"
          class="panel-resize"
          aria-label="Resize server panel"
          @mousedown="startPanelResize('right', $event)"
        />
      </div>
    </div>

    <el-dialog
      v-model="loginDialogVisible"
      :title="$t('login.login')"
      width="480px"
      append-to-body
      align-center
      modal-class="portal-dialog-overlay"
      class="portal-dialog login-dialog platform-theme-dialog"
      @opened="focusLoginField"
    >
      <div class="login-dialog-inner">
        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          autocomplete="on"
          label-position="left"
        >
          <div class="dialog-title-container">
            <p>{{ $t('login.loginDialogTip') }}</p>
          </div>

          <el-form-item prop="username">
            <span class="svg-container">
              <svg-icon icon-class="user" />
            </span>
            <el-input
              ref="username"
              v-model="loginForm.username"
              :placeholder="$t('login.username')"
              name="username"
              type="text"
              tabindex="1"
              autocomplete="on"
            />
          </el-form-item>

          <el-tooltip
            v-model="capsTooltip"
            content="Caps lock is On"
            placement="right"
            manual
          >
            <el-form-item prop="password">
              <span class="svg-container">
                <svg-icon icon-class="password" />
              </span>
              <el-input
                :key="passwordType"
                ref="password"
                v-model="loginForm.password"
                :type="passwordType"
                :placeholder="$t('login.password')"
                name="password"
                tabindex="2"
                autocomplete="on"
                @keyup="checkCapslock"
                @blur="capsTooltip = false"
                @keyup.enter="handleLogin"
              />
              <span class="show-pwd" @click="showPwd">
                <svg-icon
                  :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
                />
              </span>
            </el-form-item>
          </el-tooltip>

          <div v-if="!totpRequired" class="login-button-wrapper">
            <el-button
              :loading="loading"
              type="primary"
              class="login-button"
              @click.prevent="handleLogin"
            >{{ $t("login.logIn") }}</el-button>

            <el-button
              :loading="passkeyLoading"
              type="default"
              class="login-button passkey-button"
              style="margin-top: 12px; width: 100%;"
              @click.prevent="handlePasskeyLogin"
            >使用通行密钥 (Passkey) 登录</el-button>
          </div>

          <div v-else class="totp-step-wrapper" style="margin-top: 16px;">
            <p style="font-size: 13px; color: #909399; margin-bottom: 12px; text-align: center;">
              该账号已开启两步验证，请输入身份验证器上的 6 位动态验证码：
            </p>
            <el-form-item>
              <span class="svg-container">
                <svg-icon icon-class="lock" />
              </span>
              <el-input
                ref="totpInput"
                v-model="totpCode"
                placeholder="6 位动态验证码"
                maxlength="6"
                tabindex="3"
                style="letter-spacing: 4px; font-size: 16px;"
                @keyup.enter="handleTOTPLogin"
              />
            </el-form-item>
            <el-button
              :loading="loading"
              type="primary"
              style="width: 100%; margin-top: 8px;"
              @click.prevent="handleTOTPLogin"
            >验证并登录</el-button>
            <el-button
              link
              style="width: 100%; margin-top: 8px;"
              @click="totpRequired = false; totpCode = '';"
            >返回密码登录</el-button>
          </div>
        </el-form>
      </div>
    </el-dialog>

    <el-dialog
      v-model="registerDialogVisible"
      :title="$t('login.register')"
      width="1320px"
      append-to-body
      align-center
      modal-class="portal-dialog-overlay"
      class="portal-dialog register-dialog platform-theme-dialog"
    >
      <div class="register-dialog-inner">
        <div class="register-dialog-copy">
          <strong>{{ $t('login.newUserRegister') }}</strong>
          <span>{{ $t('login.registerDesc') }}</span>
        </div>
        <div class="register-panel">
          <register-view embedded />
        </div>
      </div>
    </el-dialog>

    <!-- Floating Image Overlay -->
    <transition name="fade">
      <div v-if="isImageVisible" class="overlay" @click.self="toggleImage(false)">
        <div class="image-container">
          <button class="close-btn" @click.prevent="toggleImage(false)">×</button>
          <img :src="nrlmpImg" alt="NRL微信小程序" class="floating-image">
        </div>
      </div>
    </transition>

    <!-- Footer -->
    <div v-if="icp !== '' || tech_support !== '' || copyright !== ''" class="bottom_footer">
      <div class="footer-content">
        <template v-if="icp !== ''">
          <a href="https://beian.miit.gov.cn" target="_blank">工信部ICP备案号：{{ icp }}</a>
        </template>
        <template v-if="icp !== '' && tech_support !== ''">
          <span class="separator">|</span>
        </template>
        <span v-if="tech_support !== ''">{{ tech_support }}</span>
        <span v-if="copyright !== ''" class="copyright">{{ copyright }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getplatforminfo, fetchPlatformList } from '@/api/platform'
import { loginTOTP, getPasskeyLoginBegin, postPasskeyLoginFinish } from '@/api/auth-security'
import { transformAssertionOptions, serializeAssertionResponse } from '@/utils/webauthn'
import { setI18nLanguage } from '@/lang'
import { validUsername } from '@/utils/validate'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { useSettingsStore } from '@/store/modules/settings'
import { themes } from '@/styles/themes'
import { setPlatformTheme } from '@/utils/theme'
import { Check } from '@element-plus/icons-vue'
import ServerList from './components/ServerList.vue'
import SupportLinks from './components/SupportLinks.vue'
import RegisterView from '../register/index.vue'
import LivePlatformStats from '@/components/platform/LivePlatformStats.vue'
import RealtimeMonitorPanel from '@/components/platform/RealtimeMonitorPanel.vue'
import { usePanelLayout } from '@/composables/usePanelLayout'

export default {
  name: 'LoginView',
  components: { ServerList, SupportLinks, RegisterView, LivePlatformStats, RealtimeMonitorPanel, Check },
  setup() {
    // 桌面端三栏面板的布局/拖拽/缩放逻辑，与 Options API 混用；
    // 返回的绑定在 data/methods 与模板中均可通过 this 访问。
    const panelLayout = usePanelLayout()
    return { ...panelLayout }
  },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      title: 'HAM互联',
      logo_url: '',
      cs_qr_url: '',
      icp: '',
      tech_support: '',
      copyright: '',
      login_slogan: '',
      themes,
      loginForm: {
        username: '',
        password: ''
      },
      isImageVisible: false,
      loginRules: {
        username: [
          { required: true, trigger: 'blur', validator: validateUsername }
        ],
        password: [
          { required: true, trigger: 'blur', validator: validatePassword }
        ]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      passkeyLoading: false,
      totpRequired: false,
      totpTicket: '',
      totpCode: '',
      showDialog: false,
      loginDialogVisible: false,
      registerDialogVisible: false,
      redirect: undefined,
      serverList: [],
      nrlmpImg: '',
      monitorStats: {
        totalSubs: 0,
        connectedClients: 0,
        onlineDevices: 0
      },
      topbarStacked: false,
      topbarResizeObserver: null,
      topbarLayoutFrame: null
    }
  },
  computed: {
    ...mapState(useAppStore, ['device']),
    sortedServerList() {
      const currentHost = typeof window !== 'undefined' ? window.location.host : ''
      const currentHostname = typeof window !== 'undefined' ? window.location.hostname : ''
      const normalizeHost = value => String(value || '').replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase()
      const isLocalServer = server => {
        const host = normalizeHost(server && server.host)
        if (!host) return false
        return host === normalizeHost(currentHost) || host === normalizeHost(currentHostname)
      }

      return [...this.serverList].sort((a, b) => {
        const localA = isLocalServer(a)
        const localB = isLocalServer(b)
        if (localA !== localB) {
          return localA ? -1 : 1
        }
        const onlineA = Number(a && a.online) || 0
        const onlineB = Number(b && b.online) || 0
        if (onlineB !== onlineA) {
          return onlineB - onlineA
        }
        const nameA = a && a.name ? String(a.name) : ''
        const nameB = b && b.name ? String(b.name) : ''
        return nameA.localeCompare(nameB)
      })
    },
    nextLanguage() {
      return this.$i18n.locale === 'zh' ? 'en' : 'zh'
    },
    languageToggleShort() {
      return this.nextLanguage === 'zh' ? '中' : 'EN'
    },
    languageToggleTitle() {
      return this.nextLanguage === 'zh' ? this.$t('login.switchToChinese') : this.$t('login.switchToEnglish')
    },
    hasHiddenPanels() {
      return Object.values(this.panelLayouts).some(panel => !panel.visible)
    },
    platformThemeKey() {
      const settingsStore = useSettingsStore()
      return settingsStore.platformThemeKey
    },
    currentTheme() {
      return themes[this.platformThemeKey] || themes.default
    },
    contentWrapperStyle() {
      if (!this.isDesktopPanels) {
        return {}
      }

      const visiblePanels = Object.values(this.panelLayouts).filter(panel => panel.visible)
      const height = visiblePanels.reduce((maxHeight, panel) => {
        return Math.max(maxHeight, panel.y + panel.h)
      }, 420)

      return {
        height: `${height}px`,
        minHeight: `${height}px`
      }
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    getplatforminfo().then(response => {
      this.title = response.data.items.name
      this.cs_qr_url = response.data.items.cs_qr_url
      this.icp = response.data.items.icp
      this.tech_support = response.data.items.tech_support
      this.copyright = response.data.items.copyright
      this.login_slogan = response.data.items.login_slogan
      this.logo_url = response.data.items.logourl || ''

      if (response.data.items.language === 'en') {
        setI18nLanguage('en')
        const appStore = useAppStore()
        appStore.setLanguage('en')
      }

      this.$nextTick(() => {
        this.scheduleTopbarLayoutCheck()
      })
    })

    this.fetchServerList()
  },
  mounted() {
    window.addEventListener('resize', this.handleViewportResize)
    this.$nextTick(() => {
      this.initializePanels(true)
      this.setupTopbarResizeObserver()
      this.updateTopbarLayout()
    })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleViewportResize)
    this.stopPanelInteraction()
    this.destroyTopbarResizeObserver()
    if (this.topbarLayoutFrame) {
      cancelAnimationFrame(this.topbarLayoutFrame)
      this.topbarLayoutFrame = null
    }
  },
  methods: {
    setupTopbarResizeObserver() {
      if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
        return
      }

      this.destroyTopbarResizeObserver()
      const targets = [this.$refs.topbar, this.$refs.brandBlock, this.$refs.topbarRight].filter(Boolean)
      if (!targets.length) {
        return
      }

      this.topbarResizeObserver = new ResizeObserver(() => {
        this.scheduleTopbarLayoutCheck()
      })

      targets.forEach(target => this.topbarResizeObserver.observe(target))
    },
    destroyTopbarResizeObserver() {
      if (this.topbarResizeObserver) {
        this.topbarResizeObserver.disconnect()
        this.topbarResizeObserver = null
      }
    },
    scheduleTopbarLayoutCheck() {
      if (typeof window === 'undefined') {
        return
      }

      if (this.topbarLayoutFrame) {
        cancelAnimationFrame(this.topbarLayoutFrame)
      }

      this.topbarLayoutFrame = requestAnimationFrame(() => {
        this.topbarLayoutFrame = null
        this.updateTopbarLayout()
      })
    },
    updateTopbarLayout() {
      if (typeof window === 'undefined') {
        return
      }

      if (window.innerWidth <= 1023) {
        this.topbarStacked = false
        return
      }

      const topbar = this.$refs.topbar
      const brandBlock = this.$refs.brandBlock
      const topbarRight = this.$refs.topbarRight

      if (!topbar || !brandBlock || !topbarRight) {
        return
      }

      const topbarWidth = topbar.clientWidth
      const brandWidth = brandBlock.scrollWidth
      const rightWidth = topbarRight.scrollWidth
      const computedStyle = window.getComputedStyle(topbar)
      const columnGap = Number.parseFloat(computedStyle.columnGap || computedStyle.gap || '0') || 0
      const reservedGap = columnGap || 20
      const shouldStack = brandWidth + rightWidth + reservedGap > topbarWidth

      if (shouldStack !== this.topbarStacked) {
        this.topbarStacked = shouldStack
      }
    },
    handleMonitorStatsChange(stats) {
      this.monitorStats = {
        totalSubs: Number(stats && stats.totalSubs) || 0,
        connectedClients: Number(stats && stats.connectedClients) || 0,
        onlineDevices: Number(stats && stats.onlineDevices) || 0
      }
      this.scheduleTopbarLayoutCheck()
    },
    handleViewportResize() {
      // 视口变化时把现有面板布局钳制回边界内，而不是重置为默认布局
      this.initializePanels(false)
      this.scheduleTopbarLayoutCheck()
    },
    closePanel(panelId) {
      this.panelLayouts = {
        ...this.panelLayouts,
        [panelId]: {
          ...this.panelLayouts[panelId],
          visible: false
        }
      }
      this.stopPanelInteraction()
      this.$nextTick(() => {
        this.scheduleTopbarLayoutCheck()
      })
    },
    restoreAllPanels() {
      this.panelLayouts = {
        left: { ...this.panelLayouts.left, visible: true },
        middle: { ...this.panelLayouts.middle, visible: true },
        right: { ...this.panelLayouts.right, visible: true }
      }
      this.$nextTick(() => {
        this.initializePanels(true)
        this.scheduleTopbarLayoutCheck()
      })
    },
    fetchServerList() {
      fetchPlatformList().then(response => {
        this.serverList = response.data.items
      }).catch(error => {
        console.error('Failed to fetch server list:', error)
      })
    },
    setLanguage(language) {
      if (this.$i18n.locale === language) {
        return
      }
      setI18nLanguage(language)
      const appStore = useAppStore()
      appStore.setLanguage(language)
    },
    toggleLanguage() {
      this.setLanguage(this.nextLanguage)
      this.$nextTick(() => {
        this.scheduleTopbarLayoutCheck()
      })
    },
    switchTheme(key) {
      const settingsStore = useSettingsStore()
      settingsStore.setPlatformTheme(key)
      setPlatformTheme(key)
    },
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (
          (shiftKey && key >= 'a' && key <= 'z') ||
          (!shiftKey && key >= 'A' && key <= 'Z')
        ) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    showPwd() {
      this.passwordType = this.passwordType === 'password' ? 'text' : 'password'
      this.$nextTick(() => {
        if (this.$refs.password) {
          this.$refs.password.focus()
        }
      })
    },
    openLoginDialog() {
      this.totpRequired = false
      this.totpCode = ''
      this.totpTicket = ''
      this.loginDialogVisible = true
    },
    openRegisterDialog() {
      this.registerDialogVisible = true
    },
    switchToRegisterDialog() {
      this.loginDialogVisible = false
      this.openRegisterDialog()
    },
    focusLoginField() {
      this.$nextTick(() => {
        if (this.loginForm.username === '' && this.$refs.username) {
          this.$refs.username.focus()
        } else if (this.$refs.password) {
          this.$refs.password.focus()
        }
      })
    },
    async toggleImage(show) {
      this.isImageVisible = show
      if (show && !this.nrlmpImg) {
        const mod = await import('@/assets/nrlmp.jpg')
        this.nrlmpImg = mod.default || mod
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          const userStore = useUserStore()
          userStore.login(this.loginForm)
            .then(res => {
              if (res?.require_2fa) {
                this.totpRequired = true
                this.totpTicket = res.totp_ticket
                this.totpCode = ''
                this.loading = false
                this.$nextTick(() => {
                  if (this.$refs.totpInput) {
                    this.$refs.totpInput.focus()
                  }
                })
                return
              }
              this.loginDialogVisible = false
              this.$router.push({ path: this.redirect || '/' })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    async handleTOTPLogin() {
      if (!this.totpCode || this.totpCode.length < 6) {
        this.$message.error('请输入完整的 6 位动态验证码')
        return
      }
      this.loading = true
      try {
        const res = await loginTOTP(this.totpTicket, this.totpCode)
        if (res.code === 20000 && res.data?.token) {
          const userStore = useUserStore()
          userStore.setAuthToken(res.data.token)
          this.loginDialogVisible = false
          this.$router.push({ path: this.redirect || '/' })
        } else {
          this.$message.error(res.message || '两步验证失败')
        }
      } catch (err) {
        this.$message.error(err.message || '两步验证失败')
      } finally {
        this.loading = false
      }
    },
    async handlePasskeyLogin() {
      if (!window.PublicKeyCredential) {
        this.$message.error('当前浏览器不支持通行密钥 (WebAuthn)')
        return
      }
      this.passkeyLoading = true
      try {
        const username = this.loginForm.username.trim()
        const beginRes = await getPasskeyLoginBegin(username)
        if (beginRes.code !== 20000) {
          throw new Error(beginRes.message || '获取通行密钥挑战失败')
        }

        const { session_id, options } = beginRes.data
        const credOptions = transformAssertionOptions(options)

        const assertion = await navigator.credentials.get(credOptions)
        if (!assertion) {
          throw new Error('未获取到有效凭据')
        }

        const payload = serializeAssertionResponse(assertion)
        const finishRes = await postPasskeyLoginFinish(session_id, payload)
        if (finishRes.code !== 20000 || !finishRes.data?.token) {
          throw new Error(finishRes.message || '通行密钥验证失败')
        }

        const userStore = useUserStore()
        userStore.setAuthToken(finishRes.data.token)
        this.loginDialogVisible = false
        this.$router.push({ path: this.redirect || '/' })
        this.$message.success('通行密钥免密登录成功')
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          this.$message.warning('已取消通行密钥登录')
        } else {
          this.$message.error(err.message || '通行密钥登录失败')
        }
      } finally {
        this.passkeyLoading = false
      }
    }
  }
}
</script>

<style lang="scss" src="./styles/global.scss"></style>
<style lang="scss" scoped src="./styles/scoped.scss"></style>
