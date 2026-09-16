<template>
  <div class="app-container platform-theme-page profile-page">
    <div v-if="user">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="6">
          <user-card :user="user" />
        </el-col>

        <el-col :xs="24" :sm="18">
          <el-card class="platform-theme-card profile-content-card">
            <el-tabs v-model="activeTab">
              <!-- <el-tab-pane label="活动" name="activity">
                <activity />
              </el-tab-pane> -->
              <el-tab-pane label="时间线" name="timeline">
                <timeline :user="user" />
              </el-tab-pane>
              <el-tab-pane label="账号" name="account">
                <account :user="user" @updated="getUser" />
              </el-tab-pane>
              <!-- <el-tab-pane label="采单二维码" name="advqr">
                <advqr :user="user" />
              </el-tab-pane> -->
            </el-tabs>
          </el-card>
        </el-col>

      </el-row>

      <el-row v-if="isAdmin" :gutter="20">
        <el-col :span="24">
          <el-card class="platform-theme-card profile-admin-card">
            <template #header>
              <div class="admin-card-header">
                <span>{{ $t('profile.adminCenter') }}</span>
              </div>
            </template>
            <div class="profile-admin-grid">
              <router-link
                v-for="item in adminEntries"
                :key="item.path"
                :to="item.path"
                class="admin-entry-item"
              >
                <div class="admin-entry-icon">
                  <svg-icon :icon-class="item.icon" />
                </div>
                <span class="admin-entry-label">{{ $t(item.label) }}</span>
              </router-link>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useUserStore } from '@/store/modules/user'
import UserCard from './components/UserCard.vue'
// import Activity from './components/Activity'
import Timeline from './components/Timeline.vue'
import Account from './components/Account.vue'
// import Advqr from './components/Advqr'

export default {
  name: 'Profile',
  components: { UserCard, Timeline, Account },
  data() {
    return {
      user: {},
      activeTab: 'timeline'
    }
  },
  computed: {
    ...mapState(useUserStore, [
      'id',
      'name',
      'avatar',
      'roles',
      'phone',
      'callsign',
      'dmrid',
      'mdcid'
    ]),
    isAdmin() {
      return this.roles && this.roles.includes('admin')
    },
    adminEntries() {
      return [
        { path: '/setup/users', icon: 'user', label: 'route.users' },
        { path: '/setup/publicgroup', icon: 'peoples', label: 'route.publicgroup' },
        { path: '/setup/server', icon: 'table', label: 'route.server' },
        { path: '/log/operatorlog', icon: 'documentation', label: 'route.operatorlog' }
      ]
    }
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      this.user = {
        id: this.id,
        name: this.name,
        role: this.roles.join(' | '),
        phone: this.phone,
        callsign: this.callsign,
        dmrid: this.dmrid,
        mdcid: this.mdcid,
        email: 'caoc@live.com',
        avatar: this.avatar
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  :deep(.el-col) {
    margin-bottom: 20px;
  }

  .profile-content-card {
    :deep(.el-card__header),
    :deep(.el-card__body) {
      background: transparent !important;
    }

    :deep(.el-tabs__content) {
      background: transparent !important;
      background-color: transparent !important;
    }

    :deep(.el-tabs__content),
    :deep(.el-tab-pane) {
      background: transparent !important;
      background-color: transparent !important;
    }

    :deep(.el-card__body) {
      padding: 24px;
    }

    :deep(.el-tabs__header) {
      margin-bottom: 20px;
    }

    :deep(.el-tabs__nav-wrap::after) {
      background: var(--platform-border-light);
    }

    :deep(.el-tabs__item) {
      color: var(--platform-ink-dim);
      font-weight: 600;
    }

    :deep(.el-tabs__item.is-active) {
      color: var(--platform-ink);
    }

    :deep(.el-tabs__active-bar) {
      background: linear-gradient(90deg, var(--platform-accent) 0%, var(--platform-accent-2) 100%);
      border-radius: 999px;
    }
  }

  .profile-admin-card {
    margin-top: 10px;

    :deep(.el-card__body) {
      padding: 16px;
    }

    .admin-card-header {
      font-weight: 600;
      color: var(--platform-ink);
      font-size: 15px;
    }

    .profile-admin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 12px;
    }

    .admin-entry-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px 12px;
      border-radius: 12px;
      background: var(--platform-surface-light, rgba(255, 255, 255, 0.03));
      border: 1px solid var(--platform-border, rgba(255, 255, 255, 0.08));
      color: var(--platform-ink);
      text-decoration: none;
      transition: all 0.2s ease;
      min-height: 44px;

      &:active {
        transform: scale(0.96);
        background: var(--platform-surface-xlight, rgba(255, 255, 255, 0.06));
      }

      .admin-entry-icon {
        font-size: 24px;
        margin-bottom: 8px;
        color: var(--platform-accent);
      }

      .admin-entry-label {
        font-size: 13px;
        font-weight: 500;
      }
    }
  }
}
</style>
