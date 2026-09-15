<template>
  <div class="dashboard-home">
    <div class="dashboard-shell">
      <section class="dashboard-hero">
        <div class="hero-copy hero-copy--compact" />

        <div class="hero-side">
          <div class="hero-metrics-row">
            <div class="hero-unified-stats">
              <article class="unified-stat-card">
                <strong>{{ totalDeviceCount }}</strong>
                <span>{{ $t('dashboardHome.totalDevices') }}</span>
              </article>

              <article class="unified-stat-card">
                <strong>{{ liveStats.onlineDevices }}</strong>
                <span>{{ $t('login.onlineDevices') }}</span>
              </article>

              <article class="unified-stat-card">
                <strong>{{ liveStats.connectedClients }}</strong>
                <span>{{ $t('login.onlineBrowsers') }}</span>
              </article>

              <article class="unified-stat-card">
                <strong>{{ liveStats.totalSubs }}</strong>
                <span>{{ $t('login.audioSubscriptions') }}</span>
              </article>
            </div>
          </div>
        </div>
      </section>

      <!-- Homepage announcements from CMS -->
      <section v-if="announcements.length" class="dashboard-announcements">
        <article
          v-for="ann in announcements"
          :key="ann.id"
          class="announcement-card"
        >
          <div class="ann-header">
            <span v-if="ann.is_pinned" class="ann-pin">置顶</span>
            <span class="ann-type">{{ annTypeLabel(ann.type) }}</span>
            <h3 class="ann-title">{{ ann.title }}</h3>
          </div>
          <p v-if="ann.summary" class="ann-summary">{{ ann.summary }}</p>
          <footer class="ann-meta">
            <time>{{ ann.publish_time }}</time>
          </footer>
        </article>
      </section>

      <section class="dashboard-grid">
        <div class="monitor-panel-content">
          <realtime-monitor-panel @stats-change="handleMonitorStatsChange" />
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { fetchTotalStats } from '@/api/dataquery'
import { fetchHomepageAnnouncements } from '@/api/homepage'
import RealtimeMonitorPanel from '@/components/platform/RealtimeMonitorPanel.vue'

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
        onlineDevices: 0
      },
      announcements: []
    }
  },
  computed: {
    totalDeviceCount() {
      return Number(this.list.platform_dev_total || this.list.dev_number) || 0
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
        onlineDevices: Number(stats && stats.onlineDevices) || 0
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-home {
  min-height: 100%;
  background: var(--platform-shell);
  position: relative;
  overflow: hidden;
  color: var(--platform-ink);
}

.dashboard-shell {
  width: min(1520px, calc(100% - 48px));
  margin: 0 auto;
  padding: 24px 0 36px;
  position: relative;
  z-index: 1;
}

.dashboard-hero {
  display: block;
  margin-bottom: 24px;
}

.hero-copy--compact {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 1px;
}

.hero-side {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
}

.hero-metrics-row {
  display: grid;
  width: 100%;
}

.hero-unified-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  width: 100%;
}

.dashboard-grid {
  display: block;
}

.monitor-panel-content {
  min-height: 720px;
}

// Obsidian Arc Metric Stat Card
.unified-stat-card {
  min-width: 0;
  padding: 16px 18px;
  border-radius: 14px;
  background: var(--platform-surface);
  border: 1px solid var(--platform-border);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 116px;
  transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1), transform 0.2s cubic-bezier(0.2, 0, 0, 1);

  &:hover {
    border-color: var(--platform-border-strong);
    transform: translateY(-2px);
  }

  strong {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
    color: var(--platform-ink);
    text-align: center;
  }

  span {
    display: block;
    margin-top: 6px;
    font-size: 11.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--platform-ink-dim);
    line-height: 1.35;
  }
}

// Announcements (Obsidian Arc reading card)
.dashboard-announcements {
  margin-bottom: 24px;
}

.announcement-card {
  border-radius: 14px;
  background: var(--platform-surface);
  border: 1px solid var(--platform-border);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
  padding: 16px 20px;
  margin-bottom: 12px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--platform-border-strong);
  }
}

.ann-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
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
  font-size: 15px;
  font-weight: 600;
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

@media (max-width: 1320px) {
  .hero-side {
    align-items: center;
  }

  .hero-metrics-row {
    width: 100%;
  }

  .hero-unified-stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    width: 100%;
  }

  .dashboard-grid {
    display: block;
  }
}

@media (max-width: 1023px) {
 .monitor-panel-content {
  min-height: 480px;
 }
}

@media (max-width: 767px) {
  .dashboard-shell {
    width: min(100%, calc(100% - 24px));
    padding-top: 16px;
  }

  .hero-copy--compact {
    align-items: center;
    text-align: center;
  }

  .hero-metrics-row {
    width: 100%;
  }

  .hero-unified-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
    gap: 10px;
  }

  .monitor-panel-content {
    min-height: 0;
  }

  .unified-stat-card {
    min-height: 98px;
    padding: 12px;

    strong {
      font-size: 22px;
    }
  }

  .announcement-card {
    border-radius: 12px;
    padding: 12px 14px;
  }

  .ann-title {
    font-size: 14px;
  }
}
</style>
