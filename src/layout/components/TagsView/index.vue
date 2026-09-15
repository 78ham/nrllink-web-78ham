<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane ref="scrollPane" class="tags-view-wrapper">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        v-slot="{ navigate }"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        custom
      >
        <span
          ref="tag"
          :data-path="tag.path"
          :data-full-path="tag.fullPath"
          :class="isActive(tag)?'active':''"
          class="tags-view-item"
          @click="navigate"
          @click.middle="closeSelectedTag(tag)"
          @contextmenu.prevent="openMenu(tag,$event)"
        >
          {{ generateTitle(tag.title) }}
          <el-icon v-if="!tag.meta.affix" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)">
            <Close />
          </el-icon>
        </span>
      </router-link>
    </scroll-pane>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">
        {{ $t('tagsView.refresh') }}
      </li>
      <li v-if="!(selectedTag.meta&&selectedTag.meta.affix)" @click="closeSelectedTag(selectedTag)">
        {{
          $t('tagsView.close') }}
      </li>
      <li @click="closeOthersTags">
        {{ $t('tagsView.closeOthers') }}
      </li>
      <li @click="closeAllTags(selectedTag)">
        {{ $t('tagsView.closeAll') }}
      </li>
    </ul>
  </div>
</template>

<script>
import ScrollPane from './ScrollPane.vue'
import { generateTitle } from '@/utils/i18n'
const resolvePath = (basePath, routePath) => {
  if (routePath.startsWith('/')) {
    return routePath
  }
  if (basePath.endsWith('/')) {
    return `${basePath}${routePath}`
  }
  return `${basePath}/${routePath}`
}
import { mapState } from 'pinia'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { usePermissionStore } from '@/store/modules/permission'

export default {
  components: { ScrollPane },
  data() {
    return {
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},
      affixTags: []
    }
  },
  computed: {
    ...mapState(useTagsViewStore, ['visitedViews']),
    ...mapState(usePermissionStore, ['routes'])
  },
  watch: {
    $route() {
      this.addTags()
      this.moveToCurrentTag()
    },
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  mounted() {
    this.initTags()
    this.addTags()
  },
  methods: {
    generateTitle, // generateTitle by vue-i18n
    isActive(route) {
      return route.path === this.$route.path
    },
    filterAffixTags(routes, basePath = '/') {
      let tags = []
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = resolvePath(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path)
          if (tempTags.length >= 1) {
            tags = [...tags, ...tempTags]
          }
        }
      })
      return tags
    },
    initTags() {
      const affixTags = this.affixTags = this.filterAffixTags(this.routes)
      for (const tag of affixTags) {
        // Must have tag name
        if (tag.name) {
          const tagsViewStore = useTagsViewStore()
          tagsViewStore.addVisitedView(tag)
        }
      }
    },
    addTags() {
      const { name } = this.$route
      if (name) {
        const tagsViewStore = useTagsViewStore()
        tagsViewStore.addView(this.$route)
      }
      return false
    },
    moveToCurrentTag() {
      const tags = this.$refs.tag
      this.$nextTick(() => {
        const tagElements = Array.isArray(tags) ? tags : [tags]
        for (const tagEl of tagElements) {
          if (!tagEl) continue
          const path = tagEl.dataset.path
          const fullPath = tagEl.dataset.fullPath
          if (path === this.$route.path) {
            this.$refs.scrollPane.moveToTarget(tagEl)
            if (fullPath !== this.$route.fullPath) {
              const tagsViewStore = useTagsViewStore()
              tagsViewStore.updateVisitedView(this.$route)
            }
            break
          }
        }
      })
    },
    refreshSelectedTag(view) {
      const tagsViewStore = useTagsViewStore()
      tagsViewStore.delCachedView(view)
      this.$nextTick(() => {
        const { fullPath } = view
        this.$router.replace({
          path: '/redirect' + fullPath
        })
      })
    },
    closeSelectedTag(view) {
      const tagsViewStore = useTagsViewStore()
      const { visitedViews } = tagsViewStore.delView(view)
      if (this.isActive(view)) {
        this.toLastView(visitedViews, view)
      }
    },
    closeOthersTags() {
      this.$router.push(this.selectedTag)
      const tagsViewStore = useTagsViewStore()
      tagsViewStore.delOthersViews(this.selectedTag)
      this.moveToCurrentTag()
    },
    closeAllTags(view) {
      const tagsViewStore = useTagsViewStore()
      const { visitedViews } = tagsViewStore.delAllViews()
      if (this.affixTags.some(tag => tag.path === view.path)) {
        return
      }
      this.toLastView(visitedViews, view)
    },
    toLastView(visitedViews, view) {
      const latestView = visitedViews.slice(-1)[0]
      if (latestView) {
        this.$router.push(latestView)
      } else {
        // now the default is to redirect to the home page if there is no tags-view,
        // you can adjust it according to your needs.
        if (view.name === 'Dashboard') {
          // to reload home page
          this.$router.replace({ path: '/redirect' + view.fullPath })
        } else {
          this.$router.push('/')
        }
      }
    },
    openMenu(tag, e) {
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = e.clientX - offsetLeft + 15 // 15: margin right

      if (left > maxLeft) {
        this.left = maxLeft
      } else {
        this.left = left
      }

      this.top = e.clientY
      this.visible = true
      this.selectedTag = tag
    },
    closeMenu() {
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 36px;
  width: 100%;
  background: var(--platform-shell);
  border-bottom: 1px solid var(--platform-border);

  .tags-view-wrapper {
    height: 100%;
    display: flex;
    align-items: center;

    .tags-view-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid var(--platform-border);
      color: var(--platform-ink-dim);
      background: var(--platform-surface);
      padding: 0 10px;
      font-size: 12px;
      font-weight: 500;
      border-radius: 6px;
      margin-left: 6px;
      transition: all 0.15s cubic-bezier(0.2, 0, 0, 1);

      &:first-of-type {
        margin-left: 12px;
      }

      &:last-of-type {
        margin-right: 12px;
      }

      &:hover {
        color: var(--platform-ink);
        border-color: var(--platform-border-strong);
        background: var(--platform-surface-soft);
      }

      &.active {
        background: var(--platform-surface-soft);
        color: var(--platform-ink);
        border-color: var(--platform-border-accent);
        font-weight: 600;

        &::before {
          content: '';
          background: var(--platform-accent);
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          box-shadow: 0 0 6px var(--platform-accent);
        }
      }
    }
  }

  .contextmenu {
    margin: 0;
    background: var(--platform-surface);
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 4px;
    border-radius: 10px;
    font-size: 12px;
    color: var(--platform-ink-dim);
    border: 1px solid var(--platform-border);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);

    li {
      margin: 2px 0;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;

      &:hover {
        background: var(--platform-surface-soft);
        color: var(--platform-ink);
      }
    }
  }
}
</style>

<style lang="scss">
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 14px;
      height: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      border-radius: 50%;
      text-align: center;
      transition: all 0.2s ease;
      color: var(--platform-ink-dim);

      &:hover {
        background-color: var(--platform-surface-light);
        color: var(--platform-ink);
      }
    }
  }
}
</style>
