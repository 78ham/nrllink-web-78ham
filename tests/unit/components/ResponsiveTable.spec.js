import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import ResponsiveTable from '@/components/ResponsiveTable/index.vue'

describe('components/ResponsiveTable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockColumns = [
    { prop: 'callsign', label: '呼号' },
    { prop: 'name', label: '设备名称' },
    {
      prop: 'status',
      label: '状态',
      formatter: (row) => (row.status === 1 ? '在线' : '离线')
    }
  ]

  const mockData = [
    { id: 1, name: '设备A', callsign: 'BG4XXX-1', status: 1 },
    { id: 2, name: '设备B', callsign: 'BH4YYY-2', status: 0 }
  ]

  it('renders table slot on desktop without card stream', () => {
    const appStore = useAppStore()
    appStore.toggleDevice('desktop')

    const wrapper = mount(ResponsiveTable, {
      props: {
        data: mockData,
        columns: mockColumns
      },
      slots: {
        table: '<div class="custom-el-table">ElTable Mock</div>'
      }
    })

    expect(wrapper.find('.responsive-table__desktop').exists()).toBe(true)
    expect(wrapper.find('.custom-el-table').text()).toBe('ElTable Mock')
    expect(wrapper.find('.responsive-table__mobile').exists()).toBe(false)
  })

  it('renders card stream on mobile', () => {
    const appStore = useAppStore()
    appStore.toggleDevice('mobile')

    const wrapper = mount(ResponsiveTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        titleKey: 'name'
      },
      slots: {
        table: '<div class="custom-el-table">ElTable Mock</div>',
        badge: '<span class="test-badge">Badge</span>'
      }
    })

    expect(wrapper.find('.responsive-table__desktop').exists()).toBe(false)
    expect(wrapper.find('.responsive-table__mobile').exists()).toBe(true)
    const cards = wrapper.findAll('.rt-card')
    expect(cards).toHaveLength(2)
    expect(cards[0].find('.rt-card__title').text()).toBe('设备A')
    expect(cards[0].find('.test-badge').exists()).toBe(true)
    expect(cards[0].text()).toContain('在线')
  })

  it('handles virtual scrolling when data exceeds virtualThreshold', () => {
    const appStore = useAppStore()
    appStore.toggleDevice('mobile')

    // 生成 200 条测试假数据
    const largeData = Array.from({ length: 200 }, (_, i) => ({
      id: i + 1,
      name: `设备 #${i + 1}`,
      callsign: `BG4-${i + 1}`,
      status: i % 2
    }))

    const wrapper = mount(ResponsiveTable, {
      props: {
        data: largeData,
        columns: mockColumns,
        virtualThreshold: 100,
        itemHeight: 120
      }
    })

    expect(wrapper.vm.useVirtual).toBe(true)
    // 初始渲染窗口应该小于 200
    expect(wrapper.findAll('.rt-card').length).toBeLessThan(200)
  })

  it('emits load-more when button is clicked', async () => {
    const appStore = useAppStore()
    appStore.toggleDevice('mobile')

    const wrapper = mount(ResponsiveTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        hasMore: true
      }
    })

    const loadMoreBtn = wrapper.find('.rt-load-more')
    expect(loadMoreBtn.exists()).toBe(true)
    await loadMoreBtn.trigger('click')
    expect(wrapper.emitted('load-more')).toBeTruthy()
  })

  it('renders skeleton on loading without data', () => {
    const appStore = useAppStore()
    appStore.toggleDevice('mobile')

    const wrapper = mount(ResponsiveTable, {
      props: {
        data: [],
        columns: mockColumns,
        loading: true
      }
    })

    expect(wrapper.find('.rt-skeleton').exists()).toBe(true)
    expect(wrapper.findAll('.rt-skeleton__card')).toHaveLength(4)
  })

  it('renders empty state when data is empty and not loading', () => {
    const appStore = useAppStore()
    appStore.toggleDevice('mobile')

    const wrapper = mount(ResponsiveTable, {
      props: {
        data: [],
        columns: mockColumns,
        loading: false,
        emptyText: '没有找到任何记录'
      }
    })

    expect(wrapper.find('.rt-empty').text()).toContain('没有找到任何记录')
  })
})
