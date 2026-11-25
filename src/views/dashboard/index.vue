<template>
  <div class="dashboard-home">
    <div class="dashboard-shell">
      <header class="ops-head">
        <div class="ops-copy">
          <p class="ops-kicker">
            <span v-if="callsign" class="ops-callsign">{{ callsign }}</span>
            <span>{{ $t('dashboardHome.heroBadge') }}</span>
          </p>
          <h1>{{ $t('dashboardHome.liveTitle') }}</h1>
          <p class="ops-hint">{{ $t('dashboardHome.liveHint') }}</p>
        </div>
        <span class="link-pill" :class="{ 'is-on': liveStats.connected }">
          <i />
          {{ liveStats.connected ? $t('login.connected') : $t('login.connecting') }}
        </span>
      </header>

      <section class="metric-strip" :aria-label="$t('dashboardHome.summaryTitle')">
        <article v-for="item in metrics" :key="item.key" class="metric unified-stat-card">
          <span class="metric-icon" :class="item.tone">
            <el-icon><component :is="item.icon" /></el-icon>
          </span>
          <span class="metric-copy">
            <span class="metric-label">{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </span>
        </article>
      </section>

      <section class="ops-stage" :class="{ 'has-notes': announcements.length }">
        <div class="ops-monitor">
          <realtime-monitor-panel @stats-change="handleMonitorStatsChange" />
        </div>

        <aside v-if="announcements.length" class="ops-notes">
          <h2>{{ $t('dashboardHome.notices') }}</h2>
          <article v-for="ann in announcements" :key="ann.id" class="announcement-card">
            <div class="ann-header">
              <span v-if="ann.is_pinned" class="ann-pin">置顶</span>
              <span class="ann-type">{{ annTypeLabel(ann.type) }}</span>
            </div>
            <h3 class="ann-title">{{ ann.title }}</h3>
            <p v-if="ann.summary" class="ann-summary">{{ ann.summary }}</p>
            <footer class="ann-meta">
              <time>{{ ann.publish_time }}</time>
            </footer>
          </article>
        </aside>
      </section>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { fetchTotalStats } from '@/api/dataquery'
import { fetchHomepageAnnouncements } from '@/api/homepage'
import { useUserStore } from '@/store/modules/user'
import RealtimeMonitorPanel from '@/components/platform/RealtimeMonitorPanel.vue'
import { Cpu, Connection, Monitor, Headset } from '@element-plus/icons-vue'

export default {
  name: 'DashboardAdmin',
  components: {
    RealtimeMonitorPanel
  },
  data() {
    return {
      listQuery: {},
      list: {},
      liveStats: {
        totalSubs: 0,
        connectedClients: 0,
        onlineDevices: 0,
        connected: false
      },
      announcements: []
    }
  },
  computed: {
    ...mapState(useUserStore, ['callsign']),
    totalDeviceCount() {
      return Number(this.list.platform_dev_total || this.list.dev_number) || 0
    },
    // 四个数从左到右是：库存、在线、谁在看、谁在听。图标只帮眼睛分组，不抢数字。
    metrics() {
      return [
        { key: 'total', label: this.$t('dashboardHome.totalDevices'), value: this.totalDeviceCount, icon: Cpu, tone: 'tone-ink' },
        { key: 'online', label: this.$t('login.onlineDevices'), value: this.liveStats.onlineDevices, icon: Connection, tone: 'tone-ok' },
        { key: 'browsers', label: this.$t('login.onlineBrowsers'), value: this.liveStats.connectedClients, icon: Monitor, tone: 'tone-info' },
        { key: 'subs', label: this.$t('login.audioSubscriptions'), value: this.liveStats.totalSubs, icon: Headset, tone: 'tone-accent' }
      ]
    }
  },
  created() {
    this.initializeDashboard()
    this.loadAnnouncements()
  },
  methods: {
    async initializeDashboard() {
      try {
        const statsResponse = await fetchTotalStats(this.listQuery)
        const totalStats = statsResponse && statsResponse.data && statsResponse.data.items ? statsResponse.data.items : {}
        this.list = totalStats
      } catch (error) {
        console.error('Failed to initialize dashboard:', error)
      }
    },
    async loadAnnouncements() {
      try {
        const res = await fetchHomepageAnnouncements({ limit: 5 })
        if (res && res.data && res.data.items) {
          this.announcements = res.data.items
        }
      } catch (e) {
        // Homepage API not available, ignore silently
      }
    },
    annTypeLabel(type) {
      const labels = { 1: '公告', 2: '新闻', 3: '更新' }
      return labels[type] || '公告'
    },
    handleMonitorStatsChange(stats) {
      this.liveStats = {
        totalSubs: Number(stats && stats.totalSubs) || 0,
        connectedClients: Number(stats && stats.connectedClients) || 0,
        onlineDevices: Number(stats && stats.onlineDevices) || 0,
        connected: Boolean(stats && stats.connected)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-home {
  min-height: 100%;
  background: var(--platform-shell);
  color: var(--platform-ink);
}

.dashboard-shell {
  container-type: inline-size;
  width: min(1680px, calc(100% - 40px));
  margin: 0 auto;
  padding: 20px 0 28px;
}

.ops-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.ops-copy {
  min-width: 0;
  overflow-wrap: anywhere;
}

.ops-kicker {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--platform-ink-dim);
}

.ops-callsign {
  color: var(--platform-accent);
  letter-spacing: 0.04em;
}

.ops-copy h1 {
  margin: 0;
  font-size: 26px;
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--platform-ink);
}

.ops-hint {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--platform-ink-dim);
}

.link-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--platform-border);
  background: var(--platform-surface);
  color: var(--platform-ink-dim);
  font-size: 12px;
  font-weight: 600;
  flex: 0 0 auto;

  i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #f59e0b;
  }

  &.is-on {
    color: #34d399;
    border-color: rgba(16, 185, 129, 0.35);

    i {
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
  }
}

.metric-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.ops-stage {
  display: block;
}

.ops-stage.has-notes {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(250px, 22%);
  gap: 16px;
  align-items: stretch;
}

.ops-monitor {
  min-width: 0;
  min-height: 420px;
  height: calc(100dvh - 300px);
}

.ops-monitor :deep(.realtime-monitor-panel),
.ops-monitor :deep(.monitor-card) {
  height: 100%;
}

.ops-notes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  max-height: calc(100dvh - 300px);
  overflow: auto;
  padding-right: 2px;

  h2 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--platform-ink-dim);
  }
}

.metric {
  min-width: 0;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  min-height: 76px;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--platform-surface);
  border: 1px solid var(--platform-border);
  overflow: hidden;
}

.metric-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  background: var(--platform-surface-soft);
  color: var(--platform-ink-dim);
  font-size: 18px;

  &.tone-ok {
    background: rgba(16, 185, 129, 0.12);
    color: #34d399;
  }

  &.tone-info {
    background: rgba(56, 189, 248, 0.12);
    color: #38bdf8;
  }

  &.tone-accent {
    background: var(--platform-accent-12);
    color: var(--platform-accent);
  }
}

.metric-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.metric-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--platform-ink-dim);
  line-height: 1.3;
}

.metric strong {
  margin-top: 2px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  color: var(--platform-ink);
}

.announcement-card {
  border-radius: 14px;
  background: var(--platform-surface);
  border: 1px solid var(--platform-border);
  padding: 14px 14px 12px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--platform-border-strong);
  }
}

.ann-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.ann-pin {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
}

.ann-type {
  background: var(--platform-accent-12);
  color: var(--platform-accent);
  border: 1px solid var(--platform-border-accent);
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
}

.ann-title {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--platform-ink);
}

.ann-summary {
  color: var(--platform-ink-dim);
  font-size: 13px;
  margin: 0 0 8px;
  line-height: 1.5;
}

.ann-content {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--platform-ink-dim);
}

.ann-meta {
  margin-top: 8px;
  time {
    font-size: 12px;
    color: var(--platform-ink-dim);
    opacity: 0.7;
  }
}

@container (max-width: 960px) {
  .ops-stage.has-notes {
    grid-template-columns: minmax(0, 1fr);
  }

  .ops-notes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    max-height: none;
    overflow: visible;

    h2 {
      grid-column: 1 / -1;
    }
  }

  .ops-monitor {
    height: auto;
    min-height: 0;
  }
}

@container (max-width: 700px) {
  .metric-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .dashboard-shell {
    width: calc(100% - 24px);
    padding-top: 14px;
  }

  .ops-head {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 8px;

    .ops-copy {
      flex: 1 1 12rem;
    }
  }

  .ops-copy h1 {
    font-size: 22px;
  }

  .metric {
    min-height: 68px;
    padding: 12px;
  }

  .metric strong {
    font-size: 20px;
  }

  .announcement-card {
    border-radius: 12px;
  }
}
</style>
