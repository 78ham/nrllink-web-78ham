<template>
  <div ref="containerRef" class="responsive-table">
    <!-- 桌面与平板端：渲染默认 table 插槽 -->
    <div v-if="!isMobile" class="responsive-table__desktop">
      <slot name="table" />
    </div>

    <!-- 移动端：卡片流模式 -->
    <div
      v-else
      class="responsive-table__mobile"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- 下拉刷新指示器 -->
      <div
        v-if="pullDistance > 0 || refreshing"
        class="rt-pull-refresh"
        :style="{ height: `${pullDistance}px` }"
      >
        <div class="rt-pull-refresh__content">
          <span v-if="refreshing" class="rt-spinner" />
          <span class="rt-pull-refresh__text">{{ refreshText }}</span>
        </div>
      </div>

      <!-- 骨架屏加载态 -->
      <div v-if="loading && (!data || !data.length)" class="rt-skeleton">
        <div v-for="n in 4" :key="n" class="rt-skeleton__card">
          <div class="rt-skeleton__head" />
          <div class="rt-skeleton__line rt-skeleton__line--short" />
          <div class="rt-skeleton__line" />
          <div class="rt-skeleton__line rt-skeleton__line--half" />
        </div>
      </div>

      <!-- 卡片列表 -->
      <template v-else-if="data && data.length">
        <!-- 虚拟滚动上部占位 -->
        <div v-if="useVirtual && topPadding > 0" :style="{ height: `${topPadding}px` }" class="rt-virtual-spacer" />

        <article
          v-for="row in visibleData"
          :key="getRowKey(row)"
          class="rt-card"
        >
          <header class="rt-card__head">
            <strong class="rt-card__title">{{ row[titleKey] || '--' }}</strong>
            <div class="rt-card__badge">
              <slot name="badge" :row="row" />
            </div>
          </header>

          <dl class="rt-card__body">
            <div v-for="col in columns" :key="col.prop" class="rt-field">
              <dt>{{ col.label }}</dt>
              <dd>
                <slot :name="`col-${col.prop}`" :row="row" :value="row[col.prop]">
                  <slot :name="col.prop" :row="row" :value="row[col.prop]">
                    {{ formatValue(col, row) }}
                  </slot>
                </slot>
              </dd>
            </div>
          </dl>

          <footer v-if="$slots.actions" class="rt-card__actions">
            <slot name="actions" :row="row" />
          </footer>
        </article>

        <!-- 虚拟滚动下部占位 -->
        <div v-if="useVirtual && bottomPadding > 0" :style="{ height: `${bottomPadding}px` }" class="rt-virtual-spacer" />

        <!-- 加载更多 -->
        <div v-if="hasMore" class="rt-footer">
          <button
            type="button"
            class="rt-load-more"
            :disabled="loading"
            @click="handleLoadMore"
          >
            <span v-if="loading" class="rt-spinner rt-spinner--sm" />
            {{ loading ? '加载中...' : '加载更多' }}
          </button>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-else class="rt-empty">
        <slot name="empty">
          <div class="rt-empty__inner">
            <span class="rt-empty__icon">📭</span>
            <p class="rt-empty__text">{{ emptyText }}</p>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import { useAppStore } from '@/store/modules/app'

export default {
  name: 'ResponsiveTable',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    rowKey: {
      type: String,
      default: 'id'
    },
    titleKey: {
      type: String,
      default: 'name'
    },
    loading: {
      type: Boolean,
      default: false
    },
    virtualThreshold: {
      type: Number,
      default: 100
    },
    itemHeight: {
      type: Number,
      default: 132
    },
    hasMore: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    pullToRefresh: {
      type: Boolean,
      default: true
    }
  },
  emits: ['load-more', 'refresh'],
  data() {
    return {
      scrollTop: 0,
      viewportHeight: 800,
      bufferCount: 5,
      touchStartY: 0,
      pullDistance: 0,
      refreshing: false,
      pullThreshold: 60
    }
  },
  computed: {
    isMobile() {
      const appStore = useAppStore()
      return appStore.device === 'mobile'
    },
    useVirtual() {
      return (this.data?.length || 0) > this.virtualThreshold
    },
    startIndex() {
      if (!this.useVirtual) return 0
      const index = Math.floor(this.scrollTop / this.itemHeight) - this.bufferCount
      return Math.max(0, index)
    },
    endIndex() {
      if (!this.useVirtual) return this.data.length
      const count = Math.ceil(this.viewportHeight / this.itemHeight) + this.bufferCount * 2
      return Math.min(this.data.length, this.startIndex + count)
    },
    topPadding() {
      if (!this.useVirtual) return 0
      return this.startIndex * this.itemHeight
    },
    bottomPadding() {
      if (!this.useVirtual) return 0
      return Math.max(0, (this.data.length - this.endIndex) * this.itemHeight)
    },
    visibleData() {
      if (!this.data || !this.data.length) return []
      if (!this.useVirtual) return this.data
      return this.data.slice(this.startIndex, this.endIndex)
    },
    refreshText() {
      if (this.refreshing) return '正在刷新...'
      if (this.pullDistance >= this.pullThreshold) return '释放以刷新'
      return '下拉刷新'
    }
  },
  mounted() {
    this.updateViewport()
    window.addEventListener('scroll', this.handleScroll, { passive: true })
    window.addEventListener('resize', this.updateViewport, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('resize', this.updateViewport)
  },
  methods: {
    getRowKey(row) {
      if (!row) return Math.random().toString(36).slice(2)
      return row[this.rowKey] ?? row.id ?? row.name ?? JSON.stringify(row)
    },
    formatValue(col, row) {
      if (!col || !row) return '--'
      if (typeof col.formatter === 'function') {
        return col.formatter(row, col)
      }
      const val = row[col.prop]
      return val !== undefined && val !== null && val !== '' ? val : '--'
    },
    updateViewport() {
      if (typeof window !== 'undefined') {
        this.viewportHeight = window.innerHeight || 800
      }
    },
    handleScroll() {
      if (!this.isMobile || !this.useVirtual) return
      this.scrollTop = window.scrollY || document.documentElement.scrollTop || 0
    },
    handleTouchStart(e) {
      if (!this.pullToRefresh || this.refreshing) return
      const currentScroll = window.scrollY || document.documentElement.scrollTop || 0
      if (currentScroll <= 5) {
        this.touchStartY = e.touches[0].clientY
      } else {
        this.touchStartY = 0
      }
    },
    handleTouchMove(e) {
      if (!this.pullToRefresh || this.refreshing || !this.touchStartY) return
      const currentY = e.touches[0].clientY
      const deltaY = currentY - this.touchStartY
      if (deltaY > 0) {
        // 增加阻尼效果
        this.pullDistance = Math.min(80, deltaY * 0.45)
      } else {
        this.pullDistance = 0
      }
    },
    async handleTouchEnd() {
      if (!this.pullToRefresh || this.refreshing || !this.touchStartY) return
      if (this.pullDistance >= this.pullThreshold) {
        this.refreshing = true
        this.pullDistance = 44
        try {
          this.$emit('refresh')
          // 提供触觉反馈
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10)
          }
        } finally {
          setTimeout(() => {
            this.refreshing = false
            this.pullDistance = 0
          }, 600)
        }
      } else {
        this.pullDistance = 0
      }
      this.touchStartY = 0
    },
    handleLoadMore() {
      if (this.loading) return
      this.$emit('load-more')
    }
  }
}
</script>

<style lang="scss" scoped>
.responsive-table {
  width: 100%;
}

.responsive-table__mobile {
  display: flex;
  flex-direction: column;
  position: relative;
}

// 下拉刷新
.rt-pull-refresh {
  overflow: hidden;
  transition: height 0.2s cubic-bezier(0.2, 0, 0, 1);
  display: flex;
  align-items: center;
  justify-content: center;

  &__content {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--platform-ink-dim, #98989f);
    font-size: 13px;
  }
}

// 骨架屏
.rt-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__card {
    background: var(--platform-surface, #1c1c1f);
    border: 1px solid var(--platform-border, rgba(237, 237, 239, 0.08));
    border-radius: 14px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__head {
    height: 18px;
    width: 45%;
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.09) 50%, rgba(255, 255, 255, 0.04) 75%);
    background-size: 200% 100%;
    animation: rt-pulse 1.6s infinite ease-in-out;
  }

  &__line {
    height: 14px;
    width: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.04) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.04) 75%);
    background-size: 200% 100%;
    animation: rt-pulse 1.6s infinite ease-in-out;

    &--short {
      width: 70%;
    }

    &--half {
      width: 50%;
    }
  }
}

@keyframes rt-pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 移动端卡片
.rt-card {
  background: var(--platform-surface, #1c1c1f);
  border: 1px solid var(--platform-border, rgba(237, 237, 239, 0.08));
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s ease, border-color 0.15s ease;

  &:active {
    transform: scale(0.995);
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--platform-border-light, rgba(237, 237, 239, 0.05));
  }

  &__title {
    color: var(--platform-ink, #ededef);
    font-size: 15px;
    font-weight: 600;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__badge {
    flex-shrink: 0;
  }

  &__body {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__actions {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed var(--platform-border-light, rgba(237, 237, 239, 0.06));
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}

// 键值对
.rt-field {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding: 4px 0;
  font-size: 13px;

  dt {
    color: var(--platform-ink-dim, #98989f);
    flex: 0 0 auto;
    font-weight: normal;
  }

  dd {
    margin: 0;
    text-align: right;
    color: var(--platform-ink, #ededef);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
  }
}

// 虚拟滚动占位
.rt-virtual-spacer {
  width: 100%;
}

// 加载更多
.rt-footer {
  margin-top: 8px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.rt-load-more {
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  border: 1px solid var(--platform-border, rgba(237, 237, 239, 0.12));
  background: var(--platform-surface-light, #28282d);
  color: var(--platform-ink, #ededef);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  touch-action: manipulation;
  transition: all 0.2s ease;

  &:active:not(:disabled) {
    background: var(--platform-surface-xlight, #2f2f36);
    transform: scale(0.99);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// 空态
.rt-empty {
  padding: 40px 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  &__inner {
    text-align: center;
    color: var(--platform-ink-dim, #98989f);
  }

  &__icon {
    font-size: 36px;
    display: block;
    margin-bottom: 8px;
  }

  &__text {
    margin: 0;
    font-size: 14px;
  }
}

// 加载转圈
.rt-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--platform-accent, #6366f1);
  border-radius: 50%;
  animation: rt-spin 0.8s linear infinite;

  &--sm {
    width: 14px;
    height: 14px;
    border-width: 2px;
  }
}

@keyframes rt-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
