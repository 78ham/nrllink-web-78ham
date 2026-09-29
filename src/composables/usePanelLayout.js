import { ref } from 'vue'

/**
 * 登录页桌面端三栏面板布局：初始化、拖拽、缩放与置顶。
 *
 * 通过 setup() 返回并与 Options API 混用；contentWrapper ref 与模板中
 * ref="contentWrapper" 的元素自动绑定。
 *
 * 返回的状态/方法（原样对应组件模板中的调用）：
 *   isDesktopPanels / panelLayouts / panelZIndices / getPanelStyle /
 *   initializePanels / bringPanelToFront / startPanelDrag / startPanelResize /
 *   stopPanelInteraction
 */
export function usePanelLayout() {
  const contentWrapper = ref(null)
  const isDesktopPanels = ref(false)
  const panelLayouts = ref({
    left: { visible: true, x: 0, y: 0, w: 300, h: 640 },
    middle: { visible: true, x: 324, y: 0, w: 720, h: 760 },
    right: { visible: true, x: 1068, y: 0, w: 320, h: 760 }
  })
  const panelZIndices = ref({
    left: 1,
    middle: 2,
    right: 3
  })
  const nextPanelZIndex = ref(4)
  const panelInteraction = ref(null)
  const panelDefaultsInitialized = ref(false)

  function getPanelLimits(panelId) {
    const limits = {
      left: { minW: 260, minH: 280 },
      middle: { minW: 480, minH: 360 },
      right: { minW: 280, minH: 280 }
    }

    return limits[panelId] || { minW: 260, minH: 260 }
  }

  function clampPanelLayout(panelId, layout) {
    if (!contentWrapper.value) {
      return layout
    }

    const wrapperWidth = contentWrapper.value.clientWidth
    const limits = getPanelLimits(panelId)
    const maxWidth = Math.max(limits.minW, wrapperWidth)
    const width = Math.min(Math.max(layout.w, limits.minW), maxWidth)
    const maxX = Math.max(0, wrapperWidth - width)
    const x = Math.min(Math.max(layout.x, 0), maxX)
    const y = Math.max(layout.y, 0)
    const h = Math.max(layout.h, limits.minH)

    return { ...layout, x, y, w: width, h }
  }

  function initializePanels(forceReset = false) {
    if (typeof window === 'undefined' || !contentWrapper.value) {
      return
    }

    const desktop = window.innerWidth >= 1024
    isDesktopPanels.value = desktop

    if (!desktop) {
      stopPanelInteraction()
      return
    }

    const wrapperWidth = contentWrapper.value.clientWidth
    const gap = 24
    const topOffset = 20
    const leftWidth = Math.max(260, Math.min(320, Math.round(wrapperWidth * 0.22)))
    const rightWidth = Math.max(280, Math.min(340, Math.round(wrapperWidth * 0.24)))
    const middleWidth = Math.max(480, wrapperWidth - leftWidth - rightWidth - gap * 2)
    const defaults = {
      left: { x: 0, y: topOffset, w: leftWidth, h: 640 },
      middle: { x: leftWidth + gap, y: topOffset, w: middleWidth, h: 760 },
      right: { x: leftWidth + gap + middleWidth + gap, y: topOffset, w: rightWidth, h: 760 }
    }

    if (forceReset || !panelDefaultsInitialized.value) {
      panelLayouts.value = {
        left: { ...defaults.left, visible: panelLayouts.value.left.visible },
        middle: { ...defaults.middle, visible: panelLayouts.value.middle.visible },
        right: { ...defaults.right, visible: panelLayouts.value.right.visible }
      }
      panelDefaultsInitialized.value = true
      return
    }

    panelLayouts.value = {
      left: clampPanelLayout('left', panelLayouts.value.left),
      middle: clampPanelLayout('middle', panelLayouts.value.middle),
      right: clampPanelLayout('right', panelLayouts.value.right)
    }
  }

  function getPanelStyle(panelId) {
    if (!isDesktopPanels.value) {
      return {}
    }

    const layout = panelLayouts.value[panelId]
    return {
      left: `${layout.x}px`,
      top: `${layout.y}px`,
      width: `${layout.w}px`,
      height: `${layout.h}px`,
      zIndex: panelZIndices.value[panelId]
    }
  }

  function bringPanelToFront(panelId) {
    const currentZ = panelZIndices.value[panelId]
    const highestZ = Math.max(...Object.values(panelZIndices.value))
    if (currentZ === highestZ) {
      return
    }

    panelZIndices.value = {
      ...panelZIndices.value,
      [panelId]: nextPanelZIndex.value
    }
    nextPanelZIndex.value += 1
  }

  function handlePanelPointerMove(event) {
    if (!panelInteraction.value || !contentWrapper.value) {
      return
    }

    const wrapperRect = contentWrapper.value.getBoundingClientRect()
    const interaction = panelInteraction.value
    const panel = panelLayouts.value[interaction.panelId]
    const limits = getPanelLimits(interaction.panelId)
    const dx = event.clientX - interaction.startX
    const dy = event.clientY - interaction.startY

    if (interaction.type === 'drag') {
      const maxX = Math.max(0, wrapperRect.width - panel.w)
      const nextX = Math.min(Math.max(interaction.originX + dx, 0), maxX)
      const nextY = Math.max(interaction.originY + dy, 0)
      panelLayouts.value = {
        ...panelLayouts.value,
        [interaction.panelId]: {
          ...panel,
          x: nextX,
          y: nextY
        }
      }
      return
    }

    const maxWidth = Math.max(limits.minW, wrapperRect.width - panel.x)
    const nextWidth = Math.min(Math.max(interaction.originW + dx, limits.minW), maxWidth)
    const nextHeight = Math.max(interaction.originH + dy, limits.minH)
    panelLayouts.value = {
      ...panelLayouts.value,
      [interaction.panelId]: {
        ...panel,
        w: nextWidth,
        h: nextHeight
      }
    }
  }

  function stopPanelInteraction() {
    panelInteraction.value = null
    window.removeEventListener('mousemove', handlePanelPointerMove)
    window.removeEventListener('mouseup', stopPanelInteraction)
    if (typeof document !== 'undefined') {
      document.body.classList.remove('panel-interacting')
    }
  }

  function startPanelDrag(panelId, event) {
    if (!isDesktopPanels.value || event.button !== 0) {
      return
    }

    bringPanelToFront(panelId)
    const panel = panelLayouts.value[panelId]
    panelInteraction.value = {
      type: 'drag',
      panelId,
      startX: event.clientX,
      startY: event.clientY,
      originX: panel.x,
      originY: panel.y
    }
    window.addEventListener('mousemove', handlePanelPointerMove)
    window.addEventListener('mouseup', stopPanelInteraction)
    document.body.classList.add('panel-interacting')
    event.preventDefault()
  }

  function startPanelResize(panelId, event) {
    if (!isDesktopPanels.value || event.button !== 0) {
      return
    }

    bringPanelToFront(panelId)
    const panel = panelLayouts.value[panelId]
    panelInteraction.value = {
      type: 'resize',
      panelId,
      startX: event.clientX,
      startY: event.clientY,
      originW: panel.w,
      originH: panel.h
    }
    window.addEventListener('mousemove', handlePanelPointerMove)
    window.addEventListener('mouseup', stopPanelInteraction)
    document.body.classList.add('panel-interacting')
    event.preventDefault()
  }

  return {
    contentWrapper,
    isDesktopPanels,
    panelLayouts,
    panelZIndices,
    getPanelLimits,
    initializePanels,
    clampPanelLayout,
    getPanelStyle,
    bringPanelToFront,
    startPanelDrag,
    startPanelResize,
    handlePanelPointerMove,
    stopPanelInteraction
  }
}
