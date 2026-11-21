<template>
  <div class="sidebar-logo-container" :class="{'collapse': collapse}">
    <router-link class="sidebar-logo-link" to="/dashboard">
      <img v-if="logourl" :src="logourl" class="sidebar-logo-img" alt="">
      <div v-else class="sidebar-logo-symbol">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="2" />
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
        </svg>
      </div>
      <div v-if="!collapse" class="sidebar-brand">
        <h1 class="sidebar-title" :title="fullTitle">{{ name || 'HAM互联' }}</h1>
        <p v-if="version" class="sidebar-version">{{ version }}</p>
      </div>
    </router-link>
  </div>
</template>

<script>
import { getplatforminfo } from '@/api/platform'
import { useSettingsStore } from '@/store/modules/settings'

export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      name: '',
      version: '',
      logourl: ''
    }
  },
  computed: {
    fullTitle() {
      return [this.name, this.version].filter(Boolean).join(' ')
    }
  },

  created() {
    getplatforminfo().then(response => {
      if (response && response.data && response.data.items) {
        this.name = response.data.items.name || ''
        this.version = response.data.items.version || ''
        this.logourl = response.data.items.logourl || ''

        const settingsStore = useSettingsStore()
        settingsStore.changeSetting({
          key: 'title',
          value: this.fullTitle || 'HAM互联'
        })
      }
    }).catch(() => {})
  }
}
</script>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 64px;
  background: var(--sidebar-bg);
  border-bottom: 1px solid var(--platform-border);
  box-sizing: border-box;
  overflow: hidden;
  flex: 0 0 64px;
  display: flex;
  align-items: center;

  .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
    text-decoration: none;
    box-sizing: border-box;
  }

  .sidebar-logo-img {
    width: 32px;
    height: 32px;
    max-width: 32px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .sidebar-logo-symbol {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: linear-gradient(135deg, var(--platform-accent-18) 0%, var(--platform-accent-06) 100%);
    border: 1px solid var(--platform-border-accent);
    color: var(--platform-accent);
    box-shadow: 0 2px 8px var(--platform-accent-14);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .sidebar-brand {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .sidebar-title {
    margin: 0;
    color: var(--platform-ink);
    font-weight: 700;
    font-size: 13px;
    line-height: 1.25;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar-version {
    margin: 0;
    font-size: 11px;
    line-height: 1.2;
    color: var(--platform-ink-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &.collapse {
    .sidebar-logo-link {
      justify-content: center;
      padding: 0;
    }

    .sidebar-logo-img {
      max-width: 34px;
    }
  }
}
</style>
