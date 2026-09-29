<template>
  <el-dialog
    v-model="visible"
    :title="$t('device.parameterEdit')"
    width="70%"
    class="platform-theme-dialog"
    :center="device === 'mobile'"
    :fullscreen="device === 'mobile'"
  >
    <el-form
      ref="devicedataForm"
      :rules="parmrules"
      :model="temp.device_parm"
      label-position="right"
      label-width="100px"
      style="width: 90%; margin-left: 5px"
    >
      <el-form-item :label="$t('device.deviceInfo') + ':'" prop="dev">
        {{ temp.callsign }}-{{ temp.ssid }} {{ temp.name }}
      </el-form-item>

      <el-collapse accordion>
        <el-collapse-item :title="$t('device.ipPasswordSettings')" name="1">
          <!-- IP and Password Settings -->

          <el-form-item :label="$t('device.callsign') + ':'" prop="callsign">
            <el-input
              v-model="temp.device_parm.callsign"
              :placeholder="$t('device.callsignPlaceholder')"
              style="width: 100px"
              :disabled="!checkPermission(['admin'])"
            />
          </el-form-item>

          <el-form-item :label="$t('device.deviceNumber') + ':'" prop="ssid">
            <el-input v-model="temp.device_parm.ssid" style="width: 80px" /><el-button
              type="primary"
              @click="changeByte('newcallsignssid', temp.device_parm.callsign + '-' + temp.device_parm.ssid)"
            >{{ $t('device.save') }}</el-button>
          </el-form-item>

          <el-form-item :label="$t('device.localPassword') + ':'" prop="local_password">
            <el-input v-model="temp.device_parm.local_password" style="width: 150px" :disabled="true" />
          </el-form-item>

          <el-form-item :label="$t('device.localIp') + ':'" prop="local_ipaddr">
            <el-input v-model="temp.device_parm.local_ipaddr" style="width: 150px" />
          </el-form-item>

          <el-form-item :label="$t('device.netmask') + ':'" prop="netmask">
            <el-input v-model="temp.device_parm.netmask" style="width: 150px" />
          </el-form-item>

          <el-form-item :label="$t('device.gateway') + ':'" prop="gateway">
            <el-input v-model="temp.device_parm.gateway" style="width: 150px" />
          </el-form-item>

          <el-form-item :label="$t('device.dnsAddress') + ':'" prop="dns_ipaddr">
            <el-input v-model="temp.device_parm.dns_ipaddr" style="width: 150px" />
          </el-form-item>

          <el-form-item :label="$t('device.targetAddress') + ':'" prop="dest_domainname">
            <el-select
              v-model="temp.device_parm.dest_domainname"
              popper-class="platform-theme-select-dropdown"
              filterable
              allow-create
              default-first-option
              :placeholder="$t('device.selectServer')"
            >
              <el-option
                v-for="item in platformOptions"
                :key="item.id"
                :label="item.name + '-' + item.host + '-' + $t('device.online') + ':' + item.online + ',' + $t('device.peak') + ':' + item.total"
                :value="item.host"
              />
            </el-select>

            <el-popconfirm
              :title="$t('device.confirmTargetAddress')"
              :confirm-button-text="$t('device.saveConfirm')"
              :cancel-button-text="$t('device.discard')"
              @confirm="changeIP(temp.device_parm)"
            >
              <template #reference>
                <el-button type="primary">{{ $t('device.save') }}</el-button>
              </template>
            </el-popconfirm>
          </el-form-item>

        </el-collapse-item>

        <el-collapse-item :title="$t('device.settings')" name="2">
          <el-form-item prop="name" for="">
            <template #label>
              <span id="device-dcd-select-label">{{ $t('device.dcdSelect') }}:</span>
            </template>
            <el-radio-group
              v-model="temp.device_parm.dcd_select"
              aria-labelledby="device-dcd-select-label"
              @change="changeByte('dcd_select', temp.device_parm.dcd_select)"
            >
              <el-radio :value="0">{{ $t('device.off') }}</el-radio>
              <el-radio :value="1">{{ $t('device.manual') }}</el-radio>
              <el-radio :value="2">SQL_LO</el-radio>
              <el-radio :value="3">SQL_HI</el-radio>
              <el-radio :value="4">VOX </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="$t('device.pttEnable') + ':'" prop="ptt_enable">
            <el-switch
              v-model="temp.device_parm.ptt_enable"
              active-color="#1890ff"
              inactive-color="#dcdfe6"
              :active-value="1"
              :inactive-value="0"
              @change="changeByte('ptt_enable', temp.device_parm.ptt_enable)"
            />
          </el-form-item>

          <el-form-item prop="ptt_level_reversed" for="">
            <template #label>
              <span id="device-ptt-level-label">{{ $t('device.pttLevel') }}:</span>
            </template>
            <el-radio-group
              v-model="temp.device_parm.ptt_level_reversed"
              aria-labelledby="device-ptt-level-label"
              @change="changeByte('ptt_level_reversed', temp.device_parm.ptt_level_reversed)"
            >
              <el-radio :value="1">{{ $t('device.highLevel') }}</el-radio>
              <el-radio :value="0">{{ $t('device.lowLevel') }}</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="M/Y PTT:" prop="ptt_resistive">
            <el-switch
              v-model="temp.device_parm.ptt_resistive"
              active-color="#1890ff"
              inactive-color="#dcdfe6"
              :active-value="1"
              :inactive-value="0"
              @change="changeByte('ptt_resistive', temp.device_parm.ptt_resistive)"
            />
          </el-form-item>

          <el-form-item :label="$t('device.monitor') + ':'" prop="monitor">
            <el-switch
              v-model="temp.device_parm.monitor"
              active-color="#1890ff"
              inactive-color="#dcdfe6"
              :active-value="1"
              :inactive-value="0"
              @change="changeByte('monitor', temp.device_parm.monitor)"
            />
          </el-form-item>

          <el-form-item :label="$t('device.modulePower') + ':'" prop="realy_status">
            <el-switch
              v-model="temp.device_parm.realy_status"
              active-color="#1890ff"
              inactive-color="#dcdfe6"
              :active-text="$t('device.modulePowerLow')"
              :inactive-text="$t('device.modulePowerHigh')"
              :active-value="1"
              :inactive-value="0"
              @change="changeByte('realy_status', temp.device_parm.realy_status)"
            />
          </el-form-item>

          <el-form-item :label="$t('device.moduleSupply') + ':'" prop="one_uv_power">
            <el-switch
              v-model="temp.device_parm.one_uv_power"
              active-color="#1890ff"
              inactive-color="#dcdfe6"
              :active-value="1"
              :inactive-value="0"
              @change="changeByte('one_uv_power', temp.device_parm.one_uv_power)"
            />
          </el-form-item>

          <el-form-item prop="key_func" for="">
            <template #label>
              <span id="device-key-func-label">{{ $t('device.keyFunction') }}:</span>
            </template>
            <el-radio-group
              v-model="temp.device_parm.key_func"
              aria-labelledby="device-key-func-label"
              @change="changeByte('key_func', temp.device_parm.key_func)"
            >
              <el-radio :value="0">{{ $t('device.relay') }}</el-radio>
              <el-radio :value="1">PTT</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="$t('device.addTailVoice') + ':'" prop="name">
            <el-slider
              v-model="temp.device_parm.add_tail_voice"
              :min="15"
              :max="1000"
              show-input
              :format-tooltip="formatTailVoice"
              style="width: 95%"
              @change="changeByte('add_tail_voice', temp.device_parm.add_tail_voice)"
            />
          </el-form-item>

          <el-form-item :label="$t('device.removeTailVoice') + ':'" prop="name">
            <el-slider
              v-model="temp.device_parm.remove_tail_voice"
              :max="1000"
              show-input
              :format-tooltip="formatTailVoice"
              style="width: 95%"
              @change="changeByte('remove_tail_voice', temp.device_parm.remove_tail_voice)"
            />
          </el-form-item>

        </el-collapse-item>

        <el-collapse-item :title="$t('device.motoSection')" name="3">
          <el-form-item :label="$t('device.channelSwitch') + ':'" prop="moto_channel">
            <el-select
              v-model="temp.device_parm.moto_channel"
              popper-class="platform-theme-select-dropdown"
              style="width: 95%"
              @change="changeByte('moto_channel', temp.device_parm.moto_channel)"
            ><el-option lable="0" :value="0" />
              <el-option v-for="(item, index) in 16" :key="index" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item :title="$t('device.module1wSection')" name="4">
          <el-form-item :label="$t('device.receiveFreq1w') + ':'" prop="one_recive_freq">
            <el-input v-model="temp.device_parm.one_recive_freq" style="width: 150px" />
          </el-form-item>

          <el-form-item :label="$t('device.transmitFreq1w') + ':'" prop="one_transmit_freq">
            <el-input v-model="temp.device_parm.one_transmit_freq" style="width: 150px" />
          </el-form-item>

          <el-form-item :label="$t('device.receiveCtcss1w') + ':'" prop="recive_dumb">
            <el-select v-model="temp.device_parm.one_recive_cxcss" style="width: 150px">
              <el-option v-for="item in ctcssOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('device.transmitCtcss1w') + ':'" prop="transmit_dumb">
            <el-select v-model="temp.device_parm.one_transmit_cxcss" style="width: 150px">
              <el-option v-for="item in ctcssOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('device.volume1w') + ':'" prop="one_volume">
            <el-slider v-model="temp.device_parm.one_volume" :max="9" show-input style="width: 95%" />
          </el-form-item>

          <el-form-item :label="$t('device.sql1w') + ':'" prop="one_sql_level">
            <el-slider v-model="temp.device_parm.one_sql_level" :max="9" show-input style="width: 95%" />
          </el-form-item>

          <el-form-item :label="$t('device.micGain1w') + ':'" prop="one_mic_sensitivity">
            <el-slider v-model="temp.device_parm.one_mic_sensitivity" :max="8" show-input style="width: 95%" />
          </el-form-item>
          <el-form-item :label="$t('device.relayTemplate') + ':'" prop="current_relay">
            <el-select
              :model-value="currentRelay"
              popper-class="platform-theme-select-dropdown"
              style="width: 95%"
              filterable
              clearable
              value-key="id"
              @change="onRelay1Change"
            >
              <el-option
                :label="$t('device.emptyTemplate')"
                :value="{
                  id: 0,
                  up_freq: '430.0000',
                  down_freq: '430.0000',
                  send_ctss: '0',
                  recive_ctss: '0',
                }"
              />
              <el-option
                v-for="item in relayOptions"
                :key="item.id"
                :label="item.name + ' ' + item.up_freq + ' ' + item.down_freq"
                :value="item"
              />
            </el-select>
          </el-form-item>

          <el-button type="primary" @click="update1w(temp.device_parm)">{{ $t('device.save1w') }}</el-button>
        </el-collapse-item>

        <el-collapse-item :title="$t('device.module2wSection')" name="5">
          <el-form-item :label="$t('device.receiveFreq2w') + ':'" prop="two_recive_freq">
            <el-input v-model="temp.device_parm.two_recive_freq" style="width: 150px" />
          </el-form-item>

          <el-form-item :label="$t('device.transmitFreq2w') + ':'" prop="two_transimit_freq">
            <el-input v-model="temp.device_parm.two_transmit_freq" style="width: 150px" />
          </el-form-item>

          <el-form-item :label="$t('device.receiveCtcss2w') + ':'" prop="two_recive_cxcss">
            <el-input v-model="temp.device_parm.two_recive_cxcss" style="width: 150px" />
          </el-form-item>

          <el-form-item :label="$t('device.transmitCtcss2w') + ':'" prop="two_transmit_cxcss">
            <el-input v-model="temp.device_parm.two_transmit_cxcss" style="width: 150px" />
          </el-form-item>

          <el-form-item :label="$t('device.volume2w') + ':'" prop="name">
            <el-select v-model="temp.device_parm.two_volume" style="width: 150px">
              <el-option v-for="item in 9" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('device.sql2w') + ':'" prop="two_sql_level">
            <el-select v-model="temp.device_parm.two_sql_level" style="width: 150px">
              <el-option v-for="item in 9" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('device.micGain2w') + ':'" prop="two_mic_level">
            <el-select v-model="temp.device_parm.two_mic_level" style="width: 150px">
              <el-option v-for="item in 9" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('device.relayTemplate') + ':'" prop="current_relay">
            <el-select
              :model-value="currentRelay"
              popper-class="platform-theme-select-dropdown"
              style="width: 95%"
              filterable
              clearable
              value-key="id"
              @change="onRelay2Change"
            >
              <el-option
                :label="$t('device.emptyTemplate')"
                :value="{
                  id: 0,
                  up_freq: '430.0000',
                  down_freq: '430.0000',
                  send_ctss: '0',
                  recive_ctss: '0',
                }"
              />
              <el-option
                v-for="item in relayOptions"
                :key="item.id"
                :label="item.name + ' ' + item.up_freq + ' ' + item.down_freq"
                :value="item"
              />
            </el-select>
          </el-form-item>

          <el-button type="primary" @click="update2w(temp.device_parm)">{{ $t('device.save2w') }}</el-button>
        </el-collapse-item>
      </el-collapse>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">{{ $t('device.close') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { changeDeviceParm, changeDevice1w, changeDevice2w } from '@/api/device'
import { ctcssOptions } from '@/utils/ctcss'
import { ValueFilter } from '@/utils'
import checkPermission from '@/utils/permission'
import { ElMessage } from 'element-plus'

// 设备页参数编辑对话框（IP/密码、开关、尾音、信道、1W/2W 模块）。
// temp 由父级持有；保存类操作直接调 API，成功后 emit('saved') 由父级刷新列表。
export default {
  name: 'DeviceParamDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    temp: {
      type: Object,
      required: true
    },
    parmrules: {
      type: Object,
      default: () => ({})
    },
    platformOptions: {
      type: Array,
      default: () => []
    },
    relayOptions: {
      type: Array,
      default: () => []
    },
    currentRelay: {
      type: Object,
      default: null
    },
    device: {
      type: String,
      default: 'desktop'
    }
  },
  emits: ['update:modelValue', 'update:currentRelay', 'saved'],
  computed: {
    visible: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    ctcssOptions() {
      return ctcssOptions
    }
  },
  methods: {
    checkPermission,
    ValueFilter,
    clearFormValidation() {
      this.$refs['devicedataForm'].clearValidate()
    },
    onRelay1Change(val) {
      this.$emit('update:currentRelay', val)
      this.applyrelay(val)
    },
    onRelay2Change(val) {
      this.$emit('update:currentRelay', val)
      this.applyrelay2w(val)
    },
    formatTailVoice(val) {
      return val * 5 + 'ms'
    },
    update1w(device_parm) {
      this.$refs['devicedataForm'].validate((valid) => {
        if (valid) {
          changeDevice1w(device_parm).then((response) => {
            this.$emit('saved')

            ElMessage.success(response?.data?.message || this.$t('device.save1wSuccess'))
          }).catch(() => {})
        } else {
          alert(this.$t('device.freqValidation'))
          return false
        }
      })
    },
    update2w(device_parm) {
      changeDevice2w(device_parm).then((response) => {
        this.$emit('saved')

        ElMessage.success(response?.data?.message || this.$t('device.save2w'))
      }).catch(() => {})
    },
    applyrelay(val) {
      if (val !== 0) {
        this.temp.device_parm.one_recive_freq = val.down_freq
        this.temp.device_parm.one_transmit_freq = val.up_freq
        this.temp.device_parm.one_recive_cxcss = val.recive_ctss
        this.temp.device_parm.one_transmit_cxcss = val.send_ctss
      }
    },
    applyrelay2w(val) {
      if (val !== 0) {
        this.temp.device_parm.two_recive_freq = val.down_freq + '0'
        this.temp.device_parm.two_transmit_freq = val.up_freq + '0'
        this.temp.device_parm.two_recive_cxcss = this.ValueFilter(
          val.recive_ctss,
          ctcssOptions
        )
        this.temp.device_parm.two_transmit_cxcss = this.ValueFilter(
          val.send_ctss,
          ctcssOptions
        )
      }
    },
    changeByte(name, val) {
      changeDeviceParm(
        'DMRID=' +
        this.temp.dmrid +
        '&callsign=' +
        this.temp.callsign +
        '&ssid=' +
        this.temp.ssid +
        '&' +
        name +
        '=' +
        val
      ).then((response) => {
        ElMessage.info(response?.data?.message || this.$t('device.operationCompleted'))
      }).catch(() => {})
    },
    changeIP(val) {
      changeDeviceParm(
        'DMRID=' +
        this.temp.dmrid +
        '&callsign=' +
        this.temp.callsign +
        '&ssid=' +
        this.temp.ssid +
        '&local_ipaddr=' +
        val.local_ipaddr +
        '&gateway=' +
        val.gateway +
        '&netmask=' +
        val.netmask +
        '&dns_ipaddr=' +
        val.dns_ipaddr +
        '&dest_domainname=' +
        val.dest_domainname
      ).then((response) => {
        ElMessage.info(response?.data?.message || this.$t('device.operationCompleted'))
      }).catch(() => {})
    }
  }
}
</script>
