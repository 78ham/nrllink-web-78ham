<template>
 <div class="app-container platform-theme-page site-settings-page">
  <div class="page-heading">
   <div>
    <h2>{{ $t('siteSettings.title') }}</h2>
    <p>{{ $t('siteSettings.description') }}</p>
   </div>
   <el-button type="primary" :loading="saving" @click="saveSettings">
    {{ $t('siteSettings.save') }}
   </el-button>
  </div>

  <el-form
   ref="settingsForm"
   v-loading="loading"
   :model="form"
   label-position="top"
   class="settings-form"
  >
   <div class="settings-grid">
    <el-form-item v-for="field in fields" :key="field.key" :label="$t(field.label)">
     <el-select v-if="field.key === 'language'" v-model="form[field.key]" style="width: 100%">
      <el-option label="简体中文" value="zh" />
      <el-option label="English" value="en" />
     </el-select>
     <el-input
      v-else
      v-model="form[field.key]"
      :type="field.multiline ? 'textarea' : 'text'"
      :rows="field.multiline ? 3 : undefined"
      clearable
     />
    </el-form-item>
   </div>
  </el-form>
 </div>
</template>

<script>
import { fetchSiteSettings, updateSiteSettings } from '@/api/platform'
import { ElMessage } from 'element-plus'

const emptyForm = {
 platform_name: '', logo_url: '', icp: '', tech_support: '', copyright: '',
 login_slogan: '', contact_mail: '', contact_callsign: '', language: '', cs_qr_url: ''
}

export default {
 name: 'SiteSettingsPage',
 data() {
  return {
   loading: false,
   saving: false,
   form: { ...emptyForm },
   fields: [
    { key: 'platform_name', label: 'siteSettings.platformName' },
    { key: 'logo_url', label: 'siteSettings.logoUrl' },
    { key: 'icp', label: 'siteSettings.icp' },
    { key: 'language', label: 'siteSettings.language' },
    { key: 'login_slogan', label: 'siteSettings.loginSlogan' },
    { key: 'tech_support', label: 'siteSettings.techSupport', multiline: true },
    { key: 'copyright', label: 'siteSettings.copyright', multiline: true },
    { key: 'contact_mail', label: 'siteSettings.contactMail' },
    { key: 'contact_callsign', label: 'siteSettings.contactCallsign' },
    { key: 'cs_qr_url', label: 'siteSettings.qrUrl' }
   ]
  }
 },
 created() {
  this.loadSettings()
 },
 methods: {
  async loadSettings() {
   this.loading = true
   try {
    const response = await fetchSiteSettings()
    const items = Array.isArray(response?.data?.items) ? response.data.items : Object.values(response?.data?.items || {})
    this.form = { ...emptyForm }
    items.forEach(item => {
     if (Object.prototype.hasOwnProperty.call(this.form, item.key)) this.form[item.key] = item.value || ''
    })
   } finally {
    this.loading = false
   }
  },
  async saveSettings() {
   this.saving = true
   try {
    await updateSiteSettings({ settings: { ...this.form } })
    ElMessage.success(this.$t('siteSettings.saved'))
    await this.loadSettings()
   } finally {
    this.saving = false
   }
  }
 }
}
</script>

<style lang="scss" scoped>
.site-settings-page { max-width: 1120px; margin: 0 auto; }
.page-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; margin-bottom:24px; }
.page-heading h2 { margin:0 0 8px; color:var(--platform-ink); font-size:24px; }
.page-heading p { margin:0; color:var(--platform-note-text); line-height:1.6; }
.settings-form { padding:24px; border:1px solid var(--platform-border-light); border-radius:16px; background:var(--platform-surface-light); }
.settings-grid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:6px 24px; }
@media (max-width: 768px) {
 .site-settings-page { padding:16px; }
 .page-heading { flex-direction:column; }
 .page-heading .el-button { width:100%; }
 .settings-form { padding:16px; }
 .settings-grid { grid-template-columns:1fr; }
}
</style>
