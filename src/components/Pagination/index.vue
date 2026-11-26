<template>
  <div :class="{'hidden':hidden}" class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :background="background"
      :layout="resolvedLayout"
      :pager-count="compact ? 5 : 7"
      :page-sizes="pageSizes"
      popper-class="platform-theme-select-dropdown"
      :total="total"
      v-bind="$attrs"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    total: {
      required: true,
      type: Number
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 20
    },
    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 50]
      }
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    background: {
      type: Boolean,
      default: true
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      compact: false
    }
  },
  computed: {
    resolvedLayout() {
      return this.compact ? this.layout.split(',').map(part => part.trim()).filter(part => part !== 'jumper').join(', ') : this.layout
    },
    currentPage: {
      get() {
        return this.page
      },
      set(val) {
        this.$emit('update:page', val)
      }
    },
    pageSize: {
      get() {
        return this.limit
      },
      set(val) {
        this.$emit('update:limit', val)
      }
    }
  },
  mounted() {
    this.observer = new ResizeObserver(([entry]) => {
      this.compact = entry.contentRect.width < 680
    })
    this.observer.observe(this.$el)
  },
  beforeUnmount() {
    this.observer.disconnect()
  },
  methods: {
    scrollToTop() {
      if (this.autoScroll) {
        const container = this.$el.closest('.app-main') || window
        container.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    handleSizeChange(val) {
      this.$emit('pagination', { page: this.currentPage, limit: val })
      this.scrollToTop()
    },
    handleCurrentChange(val) {
      this.$emit('pagination', { page: val, limit: this.pageSize })
      this.scrollToTop()
    }
  }
}
</script>

<style scoped>
.pagination-container {
  container-type: inline-size;
  background: transparent;
  padding: 32px 16px;
}
.pagination-container.hidden {
  display: none;
}
.pagination-container :deep(.el-pagination) {
  max-width: 100%;
  flex-wrap: wrap;
  justify-content: flex-end;
  row-gap: 8px;
}

@container (max-width: 679px) {
  .pagination-container :deep(.el-pagination) {
    justify-content: center;
  }

  .pagination-container :deep(.el-pagination__sizes) {
    margin-inline: 4px;
  }
}
</style>
