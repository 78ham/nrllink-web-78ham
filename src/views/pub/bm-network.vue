<template>
  <div class="app-container platform-theme-page bm-network-page">
    <!-- Header Section -->
    <div class="bm-header-card">
      <div class="bm-header-title">
        <h2>{{ $t('bm.title') }}</h2>
        <p class="bm-header-subtitle">{{ $t('bm.subtitle') }}</p>
      </div>
    </div>

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
          <label>{{ $t('bm.selectDevice') }}</label>
          <el-select
            v-model="selectedDeviceId"
            placeholder="请选择 NRL-BM 设备"
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
          <label>{{ $t('bm.selectNetwork') }}</label>
          <el-select
            v-model="selectedNetworkId"
            placeholder="请选择目标 BM 网络"
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
            class="action-btn"
            @click="handleStartBridge"
          >
            {{ $t('bm.startBridge') }}
          </el-button>
          <el-button
            v-else
            type="danger"
            :loading="bridgeLoading"
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
        <h3>BM 网络连接配置</h3>
        <el-button type="primary" class="add-network-btn" @click="handleCreateNetwork">
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
            <el-table-column label="操作" width="160" align="center">
              <template #default="{ row }">
                <el-button type="primary" plain size="small" @click="handleEditNetwork(row)">
                  编辑
                </el-button>
                <el-button type="danger" plain size="small" @click="handleDeleteNetwork(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <template #badge="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '已启用' : '已禁用' }}
          </el-tag>
        </template>

        <template #actions="{ row }">
          <el-button type="primary" plain size="small" @click="handleEditNetwork(row)">
            编辑
          </el-button>
          <el-button type="danger" plain size="small" @click="handleDeleteNetwork(row)">
            删除
          </el-button>
        </template>
      </responsive-table>
    </div>

    <!-- Network Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? $t('bm.editConfig') : $t('bm.addConfig')"
      width="540px"
      class="platform-theme-dialog"
    >
      <el-form ref="networkForm" :model="form" label-width="140px">
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
          <el-input v-model="form.password" type="password" show-password placeholder="BM 连接密码" />
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
        <el-form-item label="备注" prop="note">
          <el-input v-model="form.note" type="textarea" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveNetwork">保存</el-button>
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
import { fetchDeviceList } from '@/api/device'
import ResponsiveTable from '@/components/ResponsiveTable/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'BMNetworkPage',
  components: { ResponsiveTable },
  data() {
    return {
      loading: false,
      bridgeLoading: false,
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
        this.networkList = res?.data?.items || []
        if (this.networkList.length && !this.selectedNetworkId) {
          this.selectedNetworkId = this.networkList[0].id
        }
      }).finally(() => {
        this.loading = false
      })
    },
    loadBMDevices() {
      fetchDeviceList({ page: 1, limit: 100 }).then(res => {
        const allItems = res?.data?.items || []
        // Filter NRL-BM devices (model 202)
        const bmDevices = allItems.filter(item => item.dev_model === 202)
        this.bmDeviceList = bmDevices.length ? bmDevices : allItems
        if (this.bmDeviceList.length && !this.selectedDeviceId) {
          this.selectedDeviceId = this.bmDeviceList[0].id
          this.checkBridgeStatus()
        }
      })
    },
    onDeviceChange() {
      this.checkBridgeStatus()
    },
    checkBridgeStatus() {
      if (!this.selectedDeviceId) return
      fetchBMBridgeStatus({ device_id: this.selectedDeviceId }).then(res => {
        if (res?.data) {
          this.bridgeStatus = res.data
        }
      })
    },
    startStatusPolling() {
      this.statusPollTimer = setInterval(() => {
        this.checkBridgeStatus()
      }, 5000)
    },
    handleStartBridge() {
      if (!this.selectedDeviceId) {
        ElMessage.warning('请选择 NRL-BM 设备')
        return
      }
      if (!this.selectedNetworkId) {
        ElMessage.warning('请选择目标 BM 网络')
        return
      }
      this.bridgeLoading = true
      startBMBridge({
        device_id: this.selectedDeviceId,
        network_id: this.selectedNetworkId
      }).then(() => {
        ElMessage.success(this.$t('bm.startBridge') + ' 成功')
        this.checkBridgeStatus()
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
        ElMessage.success(this.$t('bm.stopBridge') + ' 成功')
        this.checkBridgeStatus()
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
      ElMessageBox.confirm(`确认删除配置 "${row.name}" 吗？`, '删除确认', {
        type: 'warning'
      }).then(() => {
        deleteBMNetwork({ id: row.id }).then(() => {
          ElMessage.success('删除成功')
          this.loadNetworks()
        })
      })
    },
    saveNetwork() {
      if (!this.form.name || !this.form.server_address) {
        ElMessage.warning('名称和服务器地址不能为空')
        return
      }
      const api = this.isEdit ? updateBMNetwork : createBMNetwork
      api(this.form).then(() => {
        ElMessage.success(this.isEdit ? '更新成功' : '创建成功')
        this.dialogVisible = false
        this.loadNetworks()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
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

@media screen and (max-width: 768px) {
  .bm-network-page {
    padding: 12px;

    .bridge-selectors {
      flex-direction: column;
      align-items: stretch;

      .bridge-action-btns {
        width: 100%;

        .action-btn {
          width: 100%;
          min-height: 44px;
        }
      }
    }
  }
}
</style>
