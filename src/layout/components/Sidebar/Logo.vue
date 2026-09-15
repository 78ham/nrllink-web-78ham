<template>
  <div class="sidebar-logo-container" :class="{'collapse': collapse}">
    <router-link class="sidebar-logo-link" to="/dashboard">
      <img v-if="logourl" :src="logourl" class="sidebar-logo-img" alt="Logo">
      <div v-else class="sidebar-logo-symbol">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="2" />
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
        </svg>
      </div>
      <h1 v-if="!collapse" class="sidebar-title">{{ title || 'HAM互联' }}</h1>
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
      title: '',
      logourl: ''
    }
  },

  created() {
    getplatforminfo().then(response => {
      if (response && response.data && response.data.items) {
        this.title = (response.data.items.name || '') + (response.data.items.version || '')
        this.logourl = response.data.items.logourl || ''

        const settingsStore = useSettingsStore()
        settingsStore.changeSetting({
          key: 'title',
          value: this.title || 'HAM互联'
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
  height: 54px;
  background: var(--sidebar-bg);
  border-bottom: 1px solid var(--platform-border);
  box-sizing: border-box;
  overflow: hidden;
  flex: 0 0 54px;
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
    height: 32px;
    max-width: 130px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .sidebar-logo-symbol {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: var(--platform-surface-soft);
    border: 1px solid var(--platform-border);
    color: var(--platform-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .sidebar-title {
    margin: 0;
    color: var(--platform-ink);
    font-weight: 700;
    font-size: 14.5px;
    letter-spacing: -0.01em;
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
