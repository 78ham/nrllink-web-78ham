import { describe, it, expect, vi } from 'vitest'
import { defineComponent, ref, h } from 'vue'
import { mount } from '@vue/test-utils'
import { usePanelLayout } from '@/composables/usePanelLayout'

// 锁定 setup() 与 Options API 混用语义（usePanelLayout 依赖此行为）：
// setup 返回的 ref 在 data/computed/methods 中通过 this 读写均自动解包，
// 且对 this.xxxRef 赋值会写入 ref.value。
describe('setup 与 Options API 混用语义', () => {
  const useThing = () => {
    const count = ref(1)
    const bump = () => { count.value++ }
    return { count, bump }
  }

  const Comp = defineComponent({
    setup() {
      return { ...useThing() }
    },
    data() {
      return { label: 'x' }
    },
    computed: {
      doubled() {
        return this.count * 2
      }
    },
    methods: {
      reset() {
        this.count = 10
      }
    },
    render() {
      return h('div', `${this.count}-${this.doubled}-${this.label}`)
    }
  })

  it('this 可读 setup 返回的 ref', () => {
    const wrapper = mount(Comp)
    expect(wrapper.text()).toContain('1-2-x')
  })

  it('methods 中调用 setup 返回的函数', () => {
    const wrapper = mount(Comp)
    wrapper.vm.bump()
    expect(wrapper.vm.count).toBe(2)
    expect(wrapper.vm.doubled).toBe(4)
  })

  it('this 对 setup ref 赋值写入 ref.value', () => {
    const wrapper = mount(Comp)
    wrapper.vm.reset()
    expect(wrapper.vm.count).toBe(10)
    expect(wrapper.vm.doubled).toBe(20)
  })
})

describe('login panel layout', () => {
  it('uses the available container width and keeps the default three panels apart on resize', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    try {
      const panels = usePanelLayout()
      panels.contentWrapper.value = { clientWidth: 1000 }
      panels.initializePanels()
      expect(panels.isDesktopPanels.value).toBe(false)
      for (const width of [1450, 1068]) {
        panels.contentWrapper.value.clientWidth = width
        panels.initializePanels()
        const { left, middle, right } = panels.panelLayouts.value
        expect(panels.isDesktopPanels.value).toBe(true)
        expect(left.x + left.w).toBeLessThan(middle.x)
        expect(middle.x + middle.w).toBeLessThan(right.x)
        expect(right.x + right.w).toBe(width)
      }
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
