<template>
 <div class="app-container platform-theme-page server-register-page">
  <div class="page-heading">
   <h2>{{ $t('serverRegistration.title') }}</h2>
   <p>{{ $t('serverRegistration.description') }}</p>
  </div>
  <el-form ref="registerForm" :model="form" :rules="rules" label-position="top" class="register-form">
   <div class="form-grid">
    <el-form-item :label="$t('server.server_name')" prop="name">
     <el-input v-model="form.name" maxlength="80" clearable />
    </el-form-item>
    <el-form-item :label="$t('server.server_type')" prop="server_type">
     <el-select v-model="form.server_type" style="width:100%" placeholder="请选择">
      <el-option :label="'专用服务器'" :value="1" />
      <el-option :label="'普通PC'" :value="2" />
      <el-option :label="'小主机'" :value="3" />
      <el-option :label="'树莓派等开发板'" :value="4" />
      <el-option :label="'自建虚拟机'" :value="5" />
      <el-option :label="'阿里云'" :value="6" />
      <el-option :label="'腾讯云'" :value="7" />
      <el-option :label="'华为云'" :value="8" />
     </el-select>
    </el-form-item>
    <el-form-item :label="$t('server.ip_addr')" prop="ip_addr">
     <el-input v-model="form.ip_addr" clearable />
    </el-form-item>
    <el-form-item :label="$t('server.dns_name')" prop="dns_name">
     <el-input v-model="form.dns_name" clearable />
    </el-form-item>
    <el-form-item :label="$t('server.udp_port')" prop="udp_port">
     <el-input v-model="form.udp_port" inputmode="numeric" clearable />
    </el-form-item>
    <el-form-item :label="$t('server.note')" class="full-width">
     <el-input v-model="form.note" type="textarea" :rows="4" maxlength="500" show-word-limit />
    </el-form-item>
   </div>
   <div class="form-actions">
    <el-button type="primary" :loading="submitting" @click="submit">{{ $t('serverRegistration.submit') }}</el-button>
   </div>
  </el-form>
 </div>
</template>

<script>
import { registerServer } from '@/api/server'
import { ElMessage } from 'element-plus'

const initialForm = () => ({ name: '', server_type: 0, ip_addr: '', dns_name: '', udp_port: '60051', note: '' })

export default {
 name: 'ServerRegistrationPage',
 data() {
  const endpointValidator = (rule, value, callback) => {
   if (!this.form.ip_addr.trim() && !this.form.dns_name.trim()) callback(new Error(this.$t('serverRegistration.endpointRequired')))
   else callback()
  }
  return {

   submitting: false,
   form: initialForm(),
   rules: {
    name: [{ required: true, message: this.$t('serverRegistration.nameRequired'), trigger: 'blur' }],
    ip_addr: [{ validator: endpointValidator, trigger: 'blur' }],
    dns_name: [{ validator: endpointValidator, trigger: 'blur' }],
    udp_port: [
     { required: true, message: this.$t('serverRegistration.portRequired'), trigger: 'blur' },
     { pattern: /^\d{1,5}$/, message: this.$t('serverRegistration.portInvalid'), trigger: 'blur' }
    ]
   }
  }
 },
 methods: {
  submit() {
   this.$refs.registerForm.validate(async valid => {
    if (!valid) return
    const port = Number(this.form.udp_port)
    if (port < 1 || port > 65535) {
     ElMessage.warning(this.$t('serverRegistration.portInvalid'))
     return
    }
    this.submitting = true
    try {
     const response = await registerServer({ ...this.form, status: 2 })
     ElMessage.success(response?.data?.message || this.$t('serverRegistration.success'))
     this.form = initialForm()
     this.$nextTick(() => this.$refs.registerForm?.clearValidate())
    } finally {
     this.submitting = false
    }
   })
  }
 }
}
</script>

<style lang="scss" scoped>
.server-register-page { max-width:900px; margin:0 auto; }
.page-heading { margin-bottom:24px; }
.page-heading h2 { margin:0 0 8px; color:var(--platform-ink); font-size:24px; }
.page-heading p { margin:0; color:var(--platform-note-text); line-height:1.6; }
.register-form { padding:24px; border:1px solid var(--platform-border-light); border-radius:16px; background:var(--platform-surface-light); }
.form-grid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:6px 24px; }
.full-width { grid-column:1 / -1; }
.form-actions { display:flex; justify-content:flex-end; margin-top:12px; }
@media (max-width: 768px) {
 .server-register-page { padding:16px; }
 .register-form { padding:16px; }
 .form-grid { grid-template-columns:1fr; }
 .full-width { grid-column:auto; }
 .form-actions .el-button { width:100%; }
}
</style>
