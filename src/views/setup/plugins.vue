<template>
  <div class="app-container">
    <!-- 插件卡片列表 -->
    <el-row :gutter="16">
      <el-col v-for="plugin in pluginList" :key="plugin.name" :xs="24" :sm="12" :lg="8">
        <el-card class="plugin-card" shadow="hover">
          <div class="plugin-card-header">
            <div class="plugin-title">
              <span class="status-dot" :class="plugin.running ? 'running' : 'stopped'" />
              <span class="plugin-name">{{ pluginDisplayName(plugin.name) }}</span>
              <el-tag size="small" :type="plugin.running ? 'success' : 'info'" class="status-tag">
                {{ plugin.running ? $t('plugin.running') : $t('plugin.stopped') }}
              </el-tag>
            </div>
            <el-switch
              :model-value="plugin.enabled"
              :loading="togglingPlugins.has(plugin.name)"
              @change="handleToggle(plugin)"
            />
          </div>
          <div class="plugin-desc">{{ plugin.description }}</div>
          <div class="plugin-actions">
            <el-button size="small" type="primary" plain @click="openConfigDialog(plugin)">
              {{ $t('plugin.configure') }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 桥接状态面板（bridge 插件运行数据） -->
    <el-card v-if="bridgePanelVisible" class="bridge-panel" shadow="never">
      <template #header>
        <div class="bridge-panel-header">
          <span>{{ $t('plugin.bridgeStatus') }}</span>
          <el-tag size="small" :type="bridgeRunning ? 'success' : 'info'">
            {{ bridgeRunning ? $t('plugin.running') : $t('plugin.stopped') }}
          </el-tag>
        </div>
      </template>
      <el-table :data="bridgeStatusList" size="small">
        <el-table-column :label="$t('plugin.bridgeName')" prop="name" min-width="120" />
        <el-table-column :label="$t('plugin.bridgeConnected')" min-width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="row.connected ? 'success' : 'danger'">
              {{ row.connected ? $t('plugin.connected') : $t('plugin.disconnected') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('plugin.rxPackets')" prop="rx_packets" min-width="90" />
        <el-table-column :label="$t('plugin.txPackets')" prop="tx_packets" min-width="90" />
        <el-table-column :label="$t('plugin.dropped')" prop="dropped" min-width="80" />
        <el-table-column :label="$t('plugin.lastError')" min-width="160">
          <template #default="{ row }">
            <span :class="{ 'bridge-error': row.last_error }">{{ row.last_error || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('plugin.lastActive')" min-width="150">
          <template #default="{ row }">{{ row.last_active || '--' }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 配置对话框：bridge 用结构化表单，其余插件用 JSON 编辑器 -->
    <el-dialog
      v-model="configDialogVisible"
      :title="$t('plugin.configTitle', { name: editingPluginName })"
      width="720px"
      :close-on-click-modal="false"
    >
      <template v-if="editingPluginName === 'bridge'">
        <el-alert
          :title="$t('plugin.bridgeFormHint')"
          type="info"
          :closable="false"
          class="config-hint"
        />
        <el-table :data="bridgeForm.bridges" size="small">
          <el-table-column :label="$t('plugin.cfgName')" min-width="110">
            <template #default="{ row }">
              <el-input v-model="row.name" size="small" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('plugin.cfgType')" min-width="90">
            <template #default="{ row }">
              <el-select v-model="row.type" size="small">
                <el-option label="nrl" value="nrl" />
                <el-option label="bm" value="bm" disabled />
                <el-option label="custom" value="custom" disabled />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="$t('plugin.cfgRemoteHost')" min-width="130">
            <template #default="{ row }">
              <el-input v-model="row.remote_host" size="small" placeholder="IP/域名" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('plugin.cfgRemotePort')" min-width="90">
            <template #default="{ row }">
              <el-input-number v-model="row.remote_port" size="small" :min="1" :max="65535" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('plugin.cfgLocalGroup')" min-width="150">
            <template #default="{ row }">
              <el-select v-model="row.local_group_id" size="small" filterable>
                <el-option
                  v-for="group in groupOptions"
                  :key="group.id"
                  :label="`${group.id} - ${group.name}`"
                  :value="group.id"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :label="$t('plugin.cfgCallsign')" min-width="100">
            <template #default="{ row }">
              <el-input v-model="row.bridge_callsign" size="small" maxlength="6" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('plugin.cfgSsid')" min-width="90">
            <template #default="{ row }">
              <el-input-number v-model="row.bridge_ssid" size="small" :min="1" :max="255" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('plugin.cfgTx')" min-width="70">
            <template #default="{ row }">
              <el-switch v-model="row.tx_enabled" size="small" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('plugin.cfgRx')" min-width="70">
            <template #default="{ row }">
              <el-switch v-model="row.rx_enabled" size="small" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('plugin.cfgMaxDuration')" min-width="110">
            <template #default="{ row }">
              <el-input-number v-model="row.max_duration_sec" size="small" :min="0" :step="30" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('plugin.cfgPriority')" min-width="90">
            <template #default="{ row }">
              <el-input-number v-model="row.hook_priority" size="small" :min="0" :max="100" controls-position="right" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('plugin.actions')" width="70" fixed="right">
            <template #default="{ $index }">
              <el-button size="small" type="danger" link @click="removeBridgeRow($index)">
                {{ $t('plugin.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button size="small" class="add-bridge-btn" @click="addBridgeRow">
          {{ $t('plugin.addBridge') }}
        </el-button>
      </template>

      <template v-else>
        <el-input
          v-model="configText"
          type="textarea"
          :rows="14"
          :placeholder="$t('plugin.jsonPlaceholder')"
          class="config-textarea"
        />
        <div v-if="configParseError" class="config-error">{{ configParseError }}</div>
      </template>

      <template #footer>
        <el-button @click="configDialogVisible = false">{{ $t('plugin.cancel') }}</el-button>
        <el-button type="primary" :loading="savingConfig" @click="handleSaveConfig">
          {{ $t('plugin.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchPluginList,
  enablePlugin,
  disablePlugin,
  fetchPluginConfig,
  updatePluginConfig,
  fetchBridgeStatus
} from '@/api/plugins'
import { fetchGroupListMini } from '@/api/groups'
import { ElMessage } from 'element-plus'

// bridge 插件单条桥的默认值（结构化表单新增行用）
function defaultBridgeRow() {
  return {
    name: '',
    type: 'nrl',
    remote_host: '',
    remote_port: 60050,
    local_group_id: undefined,
    bridge_callsign: '',
    bridge_ssid: 88,
    codec: 1,
    tx_enabled: true,
    rx_enabled: true,
    max_duration_sec: 120,
    hook_priority: 50
  }
}

export default {
  name: 'PluginManagementPage',
  data() {
    return {
      pluginList: [],
      listLoading: false,
      togglingPlugins: new Set(),
      refreshTimer: null,
      pollFailCount: 0,
      // 桥接状态
      bridgeRunning: false,
      bridgeStatusList: [],
      bridgeStatusTimer: null,
      // 配置对话框
      configDialogVisible: false,
      editingPluginName: '',
      configText: '',
      configParseError: '',
      savingConfig: false,
      bridgeForm: { bridges: [] },
      groupOptions: []
    }
  },
  computed: {
    bridgePanelVisible() {
      const bridge = this.pluginList.find(plugin => plugin.name === 'bridge')
      return !!bridge && (bridge.enabled || bridge.running)
    },
    bridgeStatusInterval() {
      // bridge 插件运行中每 5s 刷新状态，停止后降为 30s
      return this.bridgeRunning ? 5000 : 30000
    }
  },
  watch: {
    bridgeStatusInterval() {
      this.restartBridgeStatusPolling()
    }
  },
  created() {
    this.loadPlugins()
    this.refreshTimer = window.setInterval(() => {
      // 插件列表低频刷新即可（文档建议 10s）
      this.loadPlugins(true)
    }, 10000)
    this.loadGroupOptions()
  },
  beforeUnmount() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
    this.stopBridgeStatusPolling()
  },
  methods: {
    pluginDisplayName(name) {
      const key = `plugin.names.${name}`
      return this.$te(key) ? this.$t(key) : name
    },
    loadPlugins(silent = false) {
      if (!silent) this.listLoading = true
      fetchPluginList().then(response => {
        this.pluginList = response?.data?.items || []
        this.pollFailCount = 0
      }).catch(() => {
        // 静默轮询失败不弹错；连续失败也不终止（可能是暂时性网络问题）
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleToggle(plugin) {
      if (this.togglingPlugins.has(plugin.name)) return
      this.togglingPlugins.add(plugin.name)
      const request = plugin.enabled ? disablePlugin : enablePlugin
      request(plugin.name).then(response => {
        if (response.code !== 20000) {
          ElMessage.error(response?.data?.message || this.$t('plugin.opFailed'))
          return
        }
        ElMessage.success(response?.data?.message || this.$t('plugin.opSuccess'))
        this.loadPlugins(true)
      }).catch(() => {}).finally(() => {
        this.togglingPlugins.delete(plugin.name)
      })
    },
    // ---- 配置 ----
    openConfigDialog(plugin) {
      this.editingPluginName = plugin.name
      this.configParseError = ''
      fetchPluginConfig(plugin.name).then(response => {
        const config = response?.data?.config || {}
        if (plugin.name === 'bridge') {
          this.bridgeForm = {
            bridges: (Array.isArray(config.bridges) ? config.bridges : []).map(row => ({ ...defaultBridgeRow(), ...row }))
          }
        } else {
          this.configText = JSON.stringify(config, null, 2)
        }
        this.configDialogVisible = true
      }).catch(() => {})
    },
    addBridgeRow() {
      this.bridgeForm.bridges.push(defaultBridgeRow())
    },
    removeBridgeRow(index) {
      this.bridgeForm.bridges.splice(index, 1)
    },
    validateBridgeForm() {
      for (const row of this.bridgeForm.bridges) {
        if (!row.name || !row.remote_host) {
          return 'bridgeRowIncomplete'
        }
        if (row.local_group_id === undefined || row.local_group_id === null) {
          return 'bridgeGroupRequired'
        }
        if (!/^[A-Za-z0-9]{3,6}$/.test(row.bridge_callsign || '')) {
          return 'bridgeCallsignInvalid'
        }
      }
      return ''
    },
    handleSaveConfig() {
      let config
      if (this.editingPluginName === 'bridge') {
        // 校验错误返回 i18n key，由 $t 统一翻译展示
        const errorKey = this.validateBridgeForm()
        if (errorKey) {
          ElMessage.warning(this.$t(`plugin.${errorKey}`))
          return
        }
        config = { bridges: this.bridgeForm.bridges }
      } else {
        try {
          config = JSON.parse(this.configText)
        } catch (error) {
          this.configParseError = `${this.$t('plugin.jsonInvalid')}: ${error.message}`
          return
        }
        if (config === null || typeof config !== 'object' || Array.isArray(config)) {
          this.configParseError = this.$t('plugin.jsonMustBeObject')
          return
        }
        this.configParseError = ''
      }

      this.savingConfig = true
      updatePluginConfig(this.editingPluginName, config).then(response => {
        if (response.code !== 20000) {
          ElMessage.error(response?.data?.message || this.$t('plugin.opFailed'))
          return
        }
        // 运行中的插件保存后自动热重启，新配置即刻生效
        ElMessage.success(this.$t('plugin.configSaved'))
        this.configDialogVisible = false
        this.loadPlugins(true)
      }).catch(() => {}).finally(() => {
        this.savingConfig = false
      })
    },
    // ---- 桥接状态轮询 ----
    loadGroupOptions() {
      fetchGroupListMini({}).then(groups => {
        this.groupOptions = groups
      }).catch(() => {})
    },
    restartBridgeStatusPolling() {
      this.stopBridgeStatusPolling()
      this.bridgeStatusTimer = window.setInterval(() => {
        this.checkBridgeStatus()
      }, this.bridgeStatusInterval)
    },
    stopBridgeStatusPolling() {
      if (this.bridgeStatusTimer) {
        clearInterval(this.bridgeStatusTimer)
        this.bridgeStatusTimer = null
      }
    },
    checkBridgeStatus() {
      if (document.hidden) return // 页面不可见时暂停，恢复可见后由下一轮询接续
      fetchBridgeStatus().then(response => {
        if (response.code !== 20000) return
        this.pollFailCount = 0
        this.bridgeRunning = !!response.data?.running
        this.bridgeStatusList = response.data?.items || []
        if (!this.bridgeStatusTimer) {
          this.restartBridgeStatusPolling()
        }
      }).catch(() => {
        // 接口连续失败（后端未部署插件状态接口）时暂停轮询，避免无休止报错
        this.pollFailCount += 1
        if (this.pollFailCount >= 2 && this.bridgeStatusTimer) {
          this.stopBridgeStatusPolling()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.plugin-card {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 16px;
  }
}

.plugin-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.plugin-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.plugin-name {
  font-weight: 600;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tag {
  flex-shrink: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &.running {
    background: var(--el-color-success);
    box-shadow: 0 0 6px var(--el-color-success);
  }

  &.stopped {
    background: var(--el-text-color-disabled);
  }
}

.plugin-desc {
  margin: 10px 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.5;
  min-height: 20px;
}

.plugin-actions {
  display: flex;
  justify-content: flex-end;
}

.bridge-panel {
  margin-top: 8px;
}

.bridge-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bridge-error {
  color: var(--el-color-danger);
}

.config-hint {
  margin-bottom: 12px;
}

.config-textarea {
  font-family: Consolas, Monaco, monospace;

  :deep(textarea) {
    font-family: inherit;
  }
}

.config-error {
  margin-top: 8px;
  color: var(--el-color-danger);
  font-size: 12px;
}

.add-bridge-btn {
  margin-top: 10px;
  width: 100%;
}
</style>
