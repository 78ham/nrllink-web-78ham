import { defineStore } from 'pinia'

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [],
    cachedViews: []
  }),
  actions: {
    addView(view) {
      this.addVisitedView(view)
      this.addCachedView(view)
    },
    addVisitedView(view) {
      if (this.visitedViews.some(v => v.path === view.path)) return
      this.visitedViews.push(
        Object.assign({}, view, {
          title: view.meta.title || 'no-name'
        })
      )
    },
    addCachedView(view) {
      if (this.cachedViews.includes(view.name)) return
      if (!view.meta.noCache) {
        this.cachedViews.push(view.name)
      }
    },
    delView(view) {
      this.delVisitedView(view)
      this.delCachedView(view)
      return {
        visitedViews: [...this.visitedViews],
        cachedViews: [...this.cachedViews]
      }
    },
    delVisitedView(view) {
      for (const [i, v] of this.visitedViews.entries()) {
        if (v.path === view.path) {
          this.visitedViews.splice(i, 1)
          break
        }
      }
      return [...this.visitedViews]
    },
    delCachedView(view) {
      for (const i of this.cachedViews) {
        if (i === view.name) {
          const index = this.cachedViews.indexOf(i)
          this.cachedViews.splice(index, 1)
          break
        }
      }
      return [...this.cachedViews]
    },
    delOthersViews(view) {
      this.delOthersVisitedViews(view)
      this.delOthersCachedViews(view)
      return {
        visitedViews: [...this.visitedViews],
        cachedViews: [...this.cachedViews]
      }
    },
    delOthersVisitedViews(view) {
      this.visitedViews = this.visitedViews.filter(v => v.meta.affix || v.path === view.path)
      return [...this.visitedViews]
    },
    delOthersCachedViews(view) {
      for (const i of this.cachedViews) {
        if (i === view.name) {
          const index = this.cachedViews.indexOf(i)
          this.cachedViews = this.cachedViews.slice(index, index + 1)
          break
        }
      }
      return [...this.cachedViews]
    },
    delAllViews() {
      this.delAllVisitedViews()
      this.delAllCachedViews()
      return {
        visitedViews: [...this.visitedViews],
        cachedViews: [...this.cachedViews]
      }
    },
    delAllVisitedViews() {
      const affixTags = this.visitedViews.filter(tag => tag.meta.affix)
      this.visitedViews = affixTags
      return [...this.visitedViews]
    },
    delAllCachedViews() {
      this.cachedViews = []
      return [...this.cachedViews]
    },
    updateVisitedView(view) {
      const idx = this.visitedViews.findIndex(v => v.path === view.path)
      if (idx >= 0) {
        this.visitedViews[idx] = Object.assign({}, this.visitedViews[idx], view)
      }
    }
      }
    }
  }
})
