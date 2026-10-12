<template>
  <div class="profile-account">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="88px"
      class="profile-account-form"
    >
      <el-form-item label="姓名">
        <div class="static-field">{{ user.name || '--' }}</div>
      </el-form-item>
      <el-form-item label="电话">
        <div class="static-field">{{ user.phone || '--' }}</div>
      </el-form-item>
      <el-form-item label="呼号">
        <div class="static-field">{{ user.callsign || '--' }}</div>
      </el-form-item>

      <el-form-item label="头像" prop="avatar">
        <el-input
          v-model.trim="form.avatar"
          placeholder="请输入头像图片 URL"
        />
      </el-form-item>

      <el-form-item label="DMR ID" prop="dmrid">
        <el-input
          v-model.trim="form.dmrid"
          maxlength="32"
          placeholder="请输入 DMR ID"
        />
      </el-form-item>

      <el-form-item label="MDC ID" prop="mdcid">
        <el-input
          v-model.trim="form.mdcid"
          maxlength="32"
          placeholder="请输入 MDC ID"
        />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          v-model.trim="form.password"
          type="password"
          show-password
          placeholder="留空则不修改密码"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          class="profile-submit-btn"
          :loading="submitting"
          @click="submit"
        >更新</el-button>
      </el-form-item>
    </el-form>

    <el-divider content-position="left">账户高级安全</el-divider>

    <!-- 两步验证 TOTP 卡片 -->
    <div class="security-section">
      <div class="security-item">
        <div class="security-item-info">
          <h4>两步验证 (TOTP 2FA)</h4>
          <p>启用后，登录时除密码外还需输入身份验证器（如 Google Authenticator、微软身份验证器）生成的 6 位动态验证码。</p>
          <div class="status-tag">
            状态：
            <el-tag :type="user.totp_enabled === 1 ? 'success' : 'info'" size="small">
              {{ user.totp_enabled === 1 ? '已启用' : '未启用' }}
            </el-tag>
          </div>
        </div>
        <div class="security-item-action">
          <el-button
            v-if="user.totp_enabled !== 1"
            type="primary"
            plain
            @click="openTOTPSetup"
          >绑定身份验证器</el-button>
          <el-button
            v-else
            type="danger"
            plain
            @click="showDisableTOTPDialog = true"
          >关闭两步验证</el-button>
        </div>
      </div>

      <el-divider />

      <!-- 通行密钥 Passkey 卡片 -->
      <div class="security-item">
        <div class="security-item-info">
          <h4>通行密钥 (Passkey) 免密登录</h4>
          <p>支持使用本设备生物识别（Windows Hello / Touch ID / Face ID）或硬件安全密钥（YubiKey）免密登录。</p>
        </div>
        <div class="security-item-action">
          <el-button
            type="primary"
            plain
            :loading="registeringPasskey"
            @click="handleRegisterPasskey"
          >绑定新通行密钥</el-button>
        </div>
      </div>

      <el-table
        v-loading="passkeyLoading"
        :data="passkeys"
        style="width: 100%; margin-top: 12px;"
        empty-text="暂无绑定的通行密钥"
        size="small"
      >
        <el-table-column prop="name" label="密钥名称" min-width="160" />
        <el-table-column prop="create_time" label="创建时间" min-width="160" />
        <el-table-column prop="last_used_time" label="最近使用" min-width="160" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-popconfirm
              title="确定要删除此通行密钥吗？"
              @confirm="handleDeletePasskey(scope.row.id)"
            >
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 绑定 TOTP 弹窗 -->
    <el-dialog
      v-model="showTOTPDialog"
      title="绑定身份验证器 (两步验证)"
      width="440px"
      append-to-body
      align-center
    >
      <div style="text-align: center;">
        <p style="color: #606266; font-size: 13px; margin-bottom: 16px;">
          请使用手机身份验证器应用扫描下方二维码：
        </p>
        <div v-if="totpQR" style="margin-bottom: 12px;">
          <img :src="totpQR" alt="TOTP QR" style="width: 180px; height: 180px; border-radius: 8px; border: 1px solid #dcdfe6;">
        </div>
        <p style="font-size: 12px; color: #909399; margin-bottom: 16px; word-break: break-all;">
          若无法扫码，可手动添加密钥：<strong style="color: #409eff;">{{ totpSecret }}</strong>
        </p>
        <el-input
          v-model="totpVerifyCode"
          placeholder="请输入 6 位动态验证码"
          maxlength="6"
          style="width: 220px; letter-spacing: 4px; text-align: center; font-size: 16px; margin-bottom: 16px;"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showTOTPDialog = false">取消</el-button>
          <el-button type="primary" :loading="verifyingTOTP" @click="handleConfirmTOTP">确认并启用</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 关闭 TOTP 弹窗 -->
    <el-dialog
      v-model="showDisableTOTPDialog"
      title="关闭两步验证"
      width="400px"
      append-to-body
      align-center
    >
      <p style="font-size: 13px; color: #606266; margin-bottom: 16px;">
        为确保您的账号安全，请输入当前登录密码以关闭两步验证：
      </p>
      <el-input
        v-model="disableTOTPPassword"
        type="password"
        show-password
        placeholder="请输入登录密码"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDisableTOTPDialog = false">取消</el-button>
          <el-button type="danger" :loading="disablingTOTP" @click="handleConfirmDisableTOTP">确认关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { updateProfile } from '@/api/user'
import {
  setupTOTP,
  verifyTOTP,
  disableTOTP,
  getPasskeyRegisterBegin,
  postPasskeyRegisterFinish,
  listPasskeys,
  deletePasskey
} from '@/api/auth-security'
import { transformCreationOptions, serializeCreationResponse } from '@/utils/webauthn'
import { mapActions, mapState } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          id: '',
          name: '',
          email: '',
          phone: '',
          callsign: '',
          avatar: '',
          dmrid: '',
          mdcid: '',
          password: ''
        }
      }
    }
  },
  data() {
    const validateOptionalNumber = (_, value, callback) => {
      if (!value) {
        callback()
        return
      }

      if (!/^\d+$/.test(value)) {
        callback(new Error('只能输入数字'))
        return
      }

      const number = Number(value)
      if (!Number.isInteger(number) || number < 0 || number > 4294967295) {
        callback(new Error('DMR ID 必须是 0 到 4294967295 之间的整数'))
        return
      }

      callback()
    }

    const validateOptionalMDCID = (_, value, callback) => {
      if (!value) {
        callback()
        return
      }

      if (!/^[0-9A-Fa-f]{4}$/.test(value)) {
        callback(new Error('MDC ID 必须是 4 位十六进制，如 00AF'))
        return
      }

      callback()
    }

    return {
      form: {
        id: '',
        name: '',
        phone: '',
        callsign: '',
        avatar: '',
        dmrid: '',
        mdcid: '',
        password: ''
      },
      submitting: false,
      // TOTP
      showTOTPDialog: false,
      showDisableTOTPDialog: false,
      totpQR: '',
      totpSecret: '',
      totpVerifyCode: '',
      verifyingTOTP: false,
      disableTOTPPassword: '',
      disablingTOTP: false,
      // Passkey
      passkeys: [],
      passkeyLoading: false,
      registeringPasskey: false,
      rules: {
        dmrid: [
          { validator: validateOptionalNumber, trigger: 'blur' }
        ],
        mdcid: [
          { validator: validateOptionalMDCID, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState(useAppStore, ['device'])
  },
  watch: {
    user: {
      handler() {
        this.syncForm()
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.syncForm()
    this.fetchPasskeys()
  },
  methods: {
    ...mapActions(useUserStore, ['getInfo']),
    updateProfile,
    syncForm() {
      this.form = {
        id: this.user.id || '',
        name: this.user.name || '',
        phone: this.user.phone || '',
        callsign: this.user.callsign || '',
        avatar: this.user.avatar || '',
        dmrid: this.user.dmrid || '',
        mdcid: this.user.mdcid || '',
        password: ''
      }
    },
    submit() {
      this.$refs.formRef.validate(async(valid) => {
        if (!valid) {
          return
        }

        this.submitting = true

        try {
          const profilePayload = {
            id: this.form.id,
            avatar: this.form.avatar || '',
            dmrid: this.form.dmrid || '',
            mdcid: this.form.mdcid ? this.form.mdcid.toUpperCase() : '',
            password: this.form.password || ''
          }

          const profileResponse = await this.updateProfile(profilePayload)
          if (profileResponse.code !== 20000) {
            ElMessage.warning(profileResponse?.data?.message || '资料修改失败')
            return
          }

          await this.getInfo()
          this.$emit('updated')
          this.syncForm()
          ElMessage.success(this.form.password ? '资料和密码已更新' : (profileResponse?.data?.message || '修改成功'))
        } finally {
          this.submitting = false
        }
      })
    },
    async openTOTPSetup() {
      try {
        const res = await setupTOTP()
        if (res.code === 20000 && res.data) {
          this.totpQR = res.data.qr_image
          this.totpSecret = res.data.secret
          this.totpVerifyCode = ''
          this.showTOTPDialog = true
        } else {
          ElMessage.error(res.message || '生成密钥失败')
        }
      } catch (err) {
        ElMessage.error(err.message || '生成密钥失败')
      }
    },
    async handleConfirmTOTP() {
      if (!this.totpVerifyCode || this.totpVerifyCode.length < 6) {
        ElMessage.warning('请输入 6 位动态验证码')
        return
      }
      this.verifyingTOTP = true
      try {
        const res = await verifyTOTP(this.totpVerifyCode)
        if (res.code === 20000) {
          ElMessage.success('两步验证已成功开启')
          this.showTOTPDialog = false
          await this.getInfo()
          this.$emit('updated')
        } else {
          ElMessage.error(res.message || '验证码错误')
        }
      } catch (err) {
        ElMessage.error(err.message || '验证失败')
      } finally {
        this.verifyingTOTP = false
      }
    },
    async handleConfirmDisableTOTP() {
      if (!this.disableTOTPPassword) {
        ElMessage.warning('请输入登录密码')
        return
      }
      this.disablingTOTP = true
      try {
        const res = await disableTOTP(this.disableTOTPPassword)
        if (res.code === 20000) {
          ElMessage.success('两步验证已关闭')
          this.showDisableTOTPDialog = false
          this.disableTOTPPassword = ''
          await this.getInfo()
          this.$emit('updated')
        } else {
          ElMessage.error(res.message || '密码错误')
        }
      } catch (err) {
        ElMessage.error(err.message || '关闭失败')
      } finally {
        this.disablingTOTP = false
      }
    },
    async fetchPasskeys() {
      this.passkeyLoading = true
      try {
        const res = await listPasskeys()
        if (res.code === 20000 && res.data) {
          this.passkeys = Array.isArray(res.data.items) ? res.data.items : []
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.passkeyLoading = false
      }
    },
    async handleRegisterPasskey() {
      if (!window.PublicKeyCredential) {
        ElMessage.warning('当前浏览器不支持通行密钥 (Passkey)')
        return
      }
      this.registeringPasskey = true
      try {
        const beginRes = await getPasskeyRegisterBegin()
        if (beginRes.code !== 20000 || !beginRes.data) {
          throw new Error(beginRes.message || '获取通行密钥挑战失败')
        }

        const { session_id, options } = beginRes.data
        const credOptions = transformCreationOptions(options)

        const credential = await navigator.credentials.create(credOptions)
        if (!credential) {
          throw new Error('未创建有效凭据')
        }

        const payload = serializeCreationResponse(credential)
        const finishRes = await postPasskeyRegisterFinish(session_id, '', payload)
        if (finishRes.code !== 20000) {
          throw new Error(finishRes.message || '保存凭据失败')
        }

        ElMessage.success('通行密钥已成功绑定')
        await this.fetchPasskeys()
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          ElMessage.warning('已取消通行密钥创建')
        } else {
          ElMessage.error(err.message || '绑定通行密钥失败')
        }
      } finally {
        this.registeringPasskey = false
      }
    },
    async handleDeletePasskey(id) {
      try {
        const res = await deletePasskey(id)
        if (res.code === 20000) {
          ElMessage.success('通行密钥已删除')
          await this.fetchPasskeys()
        } else {
          ElMessage.error(res.message || '删除失败')
        }
      } catch (err) {
        ElMessage.error(err.message || '删除失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-account {
  padding: 4px 2px 0;
}

.profile-account-form {
  :deep(.el-form-item__label) {
    color: var(--platform-ink);
    font-weight: 600;
  }

  :deep(.el-input__wrapper) {
    background: var(--platform-deep-90) !important;
    box-shadow: 0 0 0 1px var(--platform-border-input) inset !important;
    border-radius: 14px;
  }

  :deep(.el-input__inner) {
    color: var(--platform-ink) !important;
  }
}

.static-field {
  min-height: 42px;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 16px;
  border-radius: 14px;
  background: var(--platform-deep-86);
  box-shadow: 0 0 0 1px var(--platform-border-light) inset;
  color: var(--platform-ink-dim);
}

.profile-submit-btn {
  min-width: 120px;
}

.security-section {
  padding: 8px 4px 16px;

  .security-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;

    .security-item-info {
      h4 {
        margin: 0 0 6px 0;
        font-size: 15px;
        color: var(--platform-ink);
      }

      p {
        margin: 0 0 8px 0;
        font-size: 13px;
        color: var(--platform-ink-dim);
        line-height: 1.5;
      }

      .status-tag {
        font-size: 13px;
        color: var(--platform-ink-dim);
      }
    }
  }
}
</style>
