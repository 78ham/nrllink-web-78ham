import { computed, ref } from 'vue'
import { useAppStore } from '@/store/modules/app'

export function useListView() {
  const app = useAppStore()
  const preference = ref(null)
  const showtable = computed({
    get: () => preference.value ?? app.isDesktop,
    set: value => { preference.value = value }
  })

  const mobileCards = computed(() => app.isMobile && !showtable.value)

  return { showtable, mobileCards }
}
