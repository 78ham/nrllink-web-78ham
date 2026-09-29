<template>
  <el-dialog
    v-model="visible"
    width="70%"
    class="platform-theme-dialog device-at-dialog"
    :title="title"
    :center="device === 'mobile'"
    :fullscreen="device === 'mobile'"
  >
    <el-form
      :rules="rules"
      :model="tempat"
      :label-position="device === 'mobile' ? 'top' : 'right'"
      :label-width="device === 'mobile' ? 'auto' : '120px'"
      :style="device === 'mobile' ? 'width: 100%' : 'width: 85%; margin-left: 5px'"
      class="device-at-form"
    >
      <el-form-item :label="$t('device.deviceInfoLabel')" prop="version">
        <span class="device-at-version">{{ tempat.version || '--' }}</span>
      </el-form-item>

      <el-collapse v-model="atActiveCollapse" class="device-at-collapse">
        <el-collapse-item title="常用网络与系统参数" name="basic">
          <template v-for="(v, k) in tempat.atmap" :key="k">
            <el-form-item
              v-if="isBasicAtKey(k)"
              :label="k + '='"
              :prop="k"
              class="at-form-item"
            >
              <div class="at-control-row">
                <el-select
                  v-if="k === 'AT+D_IP'"
                  v-model="tempat.atmap[k]"
                  popper-class="platform-theme-select-dropdown"
                  filterable
                  allow-create
                  default-first-option
                  :placeholder="$t('device.selectServer')"
                >
                  <el-option
                    v-for="item in platformOptions"
                    :key="item.id"
                    :label="item.host + '-' + item.name + '-' + '-' + $t('device.online') + ':' +
                      item.online + ',' + $t('device.peak') + ':' + item.total"
                    :value="item.host"
                  />
                </el-select>

                <el-select
                  v-else-if="['AT+APRS', 'AT+DHCP', 'AT+DUPLEX', 'AT+LOOP', 'AT+PTT_RES'].includes(k)"
                  v-model="tempat.atmap[k]"
                  popper-class="platform-theme-select-dropdown"
                  default-first-option
                >
                  <el-option v-for="(item, idx) in ['ON', 'OFF']" :key="idx" :label="item" :value="item" />
                </el-select>

                <el-select
                  v-else-if="k === 'AT+DCD'"
                  v-model="tempat.atmap[k]"
                  popper-class="platform-theme-select-dropdown"
                  default-first-option
                >
                  <el-option
                    v-for="(item, idx) in ['SQL_LO', 'VOX', 'MANUAL', 'DISABLE']"
                    :key="idx"
                    :label="item"
                    :value="item"
                  />
                </el-select>

                <el-select
                  v-else-if="k === 'AT+PTT_EN'"
                  v-model="tempat.atmap[k]"
                  popper-class="platform-theme-select-dropdown"
                  default-first-option
                >
                  <el-option v-for="(item, idx) in ['ENABLE', 'DISABLE']" :key="idx" :label="item" :value="item" />
                </el-select>

                <el-select
                  v-else-if="['AT+PW', 'AT+PTT_IO'].includes(k)"
                  v-model="tempat.atmap[k]"
                  popper-class="platform-theme-select-dropdown"
                  default-first-option
                >
                  <el-option v-for="(item, idx) in ['H', 'L']" :key="idx" :label="item" :value="item" />
                </el-select>

                <el-input v-else v-model="tempat.atmap[k]" class="at-val-input" />
                <el-button size="small" type="primary" plain class="at-exec-btn" @click="$emit('execute', tempat.callsign, tempat.ssid, k, tempat.atmap[k])">
                  {{ $t('device.execute') }}
                </el-button>
                <span v-if="atReadmeOptions[k]" class="at-readme-hint">{{ atReadmeOptions[k] }}</span>
              </div>
            </el-form-item>
          </template>
        </el-collapse-item>

        <el-collapse-item title="高级无线与硬件参数" name="advanced">
          <template v-for="(v, k) in tempat.atmap" :key="k">
            <el-form-item
              v-if="!isBasicAtKey(k)"
              :label="k + '='"
              :prop="k"
              class="at-form-item"
            >
              <div class="at-control-row">
                <el-input v-model="tempat.atmap[k]" class="at-val-input" />
                <el-button size="small" type="primary" plain class="at-exec-btn" @click="$emit('execute', tempat.callsign, tempat.ssid, k, tempat.atmap[k])">
                  {{ $t('device.execute') }}
                </el-button>
                <span v-if="atReadmeOptions[k]" class="at-readme-hint">{{ atReadmeOptions[k] }}</span>
              </div>
            </el-form-item>
          </template>
        </el-collapse-item>

        <el-collapse-item title="自定义 AT 指令" name="custom">
          <el-form-item :label="$t('device.customAt')" class="custom-at-form-item">
            <div class="custom-at-row">
              <el-input v-model="customCommand" placeholder="如 AT+READ" class="custom-at-cmd" />
              <span class="custom-at-eq">=</span>
              <el-input v-model="customData" placeholder="参数值" class="custom-at-val" />
              <el-button type="primary" @click="$emit('execute', tempat.callsign, tempat.ssid, customCommand, customData)">
                {{ $t('device.execute') }}
              </el-button>
            </div>
          </el-form-item>
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
const BASIC_AT_KEYS = ['AT+D_IP', 'AT+DHCP', 'AT+APRS', 'AT+DUPLEX', 'AT+LOOP', 'AT+PTT_EN', 'AT+PTT_RES', 'AT+PW', 'AT+PTT_IO', 'AT+DCD']

// 设备页 AT 指令控制台：展示/编辑常用与高级 AT 参数、执行自定义指令。
// tempat 由父级持有（打开时通过 handleOpenAT 加载），执行结果经 execute 事件回传父级调用 API。
export default {
  name: 'AtCommandDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    tempat: {
      type: Object,
      required: true
    },
    rules: {
      type: Object,
      default: () => ({})
    },
    platformOptions: {
      type: Array,
      default: () => []
    },
    atReadmeOptions: {
      type: Object,
      default: () => ({})
    },
    device: {
      type: String,
      default: 'desktop'
    }
  },
  emits: ['update:modelValue', 'execute'],
  data() {
    return {
      atActiveCollapse: ['basic'],
      customCommand: '',
      customData: ''
    }
  },
  computed: {
    visible: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  methods: {
    isBasicAtKey(k) {
      return BASIC_AT_KEYS.includes(k)
    }
  }
}
</script>

<style lang="scss" scoped>
.device-at-dialog {
  .device-at-version {
    font-weight: 600;
    color: var(--color-text-primary, #303133);
  }

  .at-control-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    width: 100%;

    .at-val-input {
      width: 215px;
      max-width: 100%;
    }

    .at-readme-hint {
      font-size: 12px;
      color: var(--color-text-secondary, #909399);
      margin-left: 4px;
    }
  }

  .custom-at-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    width: 100%;

    .custom-at-cmd {
      flex: 1 1 120px;
    }
    .custom-at-eq {
      font-weight: bold;
      color: var(--color-text-secondary, #909399);
    }
    .custom-at-val {
      flex: 2 1 160px;
    }
  }
}

@media screen and (max-width: 768px) {
  .device-at-dialog {
    .at-control-row {
      .at-val-input {
        width: 100%;
      }
    }
  }
}
</style>
