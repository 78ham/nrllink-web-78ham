<template>
  <div class="app-container platform-theme-page setup-role-page">
    <div class="filter-container platform-theme-toolbar admin-list-toolbar">
      <div class="admin-list-actions">
        <el-button type="primary" class="filter-item action-btn" @click="handleAddRole">
          {{ $t('permission.addRole') }}
        </el-button>

        <button
          type="button"
          class="toolbar-capsule"
          :class="{ 'is-active': showtable }"
          :aria-pressed="showtable"
          @click="showtable = !showtable"
        >
          <span class="capsule-indicator" />
          <span>{{ $t('device.showtable') }}</span>
        </button>
      </div>
    </div>

    <div v-if="showtable" class="table-shell roles-table-shell table-responsive">
      <el-table v-loading="rolesLoading" :data="rolesList" border style="width: 100%">
        <el-table-column align="center" label="序号" min-width="100">
          <template #default="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column align="center" label="角色关键字" min-width="220">
          <template #default="scope">
            <el-tag class="role-key-tag">{{ scope.row.key }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="角色名称" min-width="220">
          <template #default="scope">
            <div class="role-name-cell">{{ scope.row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="描述" min-width="260">
          <template #default="scope">
            <div class="role-description-cell">{{ scope.row.description || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" min-width="220">
          <template #default="scope">
            <el-button
              type="primary"
              plain
              size="small"
              class="compact-btn role-edit-btn"
              @click="handleEdit(scope)"
            >{{ $t('permission.editPermission') }}</el-button>
            <el-button
              type="danger"
              plain
              size="small"
              class="compact-btn role-delete-btn"
              :disabled="scope.row.key === 'admin'"
              @click="handleDelete(scope.row)"
            >{{ $t('permission.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else v-loading="rolesLoading" class="role-card-grid admin-card-grid">
      <el-empty v-if="!rolesLoading && !rolesList.length" />
      <article v-for="item in rolesList" :key="item.key" class="role-card">
        <div class="role-card__header">
          <el-tag size="small" effect="dark" class="role-key-tag">{{ item.key }}</el-tag>
          <h3>{{ item.name }}</h3>
        </div>
        <div class="role-card__body">
          <div class="role-card__row role-card__row--stack">
            <span class="role-card__label">描述</span>
            <p class="role-card__note">{{ item.description || '--' }}</p>
          </div>
        </div>
        <div class="role-card__actions">
          <el-button type="primary" plain size="small" class="compact-btn role-edit-btn" @click="handleEdit({ row: item })">{{ $t('permission.editPermission') }}</el-button>
          <el-button type="danger" plain size="small" class="compact-btn role-delete-btn" :disabled="item.key === 'admin'" @click="handleDelete(item)">{{ $t('permission.delete') }}</el-button>
        </div>
      </article>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogType === 'edit' ? 'Edit Role' : 'New Role'" class="platform-theme-dialog setup-role-dialog">
      <el-form :model="role" label-width="96px" label-position="left" class="setup-role-form">
        <el-form-item label="关键字">
          <el-input v-model="role.key" placeholder="此处输入角色简写" />
        </el-form-item>
        <el-form-item label="角色名">
          <el-input v-model="role.name" placeholder="此处输入角色名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="此处输入角色说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer role-dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('permission.cancel') }}</el-button>
          <el-button type="primary" :loading="savingRole" @click="confirmRole">{{ $t('permission.confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { reportMutationError } from '@/composables/useCrudList'
import { deepClone } from '@/utils'
import {
  getRoutes,
  getRoles,
  addRole,
  deleteRole,
  updateRole
} from '@/api/role'
import i18n from '@/lang'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useListView } from '@/composables/useListView'

const resolveRoutePath = (basePath, routePath) => {
  if (routePath.startsWith('/')) {
    return routePath
  }
  if (basePath.endsWith('/')) {
    return `${basePath}${routePath}`
  }
  return `${basePath}/${routePath}`
}

const defaultRole = {
  key: '',
  name: '',
  description: '',
  routes: ''
}

export default {
  name: 'SetupRolePage',
  setup: useListView,
  data() {
    return {
      role: Object.assign({}, defaultRole),
      routes: [],
      rolesList: [],
      rolesLoading: true,
      savingRole: false,
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    this.getRoles()
  },
  methods: {
    async getRoutes() {
      const res = await getRoutes()
      this.serviceRoutes = res.data
      const routes = this.generateRoutes(res.data)
      this.routes = this.i18n(routes)
    },
    async getRoles() {
      this.rolesLoading = true
      try {
        const res = await getRoles()
        this.rolesList = res.data
      } finally {
        this.rolesLoading = false
      }
    },
    i18n(routes) {
      const app = routes.map(route => {
        route.title = i18n.global.t(`route.${route.title}`)
        if (route.children) {
          route.children = this.i18n(route.children)
        }
        return route
      })
      return app
    },
    generateRoutes(routes, basePath = '/') {
      const res = []

      for (let route of routes) {
        if (route.hidden) {
          continue
        }

        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)

        if (route.children && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }

        const data = {
          path: resolveRoutePath(basePath, route.path),
          title: route.meta && route.meta.title
        }

        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        data.push(route)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
    },
    handleDelete(row) {
      ElMessageBox.confirm('确认要删除职位角色?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const response = await deleteRole(row.key)
          if (reportMutationError(response)) return
          await this.getRoles()
          ElMessage.success('角色删除成功')
        })
        .catch(err => {
          console.error(err)
        })
    },
    generateTree(routes, basePath = '/', checkedKeys) {
      const res = []

      for (const route of routes) {
        const routePath = resolveRoutePath(basePath, route.path)

        if (route.children) {
          route.children = this.generateTree(route.children, routePath, checkedKeys)
        }

        if (checkedKeys.includes(routePath) || (route.children && route.children.length >= 1)) {
          res.push(route)
        }
      }
      return res
    },
    async confirmRole() {
      this.savingRole = true
      try {
        const response = this.dialogType === 'edit'
          ? await updateRole(this.role.key, this.role)
          : await addRole(this.role)
        if (reportMutationError(response)) return
        this.dialogVisible = false
        ElMessage.success(`角色 ${this.role.name} 保存成功`)
        await this.getRoles()
      } finally {
        this.savingRole = false
      }
    },
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = resolveRoutePath(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      if (showingChildren.length === 0) {
        onlyOneChild = { ...parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.table-shell {
  padding: 10px;
}

.setup-role-page {
  .roles-table-shell {
    margin-top: 0;
  }

  .role-key-tag {
    color: var(--action-at-text, #9effea) !important;
    border-color: var(--action-at-border, rgba(54, 240, 203, 0.28)) !important;
    background: var(--action-at-bg, linear-gradient(135deg, rgba(14, 77, 78, 0.26) 0%, rgba(12, 42, 67, 0.22) 100%)) !important;
  }

  .role-name-cell {
    color: var(--platform-ink);
    font-weight: 700;
  }

  .role-description-cell {
    color: var(--platform-note-text, rgba(228, 239, 255, 0.74));
    line-height: 1.6;
    word-break: break-word;
    padding: 0 4px;
  }

  .compact-btn {
    min-width: 84px;
    padding: 6px 14px;
    margin: 0 4px !important;
    border-radius: 12px;
    transition: all 0.25s ease;
    white-space: nowrap;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 18px rgba(3, 9, 21, 0.2);
    }
  }

  .role-edit-btn {
    color: var(--action-edit-text, #9feaff) !important;
    border-color: var(--action-edit-border, rgba(88, 184, 255, 0.44)) !important;
    background: var(--action-edit-bg, linear-gradient(135deg, rgba(20, 64, 108, 0.38) 0%, rgba(18, 45, 90, 0.28) 100%)) !important;
    box-shadow: 0 0 0 1px var(--action-edit-shadow, rgba(88, 184, 255, 0.08)) inset;
  }

  .role-delete-btn {
    color: var(--action-delete-text, #ffb3bf) !important;
    border-color: var(--action-delete-border, rgba(255, 116, 145, 0.4)) !important;
    background: var(--action-delete-bg, linear-gradient(135deg, rgba(82, 24, 42, 0.34) 0%, rgba(56, 18, 34, 0.26) 100%)) !important;
    box-shadow: 0 0 0 1px var(--action-delete-shadow, rgba(255, 116, 145, 0.08)) inset;
  }

  :deep(.el-table td.el-table__cell) {
    padding: 12px 0;
  }

  :deep(.el-table th.el-table__cell) {
    height: 56px;
    font-weight: 700;
  }
}

.setup-role-form {
  width: min(100%, 520px);
  margin: 0 auto;
}

.role-card-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap:18px; padding:10px; }
.role-card { border-radius:24px; border:1px solid var(--platform-border-light); background:var(--platform-shell); box-shadow:0 18px 44px rgba(15,23,42,.08); padding:18px; display:flex; flex-direction:column; gap:16px; }
.role-card__header { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.role-card__header h3 { margin:0; color:var(--platform-ink); font-size:18px; line-height:1.35; word-break:break-word; }
.role-card__row { display:grid; grid-template-columns:minmax(84px, 96px) minmax(0, 1fr); align-items:center; gap:12px; padding:12px 14px; border-radius:16px; background:var(--platform-surface-xlight); border:1px solid var(--platform-border-light); }
.role-card__row--stack { align-items:flex-start; flex-direction:column; }
.role-card__label { color:var(--platform-note-text, rgba(228,239,255,.54)); font-size:12px; letter-spacing:.02em; }
.role-card__note { width:100%; margin:0; text-align:left; color:var(--platform-note-text, rgba(228,239,255,.78)); line-height:1.55; word-break:break-word; }
.role-card__actions { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:10px; }

.role-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.permission-tree {
  margin-bottom: 30px;
}

@media (max-width: 767px) {

  .setup-role-page {
    .compact-btn {
      min-width: 72px;
      margin: 4px !important;
    }
  }

  .role-card-grid { grid-template-columns: 1fr; gap: 14px; padding: 6px 0 0; }
  .role-card { padding: 14px; border-radius: 18px; gap: 14px; }
  .role-card__header { flex-direction: column; align-items: stretch; gap: 10px; }
  .role-card__header h3 { font-size: 17px; }
  .role-card__row { grid-template-columns: 80px minmax(0, 1fr); gap: 10px; padding: 10px 12px; }
  .role-card__row--stack { display: flex; flex-direction: column; align-items: flex-start; }
  .role-card__actions { justify-content: stretch; flex-direction: column; gap: 8px; }
  .role-card__actions .compact-btn { width: 100%; margin: 0 !important; }
}
.table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
</style>
