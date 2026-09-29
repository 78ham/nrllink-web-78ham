<template>
  <div class="app-container platform-theme-page device-page">
    <div class="filter-container platform-theme-toolbar">
      <el-input
        v-model="listQuery.callsign"
        :placeholder="$t('device.callsign')"
        class="filter-item search-input"
        clearable
        @keyup.enter="handleFilter"
      />

      <el-select
        v-model="listQuery.group_id"
        filterable
        clearable
        :placeholder="$t('device.selectGroup')"
        class="filter-item group-select"
        popper-class="platform-theme-select-dropdown"
        @change="handleFilter"
      >
        <el-option v-for="item in groupsOptions" :key="item.id" :label="item.id + '-' + item.name" :value="item.id" />
      </el-select>

      <div class="filter-item action-row">
        <el-button v-waves class="action-btn" type="primary" @click="getList">
          <el-icon>
            <Search />
          </el-icon>
          {{ $t('employee.search') }}
        </el-button>
      </div>

      <div class="filter-item switch-row">
        <button
          type="button"
          class="toolbar-capsule"
          :class="{ 'is-active': listQuery.isonline }"
          @click="toggleOnline"
        >
          <span class="capsule-indicator" />
          <span>{{ $t('device.showOnline') }}</span>
        </button>

        <button
          type="button"
          class="toolbar-capsule"
          :class="{ 'is-active': showtable }"
          @click="showtable = !showtable"
        >
          <span class="capsule-indicator" />
          <span>{{ $t('device.showtable') }}</span>
        </button>
      </div>

    </div>

    <responsive-table
      :data="list"
      :columns="deviceColumns"
      :loading="listLoading"
      title-key="callsign"
      row-key="id"
      :has-more="list.length < total"
      @load-more="handleLoadMore"
      @refresh="getList"
    >
      <template #table>
        <div v-if="showtable" class="table-shell table-responsive">
          <el-table
            :key="tableKey"
            v-loading="listLoading"
            :data="list"
            border
            fit
            highlight-current-row
            style="width: 100%"
            @sort-change="sortChange"
          >
            <el-table-column fixed :label="$t('Account.id')" prop="id" sortable="custom" align="center" min-width="110">
              <template #default="scope">
                <span>{{ scope.row.id }}</span>
              </template>
            </el-table-column>

            <el-table-column
              fixed
              prop="callsign"
              :label="$t('device.callsign')"
              min-width="150"
              align="center"
              :sortable="true"
            >
              <template #default="scope">
                <div class="tag-wrap">
                  <el-tag :type="scope.row.is_online ? 'success' : 'info'" :class="scope.row.is_online ? 'callsign-online-tag' : 'callsign-offline-tag'">{{ scope.row.callsign + "-" +
                    scope.row.ssid
                  }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="dmrid" :label="$t('device.dmrid')" min-width="100" align="center" :sortable="true">
              <template #default="scope">
                <div class="tag-wrap">
                  <el-tag :type="scope.row.is_online ? 'primary' : 'info'">{{ scope.row.dmrid }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column :label="$t('device.status')" prop="status" min-width="170" align="center">
              <template #default="scope">
                <div class="status-actions">
                  <el-button
                    :type="safeButtonType(((scope.row.status ?? 0) & 1) === 1 ? 'danger' : 'info')"
                    size="small"
                    plain
                    class="compact-btn status-receive-btn"
                    @click="updateStatus(scope.row, 1)"
                  >{{ (scope.row.status & 1) === 1 ? $t('device.disableReceive') :
                    $t('device.receive')
                  }}</el-button>

                  <el-button
                    :type="safeButtonType(((scope.row.status ?? 0) & 2) === 2 ? 'danger' : 'info')"
                    size="small"
                    plain
                    class="compact-btn status-transmit-btn"
                    @click="updateStatus(scope.row, 2)"
                  >{{ (scope.row.status & 2) === 2 ? $t('device.disableTransmit') :
                    $t('device.transmit')
                  }}</el-button>
                </div>
              </template>
            </el-table-column>

            <el-table-column :label="$t('device.priority')" prop="priority" min-width="100" align="center" :sortable="true">
              <template #default="scope">
                <span>{{ scope.row.priority }}</span>
              </template>
            </el-table-column>

            <el-table-column :label="$t('device.name')" prop="name" min-width="220" align="center" :sortable="true">
              <template #default="scope">
                <span>{{ scope.row.ssid === 200 && scope.row.name === '' ? $t('device.serverLink') : scope.row.name }}</span>
              </template>
            </el-table-column>

            <el-table-column :label="$t('device.qth')" prop="qth" min-width="220" align="center" :sortable="true">
              <template #default="scope">
                <span>{{ scope.row.qth }}</span>
              </template>
            </el-table-column>

            <el-table-column :label="$t('device.currentGroup')" prop="group_id" min-width="180" align="center" :sortable="true">
              <template #default="scope">
                <span v-if="scope.row.group_id > 0 && scope.row.group_id < 999">
                  {{ $t('device.personalRoom') }}{{ scope.row.group_id }}</span>
                <span v-else>{{
                  ValueFilter(scope.row.group_id, groupsOptions)
                }}</span>
              </template>
            </el-table-column>

            <el-table-column
              :label="$t('Account.actions')"
              align="center"
              min-width="320"
              class-name="small-padding fixed-width"
            >
              <template #default="{ row }">
                <div class="operation-actions">
                  <el-button
                    v-if="checkPermission(['admin']) || row.callsign === callsign"
                    size="small"
                    type="primary"
                    plain
                    class="compact-btn action-edit-btn"
                    @click="handleUpdate(row)"
                  >{{ $t("device.edit") }}</el-button>

                  <el-button
                    v-if="checkPermission(['admin']) || row.callsign === callsign"
                    :disabled="row.is_online === false"
                    size="small"
                    type="warning"
                    plain
                    class="compact-btn action-change-btn"
                    @click="handleChange(row)"
                  >{{ $t("device.change") }}</el-button>

                  <el-button
                    v-if="checkPermission(['admin']) || row.callsign === callsign"
                    :disabled="row.is_online === false"
                    size="small"
                    type="success"
                    plain
                    class="compact-btn action-at-btn"
                    @click="handleOpenAT(row)"
                  >{{ $t("device.at") }}</el-button>

                  <el-button
                    v-if="row.dev_model === 202"
                    size="small"
                    type="info"
                    plain
                    class="compact-btn action-bm-btn"
                    @click="$router.push('/public/bm-network')"
                  >BM网络</el-button>
                  <el-button
                    v-if="checkPermission(['admin']) || row.callsign === callsign"
                    size="small"
                    type="danger"
                    plain
                    class="compact-btn action-delete-btn"
                    @click="handleDelete(row)"
                  >{{ $t('employee.delete') }}</el-button>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="dev_rf_type" :label="$t('device.rfTypeLabel')" min-width="140" align="center" :sortable="true">
              <template #default="scope">
                <span>{{ ValueFilter(scope.row.rf_type, DevRFtypeOptions) }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="tunner" :label="$t('device.channelFrequency')" min-width="190" align="center">
              <template #default="scope">
                <div v-if="scope.row.device_parm" class="tag-wrap">
                  <el-tag v-if="scope.row.rf_type == 1">
                    R{{ scope.row.device_parm.one_recive_freq }}/T{{
                      scope.row.device_parm.one_transmit_freq
                    }}
                  </el-tag>
                  <el-tag v-if="scope.row.rf_type == 2">
                    R{{ scope.row.device_parm.two_recive_freq }}/T{{
                      scope.row.device_parm.two_transmit_freq
                    }}
                  </el-tag>
                  <el-tag v-if="scope.row.rf_type == 3">{{ $t('device.channelLabel') }}{{ scope.row.device_parm.moto_channel }}
                    {{ getChannelName(scope.row) }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column :label="$t('device.model')" prop="dev_model" min-width="150" align="center" :sortable="true">
              <template #default="scope">
                <span>{{ ValueFilter(scope.row.dev_model, DevModelOptions) }}</span>
              </template>
            </el-table-column>

            <el-table-column :label="$t('device.totalVoiceTime')" prop="voice_time" min-width="120" align="center" :sortable="true">
              <template #default="scope">
                <span>{{ formatVoiceTime(scope.row.voice_time) }}</span>
              </template>
            </el-table-column>

            <el-table-column :label="$t('device.codecCaps')" prop="supported_codecs" min-width="140" align="center">
              <template #default="scope">
                <div class="codec-tags">
                  <el-tag v-if="scope.row.supported_codecs & 1" size="small" type="info" class="codec-tag">G.711</el-tag>
                  <el-tag v-if="scope.row.supported_codecs & 2" size="small" type="warning" class="codec-tag">Opus</el-tag>
                  <el-tag v-if="scope.row.supported_codecs & 4" size="small" type="success" class="codec-tag">Codec2</el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column :label="$t('device.totalTraffic')" prop="traffic" min-width="120" align="center" :sortable="true">
              <template #default="scope">
                <span>{{ formatFileSize(scope.row.traffic) }}</span>
              </template>
            </el-table-column>

            <el-table-column :label="$t('device.lastVoiceDuration')" prop="last_voice_duration" min-width="150" align="center" :sortable="true">
              <template #default="scope">
                <span>{{ formatVoiceTime(scope.row.last_voice_duration) }}</span>
              </template>
            </el-table-column>

            <el-table-column :label="$t('device.lastVoiceTime')" prop="last_voice_end_time" min-width="160" align="center" :sortable="true">
              <template #default="scope">
                <span>{{ parseTime(scope.row.last_voice_end_time) }}</span>
              </template>
            </el-table-column>

          </el-table>
        </div>

        <div v-if="showtable == false" class="box-grid">
          <div
            v-for="item in list"
            :key="item.id"
            class="box-item"
          >
            <div class="box-header">
              <el-tag :type="item.is_online ? 'success' : 'info'" size="small" effect="dark" class="id-tag">{{ item.id }}</el-tag>
              <span class="callsign">{{ item.callsign }}-{{ item.ssid }}</span>
              <el-tag size="small" type="info">DMR {{ item.dmrid }}</el-tag>
              <el-tag v-if="item.status == 1" size="small" type="danger">🈲</el-tag>
            </div>
            <div class="box-info">
              <div class="info-row">
                <span class="label">{{ $t('device.name') }}:</span>
                <span class="value">{{ item.ssid === 200 && item.name === '' ? $t('device.serverLink') : item.name || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('device.model') }}:</span>
                <span class="value">{{ ValueFilter(item.dev_model, DevModelOptions) }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('device.codecCaps') }}:</span>
                <span class="value">
                  <el-tag v-if="item.supported_codecs & 1" size="small" type="info">G.711</el-tag>
                  <el-tag v-if="item.supported_codecs & 2" size="small" type="warning">Opus</el-tag>
                  <el-tag v-if="item.supported_codecs & 4" size="small" type="success">Codec2</el-tag>
                  <template v-if="!item.supported_codecs">-</template>
                </span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('device.priority') }}:</span>
                <span class="value">{{ item.priority }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('device.rfTypeLabel') }}:</span>
                <span class="value">{{ ValueFilter(item.rf_type, DevRFtypeOptions) }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('device.channelFrequency') }}:</span>
                <span class="value freq">
                  <template v-if="item.device_parm">
                    <template v-if="item.rf_type == 1">R{{ item.device_parm.one_recive_freq }}/T{{ item.device_parm.one_transmit_freq }}</template>
                    <template v-else-if="item.rf_type == 2">R{{ item.device_parm.two_recive_freq }}/T{{ item.device_parm.two_transmit_freq }}</template>
                    <template v-else-if="item.rf_type == 3">{{ $t('device.channelLabel') }}{{ item.device_parm.moto_channel }} {{ getChannelName(item) }}</template>
                  </template>
                  <template v-else>-</template>
                </span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('device.currentGroup') }}:</span>
                <span class="value">
                  <template v-if="item.group_id > 0 && item.group_id < 1000">{{ $t('device.privateGroup') }}</template>
                  <template v-else>{{ ValueFilter(item.group_id, groupsOptions) }}</template>
                </span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('device.owner') }}:</span>
                <span class="value">{{ ValueFilter(item.ower_id, userOptions) }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('device.totalVoiceTime') }}:</span>
                <span class="value">{{ formatVoiceTime(item.voice_time) }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('device.totalTraffic') }}:</span>
                <span class="value">{{ formatFileSize(item.traffic) }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('device.lastVoiceDuration') }}:</span>
                <span class="value">{{ formatVoiceTime(item.last_voice_duration) }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('device.lastVoiceTime') }}:</span>
                <span class="value">{{ parseTime(item.last_voice_end_time) }}</span>
              </div>
            </div>
            <div class="box-footer">
              <div class="status-btns">
                <el-button
                  :type="((item.status ?? 0) & 1) === 1 ? 'danger' : 'success'"
                  size="small"
                  plain
                  class="compact-btn status-receive-btn"
                  :disabled="item.is_online === false"
                  @click="updateStatus(item, 1)"
                >{{ ((item.status ?? 0) & 1) === 1 ? $t('device.disableReceive') : $t('device.receive') }}</el-button>
                <el-button
                  :type="((item.status ?? 0) & 2) === 2 ? 'danger' : 'success'"
                  size="small"
                  plain
                  class="compact-btn status-transmit-btn"
                  :disabled="item.is_online === false"
                  @click="updateStatus(item, 2)"
                >{{ ((item.status ?? 0) & 2) === 2 ? $t('device.disableTransmit') : $t('device.transmit') }}</el-button>
              </div>
              <div class="action-btns">
                <el-button
                  v-if="checkPermission(['admin']) || item.callsign === callsign"
                  type="warning"
                  plain
                  size="small"
                  class="compact-btn action-change-btn"
                  :disabled="item.is_online === false"
                  @click="handleChange(item)"
                >{{ $t("device.change") }}</el-button>
                <el-button
                  v-if="checkPermission(['admin']) || item.callsign === callsign"
                  type="success"
                  plain
                  size="small"
                  class="compact-btn action-at-btn"
                  :disabled="item.is_online === false"
                  @click="handleOpenAT(item)"
                >{{ $t("device.at") }}</el-button>
                <el-button
                  v-if="checkPermission(['admin']) || item.callsign === callsign"
                  type="primary"
                  plain
                  size="small"
                  class="compact-btn action-edit-btn"
                  @click="handleUpdate(item)"
                >{{ $t("device.edit") }}</el-button>
                <el-button
                  v-if="item.dev_model === 202"
                  size="small"
                  type="info"
                  plain
                  class="compact-btn action-bm-btn"
                  @click="$router.push('/public/bm-network')"
                >BM网络</el-button>
                <el-button
                  v-if="checkPermission(['admin']) || item.callsign === callsign"
                  type="danger"
                  plain
                  size="small"
                  class="compact-btn action-delete-btn"
                  @click="handleDelete(item)"
                >{{ $t('employee.delete') }}</el-button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #badge="{ row }">
        <el-tag :type="row.is_online ? 'success' : 'info'" size="small">
          {{ row.is_online ? '在线' : '离线' }}
        </el-tag>
      </template>

      <template #actions="{ row }">
        <el-button
          :type="safeButtonType(((row.status ?? 0) & 1) === 1 ? 'danger' : 'info')"
          size="small"
          plain
          class="compact-btn status-receive-btn"
          @click="updateStatus(row, 1)"
        >{{ (row.status & 1) === 1 ? $t('device.disableReceive') : $t('device.receive') }}</el-button>
        <el-button
          :type="safeButtonType(((row.status ?? 0) & 2) === 2 ? 'danger' : 'info')"
          size="small"
          plain
          class="compact-btn status-transmit-btn"
          @click="updateStatus(row, 2)"
        >{{ (row.status & 2) === 2 ? $t('device.disableTransmit') : $t('device.transmit') }}</el-button>
        <el-button
          v-if="checkPermission(['admin']) || row.callsign === callsign"
          type="success"
          plain
          size="small"
          class="compact-btn action-at-btn"
          :disabled="row.is_online === false"
          @click="handleOpenAT(row)"
        >{{ $t("device.at") }}</el-button>
        <el-button
          v-if="checkPermission(['admin']) || row.callsign === callsign"
          type="primary"
          plain
          size="small"
          class="compact-btn action-edit-btn"
          @click="handleUpdate(row)"
        >{{ $t("device.edit") }}</el-button>
        <el-button
          v-if="row.dev_model === 202"
          size="small"
          type="info"
          plain
          class="compact-btn action-bm-btn"
          @click="$router.push('/public/bm-network')"
        >BM网络</el-button>
      </template>
    </responsive-table>

    <pagination
      v-show="total > 0 && device !== 'mobile'"
      v-model:page="listQuery.page"
      v-model:limit="listQuery.limit"
      class="platform-theme-pagination"
      :total="total"
      @pagination="getList"
    />

    <el-dialog
      v-model="dialogFormVisible"
      :title="textMap[dialogStatus]"
      :center="device === 'mobile'"
      :fullscreen="device === 'mobile'"
      width="70%"
      class="platform-theme-dialog"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="120px"
        style="width: 95%; margin-left: 5px"
      >
        <el-form-item :label="$t('device.name')" prop="name">
          <el-input v-model="temp.name" style="width: 90%" />
        </el-form-item>

        <el-form-item :label="$t('device.dmrid')" prop="dmrid">
          <el-input v-model="temp.dmrid" style="width: 90%" />
        </el-form-item>

        <el-form-item :label="$t('device.grouproom')" prop="group_id">
          <el-select
            v-model="temp.group_id"
            popper-class="platform-theme-select-dropdown"
            filterable
            clearable
            style="width: 90%"
            class="filter-item"
            @change="handleFilter"
          >

            <el-option
              v-for="item in groupsOptions"
              :key="item.id"
              :label="item.id + '-' + item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('device.priority')" prop="priority">
          <el-input-number v-model="temp.priority" :disabled="!checkPermission(['admin'])" :min="0" :max="255" />
        </el-form-item>

        <!-- <el-form-item prop="type" for="">
          <template #label>
            <span id="device-type-label">{{ $t('device.type') }}</span>
          </template>
          <el-radio-group v-model="temp.dev_type" aria-labelledby="device-type-label">
            <el-radio v-for="d in DevTypeOptions" :key="d.id" :value="d.id">{{
              d.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item> -->

        <el-form-item prop="model" for="">
          <template #label>
            <span id="device-model-label">{{ $t('device.model') }}</span>
          </template>
          <el-radio-group v-model="temp.dev_model" aria-labelledby="device-model-label">
            <el-radio v-for="d in DevModelOptions" :key="d.id" :value="d.id">{{
              d.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item prop="rf_type" for="">
          <template #label>
            <span id="device-rf-type-label">{{ $t('device.rf_type') }}</span>
          </template>
          <el-radio-group v-model="temp.rf_type" aria-labelledby="device-rf-type-label">
            <el-radio v-for="d in DevRFtypeOptions" :key="d.id" :value="d.id">{{
              d.name
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <div v-if="temp.rf_type == 3" class="channel-grid">
          <el-form-item
            v-for="channel in 16"
            :key="channel"
            :label="$t('device.channelName', { channel }) + ':'"
            :prop="`chan${channel}_name`"
            class="channel-form-item"
          >
            <el-input v-model="temp.chan_name[channel]" />
          </el-form-item>
        </div>

      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">{{
            $t("employee.cancel")
          }}</el-button>
          <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">{{
            $t("employee.confirm")
          }}</el-button>
        </div>
      </template>
    </el-dialog>

    <param-dialog
      ref="paramDialog"
      v-model="dialogFormChangeVisible"
      v-model:current-relay="current_relay"
      :temp="temp"
      :parmrules="parmrules"
      :platform-options="platformOptions"
      :relay-options="relayOptions"
      :device="device"
      @saved="getList"
    />

    <at-command-dialog
      v-model="dialogFormATVisible"
      :title="textMap[dialogStatus] || 'AT指令'"
      :tempat="tempat"
      :rules="rules"
      :platform-options="platformOptions"
      :at-readme-options="ATREADMEOptions"
      :device="device"
      @execute="handleChangeAT"
    />

  </div>
</template>

<script>
const buttonTypes = new Set([
  '',
  'default',
  'primary',
  'success',
  'warning',
  'info',
  'danger',
  'text',
  'link'
])

import {
  fetchDeviceList,
  updateDevice,
  queryDevice,
  deleteDevice,
  changeDeviceAT
} from '@/api/device'

import { fetchPlatformList } from '@/api/platform'

import { fetchGroupList, fetchGroupListMini } from '@/api/groups'
import { ctcssOptions } from '@/utils/ctcss'
import { fetchEmployeeAllList } from '@/api/employee'
import {
  DevTypeOptions,
  DevModelOptions,
  DevStatusOptions,
  DevRFtypeOptions,
  ATREADMEOptions
} from '@/utils/system'

import { fetchRelayList } from '@/api/relay'

// import permission from '@/directive/permission/index.js' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数

import waves from '@/directive/waves' // waves directive
import {
  parseTime,
  ValueFilter,
  formatFileSize,
  formatVoiceTime
} from '@/utils'

import Pagination from '@/components/Pagination/index.vue' // secondary package based on el-pagination
import ResponsiveTable from '@/components/ResponsiveTable/index.vue'
import AtCommandDialog from './device/AtCommandDialog.vue'
import ParamDialog from './device/ParamDialog.vue'
import { createCrudListMethods } from '@/composables/useCrudList'
import { mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

export default {
  // keep-alive include 按组件名精确匹配 cachedViews 中的路由名，必须与路由 name 一致
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'totaldevices',
  components: { Pagination, ResponsiveTable, AtCommandDialog, ParamDialog },
  directives: { waves },
  data() {
    const validateFreq = (rule, value, callback) => {
      if (!value) {
        console.log('no value:', value, rule)
        return callback(new Error(this.$t('device.freqValidation')))
      }
      const regex = /^\d+(\.\d{4})?$/
      if (!regex.test(value)) {
        return callback(new Error(this.$t('device.freqValidation')))
      }
      callback()
    }
    return {
      tableKey: 0,
      list: [],
      deviceColumns: [
        { prop: 'callsign', label: '呼号/SSID', formatter: (row) => `${row.callsign || '--'}-${row.ssid ?? ''}` },
        { prop: 'name', label: '名称' },
        { prop: 'dmrid', label: 'DMR-ID' },
        { prop: 'group_id', label: '当前组', formatter: (row) => (row.group_id > 0 && row.group_id < 999) ? `个人房间${row.group_id}` : (ValueFilter(row.group_id, this.groupsOptions) || row.group_id) },
        { prop: 'priority', label: '优先级' },
        { prop: 'traffic', label: '总流量', formatter: (row) => formatFileSize(row.traffic) }
      ],
      current_relay: {
        up_freq: '430.0000',
        down_freq: '430.0000',
        send_ctss: '0',
        recive_ctss: '0'
      },
      currentPage: 1,
      pageSize: 10,
      // display_list: [],
      groupsOptions: [],
      DevTypeOptions,
      DevModelOptions,
      DevStatusOptions,
      DevRFtypeOptions,
      ATREADMEOptions,
      platformOptions: [],
      ctcssOptions,
      relayOptions: [],
      userOptions: [],
      userTimeLinelist: null,
      activeName: '',
      total: 0,
      listLoading: false,
      showtable: true,
      listQuery: {
        callsign: undefined,
        // displayOnline: true,
        // ower_id: '',
        group_id: undefined,
        page: 1,
        limit: 10,
        sort: '-id'
      },
      tempat: {
        callsign: undefined,
        ssid: undefined,
        atcommand: '',
        data: undefined,
        atmap: undefined
      },
      temp: {
        id: undefined,
        name: '',
        statusArray: [],
        chan_id: [],
        chan_name: [],
        device_parm: {
          callsign: '',
          one_recive_freq: '430.0000',
          one_transmit_freq: '430.0000',
          two_recive_freq: '430.0000',
          two_transmit_freq: '430.0000',
          one_recive_cxcss: '0',
          one_transmit_cxcss: '0',
          two_recive_cxcss: '0',
          two_transmit_cxcss: '0'
        }
      },

      //  roles: ["admin", "editer", "guest"],
      dialogFormVisible: false,
      dialogFormATVisible: false,

      dialogFormChangeVisible: false,
      dialogStatus: '',
      devicedialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
      },
      parmrules: {
        one_recive_freq: [
          { validator: validateFreq, trigger: 'blur' }
        ],
        one_transmit_freq: [
          { validator: validateFreq, trigger: 'blur' }
        ]
      },

      downloadLoading: false,
      uploadLoading: false
    }
  },
  computed: {
    ...mapState(useAppStore, ['device']),
    ...mapState(useUserStore, ['callsign'])
  },

  created() {
    if (this.device === 'mobile') {
      this.showtable = false
    } else {
      this.showtable = true
    }

    this.fetchPlatformList({}).then((response) => {
      this.platformOptions = response.data.items
    }).catch(() => {})

    this.fetchRelayList({}).then((response) => {
      this.relayOptions = response.data.items
    }).catch(() => {})

    this.fetchGroupListMini({}).then((response) => {
      this.groupsOptions = response.data
    }).catch(() => {})
    this.getList()
  },

  methods: {
    checkPermission,
    fetchDeviceList,
    fetchPlatformList,
    fetchEmployeeAllList,
    fetchGroupList,
    fetchGroupListMini,
    ValueFilter,
    parseTime,
    formatFileSize,
    formatVoiceTime,
    updateDevice,
    queryDevice,
    deleteDevice,
    fetchRelayList,
    changeDeviceAT,

    ...createCrudListMethods({
      fetchList: fetchDeviceList,
      mapItem(row) {
        return this.normalizeDeviceRow(row)
      },
      download: {
        headers: ['ID', '呼号', '设备名称', 'DMRID', '型号', '在线状态', '群组ID', '当前中继'],
        fields: ['id', 'callsign', 'name', 'dmrid', 'model', 'is_online', 'group_id', 'current_relay'],
        filename: 'device-list',
        transformRow(row) {
          return { ...row, is_online: row.is_online ? '在线' : '离线' }
        }
      },
      remove: deleteDevice,
      afterRemove: 'reload',
      confirmTitle: vm => vm.$t('device.notice'),
      confirmText: vm => vm.$t('device.deleteConfirm'),
      confirmButtonText: vm => vm.$t('employee.confirm'),
      cancelButtonText: vm => vm.$t('employee.cancel'),
      cancelledText: vm => vm.$t('device.deleteCancelled'),
      removedText: vm => vm.$t('device.completed')
    }),

    normalizeChanName(chanName) {
      return chanName && typeof chanName === 'object' ? chanName : []
    },

    normalizeDeviceRow(row) {
      if (!row || typeof row !== 'object') {
        return row
      }

      return {
        ...row,
        chan_name: this.normalizeChanName(row.chan_name)
      }
    },

    getChannelName(row) {
      const channel = row?.device_parm?.moto_channel
      if (channel === undefined || channel === null) {
        return ''
      }

      const chanName = this.normalizeChanName(row?.chan_name)
      return chanName[channel] || ''
    },

    handleUpdate(row) {
      this.temp = this.normalizeDeviceRow(Object.assign({}, row)) // copy obj

      if (this.temp.device_parm === null) {
        this.temp.device_parm = {}
      }

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    safeButtonType(type) {
      return buttonTypes.has(type) ? type : ''
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          //    tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateDevice(tempData).then((response) => {
            if (response.code === 20000) {
              ElMessage.success(response?.data?.message || this.$t('device.updateSuccess'))

              this.getList()
              this.dialogFormVisible = false
            } else {
              ElMessage.warning(response?.data?.message || this.$t('device.requestFailed'))
            }
          }).catch(() => {})
        }
      })
    },

    updateStatus(tempData, key) {
      let lastvalue1 = tempData.status & 1
      let lastvalue2 = (tempData.status & 2) >> 1

      if (key === 1) {
        lastvalue1 = lastvalue1 ^ 1
        // lastvalue1 = 1 - lastvalue1
      } else if (key === 2) {
        lastvalue2 = lastvalue2 ^ 1
      }

      tempData.status = lastvalue1 | (lastvalue2 << 1)

      // tempData.status = tempData.statusArray.reduce((acc, num) => acc | num, 0)

      // let status = 0;

      // tempData.statusArray.forEach((num) => {
      //   status |= num; // 按位或运算
      //   });

      //   tempData.status = status;

      //    tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
      updateDevice(tempData).then((response) => {
        if (response.code === 20000) {
          ElMessage.success(response?.data?.message || this.$t('device.updateSuccess'))

          this.getList()
        } else {
          ElMessage.warning(response?.data?.message || this.$t('device.requestFailed'))
        }
      }).catch(() => {})
    },

    handleChange(row) {
      queryDevice(row).then((response) => {
        this.temp = this.normalizeDeviceRow(response.data.items)

        if (this.temp.device_parm === null) {
          ElMessage.warning(response?.data?.message || this.$t('device.loadParamFailed'))

          this.temp.device_parm = { callsign: '', one_recive_freq: '', one_transmit_freq: '' }
          return
        } else {
          this.devicedialogStatus = 'change'
          this.dialogFormChangeVisible = true
          this.$nextTick(() => {
            this.$refs.paramDialog.clearFormValidation()
          })
        }
      }).catch(() => {}) // copy obj
      //  this.temp.timestamp = new Date(this.temp.timestamp);
    },

    handleOpenAT(row) {
      const at = {
        callsign: row.callsign,
        ssid: row.ssid,
        atcommand: 'AT+READ',
        data: '123',
        type: 1
      }
      changeDeviceAT(at).then((response) => {
        // this.tempat = response.data.items.last_atcommand

        this.tempat.callsign = row.callsign
        this.tempat.ssid = row.ssid

        // this.tempat.atmap = { 'AT+READ': '123', 'AT+INIT': 'ok', 'AT+REBOOT': 'ok' }

        // this.tempat = response.data.items.last_atcommand

        if (!response.data.items.last_atcommand) {
          ElMessage.warning(response?.data?.message || this.$t('device.loadAtFailed'))
        } else {
          this.tempat = response.data.items.last_atcommand
          this.dialogFormATVisible = true

          // this.$nextTick(() => {
          //   this.$refs['deviceATForm'].clearValidate()
          // })
        }
      }).catch(() => {}) // copy obj
      //  this.temp.timestamp = new Date(this.temp.timestamp);
    },

    handleChangeAT(callsign, ssid, atcommand, data) {
      console.log(callsign, ssid, atcommand, data)

      const at = {
        callsign: callsign,
        ssid: ssid,
        atcommand: atcommand,
        data: data,
        type: 2
      }

      changeDeviceAT(at).then((response) => {
        if (response.code === 20000) {
          ElMessage.success(response?.data?.message || this.$t('device.atSuccess'))
        } else {
          ElMessage.error(response?.data?.message || this.$t('device.atFailed'))
        }
      }).catch(() => {}) // copy obj
      //  this.temp.timestamp = new Date(this.temp.timestamp);
    },

    handleModifiStatus(row, status) {
      ElMessage.success(this.$t('device.operationSuccess'))
      row.status = status
    },

    toggleOnline() {
      this.listQuery.isonline = !this.listQuery.isonline
      this.handleFilter()
    },

    handleSizeChange: function(size) {
      this.pageSize = size
      // console.log(this.pageSize) //每页下拉显示数据
    },
    handleCurrentChange: function(currentPage) {
      this.currentPage = currentPage
      // console.log(this.currentPage) //点击第几页
    },

    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        name_pref: '',
        type: 0,
        status: 1
      }
    }
  }
}
</script>

<style src="./device/legacy.css"></style>
<style lang="scss" scoped src="./device/device.scss"></style>
