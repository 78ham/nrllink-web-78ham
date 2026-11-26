<template>
  <div class="app-container platform-theme-page bm-network-page">
    <!-- Header Section -->
    <div class="bm-header-card">
      <div class="bm-header-title">
        <h2>{{ $t('bm.title') }}</h2>
        <p class="bm-header-subtitle">{{ $t('bm.subtitle') }}</p>
      </div>
    </div>

    <!-- Demo-mode banner: shown whenever real API failed and demo data is displayed -->
    <el-alert
      v-if="isDemoMode"
      :title="$t('bm.demoBanner')"
      type="warning"
      show-icon
      :closable="false"
      class="bm-demo-banner"
    >
      <el-button size="small" :loading="loading" @click="loadNetworks">{{ $t('tagsView.refresh') }}</el-button>
    </el-alert>

    <!-- Active Bridge Control Panel -->
    <div class="bm-bridge-panel">
      <div class="panel-header">
        <h3>{{ $t('bm.bridgeStatus') }}</h3>
        <el-tag :type="bridgeStatusTagType" class="bridge-status-badge">
          {{ bridgeStatusText }}
        </el-tag>
      </div>

      <div class="bridge-selectors">
        <div class="selector-item">
          <label for="bm-device">{{ $t('bm.selectDevice') }}</label>
          <el-select
            id="bm-device"
            v-model="selectedDeviceId"
            :placeholder="$t('bm.selectDevicePlaceholder')"
            class="bm-select"
            @change="onDeviceChange"
          >
            <el-option
              v-for="item in bmDeviceList"
              :key="item.id"
              :label="`${item.callsign || 'NOCALL'}-${item.ssid ?? 0} (#${item.id} - ${item.name || 'BM节点'})`"
              :value="item.id"
            />
          </el-select>
        </div>

        <div class="selector-item">
          <label for="bm-network">{{ $t('bm.selectNetwork') }}</label>
          <el-select
            id="bm-network"
            v-model="selectedNetworkId"
            :placeholder="$t('bm.selectNetworkPlaceholder')"
            class="bm-select"
          >
            <el-option
              v-for="item in networkList"
              :key="item.id"
              :label="`${item.name} (${item.server_address}:${item.server_port})`"
              :value="item.id"
            />
          </el-select>
        </div>

        <div class="bridge-action-btns">
          <el-button
            v-if="bridgeStatus.status !== 1"
            type="success"
            :loading="bridgeLoading"
            :disabled="loading || isDemoMode || !selectedDeviceId || !selectedNetworkId"
            class="action-btn"
            @click="handleStartBridge"
          >
            {{ $t('bm.startBridge') }}
          </el-button>
          <el-button
            v-else
            type="danger"
            :loading="bridgeLoading"
            :disabled="loading || isDemoMode || !selectedDeviceId"
            class="action-btn"
            @click="handleStopBridge"
          >
            {{ $t('bm.stopBridge') }}
          </el-button>
        </div>
      </div>

      <!-- Live Bridge Metrics Grid -->
      <div class="bridge-metrics-grid">
        <div class="metric-card">
          <span class="metric-label">{{ $t('bm.rxPackets') }}</span>
          <span class="metric-val">{{ bridgeStatus.rx_packets || 0 }}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">{{ $t('bm.txPackets') }}</span>
          <span class="metric-val">{{ bridgeStatus.tx_packets || 0 }}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">{{ $t('bm.lossRate') }}</span>
          <span class="metric-val">{{ (bridgeStatus.loss_rate * 100).toFixed(1) }}%</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">{{ $t('bm.lastHeartbeat') }}</span>
          <span class="metric-val text-sm">{{ bridgeStatus.last_heartbeat || '--' }}</span>
        </div>
      </div>
    </div>

    <!-- BM Network Configuration List -->
    <div class="bm-network-list-section">
      <div class="section-toolbar">
        <h3>{{ $t('bm.configListTitle') }}</h3>
        <el-button v-if="canManageNetworks" :disabled="loading || isDemoMode" type="primary" class="add-network-btn" @click="handleCreateNetwork">
          {{ $t('bm.addConfig') }}
        </el-button>
      </div>

      <responsive-table
        :data="networkList"
        :columns="networkColumns"
        :loading="loading"
        title-key="name"
        row-key="id"
        @refresh="loadNetworks"
      >
        <template #table>
          <el-table
            v-loading="loading"
            :data="networkList"
            border
            fit
            highlight-current-row
            style="width: 100%"
          >
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="name" :label="$t('bm.configName')" min-width="140" align="center" />
            <el-table-column :label="$t('bm.serverAddr')" min-width="180" align="center">
              <template #default="{ row }">
                <span>{{ row.server_address }}:{{ row.server_port }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="callsign" :label="$t('bm.callsign')" width="120" align="center" />
            <el-table-column prop="dmrid" :label="$t('bm.dmrid')" width="120" align="center" />
            <el-table-column :label="$t('bm.defaultTG')" width="130" align="center">
              <template #default="{ row }">
                <span>TG {{ row.default_tg }} (TS{{ row.timeslot }})</span>
              </template>
            </el-table-column>
            <el-table-column prop="heartbeat_interval" :label="$t('bm.heartbeat')" width="120" align="center">
              <template #default="{ row }">
                <span>{{ row.heartbeat_interval }}s</span>
              </template>
            </el-table-column>
            <el-table-column v-if="canManageNetworks && !isDemoMode" :label="$t('bm.actions')" width="160" align="center">
              <template #default="{ row }">
                <el-button type="primary" plain size="small" @click="handleEditNetwork(row)">
                  {{ $t('bm.edit') }}
                </el-button>
                <el-button type="danger" plain size="small" @click="handleDeleteNetwork(row)">
                  {{ $t('bm.delete') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <template #badge="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? $t('bm.enabled') : $t('bm.disabled') }}
          </el-tag>
        </template>

        <template v-if="canManageNetworks && !isDemoMode" #actions="{ row }">
          <el-button type="primary" plain size="small" @click="handleEditNetwork(row)">
            {{ $t('bm.edit') }}
          </el-button>
          <el-button type="danger" plain size="small" @click="handleDeleteNetwork(row)">
            {{ $t('bm.delete') }}
          </el-button>
        </template>
      </responsive-table>
    </div>

    <!-- Network Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('bm.editConfig') : $t('bm.addConfig')"
      width="min(36rem, calc(100% - 2rem))"
      class="platform-theme-dialog"
    >
      <el-form ref="networkForm" :model="form" :label-position="device === 'mobile' ? 'top' : 'right'" label-width="140px">
        <el-form-item :label="$t('bm.configName')" prop="name" required>
          <el-input v-model="form.name" placeholder="例如：BrandMeister 4601" />
        </el-form-item>
        <el-form-item :label="$t('bm.serverAddr')" prop="server_address" required>
          <el-input v-model="form.server_address" placeholder="例如：bm.master.com" />
        </el-form-item>
        <el-form-item :label="$t('bm.serverPort')" prop="server_port" required>
          <el-input-number v-model="form.server_port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item :label="$t('bm.password')" prop="password">
          <el-input v-model="form.password" type="password" show-password :placeholder="isEdit ? $t('bm.keepPassword') : $t('bm.password')" />
        </el-form-item>
        <el-form-item :label="$t('bm.callsign')" prop="callsign">
          <el-input v-model="form.callsign" placeholder="连接呼号" />
        </el-form-item>
        <el-form-item :label="$t('bm.dmrid')" prop="dmrid">
          <el-input-number v-model="form.dmrid" :min="0" />
        </el-form-item>
        <el-form-item :label="$t('bm.defaultTG')" prop="default_tg">
          <el-input-number v-model="form.default_tg" :min="1" />
        </el-form-item>
        <el-form-item :label="$t('bm.timeslot')" prop="timeslot">
          <el-radio-group v-model="form.timeslot">
            <el-radio :value="1">TS 1</el-radio>
            <el-radio :value="2">TS 2</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('bm.heartbeat')" prop="heartbeat_interval">
          <el-input-number v-model="form.heartbeat_interval" :min="5" :max="300" />
        </el-form-item>
        <el-form-item :label="$t('bm.note')" prop="note">
          <el-input v-model="form.note" type="textarea" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('bm.cancel') }}</el-button>
        <el-button type="primary" @click="saveNetwork">{{ $t('bm.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchBMNetworks,
  createBMNetwork,
  updateBMNetwork,
  deleteBMNetwork,
  startBMBridge,
  stopBMBridge,
  fetchBMBridgeStatus
} from '@/api/bm'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import checkPermission from '@/utils/permission'
import { fetchDeviceList } from '@/api/device'
import ResponsiveTable from '@/components/ResponsiveTable/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const DEFAULT_NETWORKS = [
  {
    id: 1,
    name: 'BrandMeister 4601 (Master)',
    server_address: 'bm.4601.master',
    server_port: 62031,
    callsign: 'NOCALL',
    dmrid: 4600000,
    default_tg: 46001,
    timeslot: 2,
    heartbeat_interval: 10,
    status: 1,
    note: '预设默认 BrandMeister 4601 节点'
  },
  {
    id: 2,
    name: 'BrandMeister 4602 (Backup)',
    server_address: 'bm.4602.backup',
    server_port: 62031,
    callsign: 'NOCALL',
    dmrid: 4600000,
    default_tg: 46001,
    timeslot: 2,
    heartbeat_interval: 10,
    status: 1,
    note: '预装备用 BrandMeister 4602 节点'
  }
]

export default {
  name: 'BMNetworkPage',
  components: { ResponsiveTable },
  data() {
    return {
      loading: false,
      bridgeLoading: false,
      pollFailCount: 0,
      isDemoMode: false,
      networkList: [],
      bmDeviceList: [],
      selectedDeviceId: undefined,
      selectedNetworkId: undefined,
      bridgeStatus: {
        status: 0,
        rx_packets: 0,
        tx_packets: 0,
        loss_rate: 0,
        last_heartbeat: ''
      },
      statusPollTimer: null,
      dialogVisible: false,
      isEdit: false,
      form: {
        id: undefined,
        name: '',
        server_address: '',
        server_port: 62031,
        password: '',
        callsign: '',
        dmrid: 4600000,
        default_tg: 46001,
        timeslot: 2,
        heartbeat_interval: 10,
        status: 1,
        note: ''
      },
      networkColumns: [
        { prop: 'name', label: '配置名称' },
        { prop: 'server_address', label: '服务器', formatter: (row) => `${row.server_address}:${row.server_port}` },
        { prop: 'callsign', label: '呼号/DMRID', formatter: (row) => `${row.callsign || '--'} / ${row.dmrid || '--'}` },
        { prop: 'default_tg', label: 'TG/TS', formatter: (row) => `TG ${row.default_tg} (TS${row.timeslot})` }
      ]
    }
  },
  computed: {
    ...mapState(useAppStore, ['device']),
    canManageNetworks() {
      return checkPermission(['admin'])
    },
    bridgeStatusText() {
      if (this.bridgeStatus.status === 1) return this.$t('bm.running')
      if (this.bridgeStatus.status === 2) return this.$t('bm.error')
      return this.$t('bm.stopped')
    },
    bridgeStatusTagType() {
      if (this.bridgeStatus.status === 1) return 'success'
      if (this.bridgeStatus.status === 2) return 'danger'
      return 'info'
    }
  },
  mounted() {
    this.loadNetworks()
    this.loadBMDevices()
    this.startStatusPolling()
  },
  beforeUnmount() {
    if (this.statusPollTimer) {
      clearInterval(this.statusPollTimer)
      this.statusPollTimer = null
    }
  },
  methods: {
    loadNetworks() {
      this.loading = true
      fetchBMNetworks().then(res => {
        this.isDemoMode = false
        this.networkList = res.data.items || []
        if (!this.networkList.some(network => network.id === this.selectedNetworkId)) {
          this.selectedNetworkId = this.networkList[0]?.id
        }
      }).catch(() => {
        this.isDemoMode = true
        this.networkList = [...DEFAULT_NETWORKS]
        this.selectedNetworkId = undefined
      }).finally(() => {
        this.loading = false
      })
    },
    loadBMDevices() {
      fetchDeviceList({}).then(res => {
        this.bmDeviceList = (res.data.items || []).filter(item => item.dev_model === 202)
        if (!this.bmDeviceList.some(device => device.id === this.selectedDeviceId)) {
          this.selectedDeviceId = this.bmDeviceList[0]?.id
          this.onDeviceChange()
        }
      }).catch(() => {})
    },
    onDeviceChange() {
      this.pollFailCount = 0
      this.bridgeStatus = { status: 0, rx_packets: 0, tx_packets: 0, loss_rate: 0, last_heartbeat: '' }
      this.checkBridgeStatus()
      this.startStatusPolling()
    },
    checkBridgeStatus() {
      if (!this.selectedDeviceId) return
      if (document.hidden) return // 页面不可见时暂停，恢复可见后由下一个轮询周期接续
      const deviceId = this.selectedDeviceId
      fetchBMBridgeStatus({ device_id: deviceId }).then(res => {
        if (deviceId !== this.selectedDeviceId) return
        this.pollFailCount = 0
        if (res?.data) {
          this.bridgeStatus = res.data
        }
      }).catch(() => {
        if (deviceId !== this.selectedDeviceId) return
        this.pollFailCount = (this.pollFailCount || 0) + 1
        // 如果连续失败2次以上（说明后端接口未部署），自动暂停轮询，防止无休止报错
        if (this.pollFailCount >= 2 && this.statusPollTimer) {
          clearInterval(this.statusPollTimer)
          this.statusPollTimer = null
          ElMessage.warning(this.$t('bm.statusPollStopped'))
        }
      })
    },
    startStatusPolling() {
      if (!this.selectedDeviceId || this.statusPollTimer) return
      this.statusPollTimer = setInterval(() => {
        this.checkBridgeStatus()
      }, 5000)
    },
    handleStartBridge() {
      if (!this.selectedDeviceId) {
        ElMessage.warning(this.$t('bm.selectDevicePlaceholder'))
        return
      }
      if (!this.selectedNetworkId) {
        ElMessage.warning(this.$t('bm.selectNetworkPlaceholder'))
        return
      }
      this.bridgeLoading = true
      startBMBridge({
        device_id: this.selectedDeviceId,
        network_id: this.selectedNetworkId
      }).then(() => {
        ElMessage.success(this.$t('bm.startSuccess'))
        this.checkBridgeStatus()
      }).catch(error => {
        ElMessage.error(error.message)
      }).finally(() => {
        this.bridgeLoading = false
      })
    },
    handleStopBridge() {
      if (!this.selectedDeviceId) return
      this.bridgeLoading = true
      stopBMBridge({
        device_id: this.selectedDeviceId
      }).then(() => {
        ElMessage.success(this.$t('bm.stopSuccess'))
        this.checkBridgeStatus()
      }).catch(error => {
        ElMessage.error(error.message)
      }).finally(() => {
        this.bridgeLoading = false
      })
    },
    handleCreateNetwork() {
      this.isEdit = false
      this.form = {
        id: undefined,
        name: '',
        server_address: '',
        server_port: 62031,
        password: '',
        callsign: '',
        dmrid: 4600000,
        default_tg: 46001,
        timeslot: 2,
        heartbeat_interval: 10,
        status: 1,
        note: ''
      }
      this.dialogVisible = true
    },
    handleEditNetwork(row) {
      this.isEdit = true
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDeleteNetwork(row) {
      ElMessageBox.confirm(this.$t('bm.deleteConfirm', { name: row.name }), this.$t('bm.delete'), {
        type: 'warning'
      }).then(() => {
        deleteBMNetwork({ id: row.id }).then(() => {
          ElMessage.success(this.$t('bm.deleteSuccess'))
          this.loadNetworks()
        }).catch(error => {
          ElMessage.error(error.message)
        })
      }).catch(() => {})
    },
    saveNetwork() {
      if (!this.form.name || !this.form.server_address) {
        ElMessage.warning(this.$t('bm.nameServerRequired'))
        return
      }
      const api = this.isEdit ? updateBMNetwork : createBMNetwork
      const data = { ...this.form }
      if (this.isEdit && !data.password) delete data.password
      api(data).then(() => {
        ElMessage.success(this.isEdit ? this.$t('bm.updateSuccess') : this.$t('bm.createSuccess'))
        this.dialogVisible = false
        this.loadNetworks()
      }).catch(error => {
        ElMessage.error(error.message)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.bm-demo-banner {
  margin-bottom: 20px;
}

.bm-network-page {
  padding: 20px;

  .bm-header-card {
    background: var(--platform-surface-card, rgba(16, 28, 48, 0.8));
    border: 1px solid var(--platform-border, rgba(79, 140, 255, 0.15));
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 20px;

    h2 {
      margin: 0 0 6px 0;
      font-size: 20px;
      color: var(--platform-ink, #ffffff);
    }

    .bm-header-subtitle {
      margin: 0;
      font-size: 13px;
      color: var(--platform-ink-dim, #94a3b8);
    }
  }

  .bm-bridge-panel {
    background: var(--platform-surface-card, rgba(16, 28, 48, 0.8));
    border: 1px solid var(--platform-border, rgba(79, 140, 255, 0.15));
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 20px;

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 16px;
        color: var(--platform-ink, #ffffff);
      }
    }

    .bridge-selectors {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 20px;

      .selector-item {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1 1 240px;

        label {
          font-size: 13px;
          color: var(--platform-ink-dim, #94a3b8);
        }

        .bm-select {
          width: 100%;
        }
      }

      .bridge-action-btns {
        .action-btn {
          min-height: 38px;
          padding: 0 20px;
        }
      }
    }

    .bridge-metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;

      .metric-card {
        background: var(--platform-surface-soft, rgba(255, 255, 255, 0.04));
        border: 1px solid var(--platform-border, rgba(255, 255, 255, 0.08));
        border-radius: 12px;
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .metric-label {
          font-size: 12px;
          color: var(--platform-ink-dim, #94a3b8);
        }

        .metric-val {
          overflow-wrap: anywhere;
          font-size: 18px;
          font-weight: 600;
          color: var(--platform-ink, #ffffff);

          &.text-sm {
            font-size: 13px;
            font-weight: normal;
          }
        }
      }
    }
  }

  .bm-network-list-section {
    background: var(--platform-surface-card, rgba(16, 28, 48, 0.8));
    border: 1px solid var(--platform-border, rgba(79, 140, 255, 0.15));
    border-radius: 16px;
    padding: 20px 24px;

    .section-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 16px;
        color: var(--platform-ink, #ffffff);
      }
    }
  }
}

@media (max-width: 767px) {
  .bm-network-page {
    .bm-header-card,
    .bm-bridge-panel,
    .bm-network-list-section {
      padding: 14px;
      margin-bottom: 12px;
    }

    .bm-bridge-panel {
      .bridge-selectors {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 10px;

        .action-btn {
          width: 100%;
        }
      }

      .bridge-metrics-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;

        .metric-card {
          padding: 10px;
        }
      }
    }
  }
}
</style>
