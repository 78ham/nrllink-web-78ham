import { parseTime } from '@/utils'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * CRUD 列表页共享逻辑工厂（Options API 用法）
 *
 * 在组件 methods 对象中展开即可；组件若定义了同名方法，以组件自身为准（覆盖展开项）：
 *   methods: {
 *     ...createCrudListMethods({ fetchList: fetchDeviceList, ... }),
 *     // 组件特有方法 / 需要覆盖的方法
 *   }
 *
 * 组件需已有的状态：list / total / listLoading / listQuery / downloadLoading /
 * temp / dialogStatus / dialogFormVisible
 *
 * config 可用项：
 *   fetchList          列表查询 API（必填，接收 listQuery）
 *   mapItem(row)       行数据规范化（可访问组件 this）
 *   download           导出配置 { headers, fields, filename, transformRow?(row) }（必填）
 *   remove(row)        删除 API（选填；不提供则不生成 handleDelete）
 *   afterRemove        删除成功后行为：'reload' 重新拉列表 | 'splice' 移除该行（默认 splice）
 *   confirmTitle / confirmText / confirmButtonText / cancelButtonText / cancelledText
 *                      删除确认文案，字符串或 (vm) => string（需要 i18n 时必须传函数，
 *                      因为配置在模块加载时求值，$t 直接调用会固化当时语言）
 *   dialogFormRef      弹窗表单 ref 名（默认 'dataForm'）
 */
function resolveText(option, vm, row, fallback) {
  if (typeof option === 'function') return option(vm, row)
  if (option !== undefined) return option
  return fallback
}

export function createCrudListMethods(config = {}) {
  const methods = {
    getList() {
      this.listLoading = true
      config.fetchList(this.listQuery).then(response => {
        const items = response?.data?.items || []
        this.list = config.mapItem ? items.map(row => config.mapItem.call(this, row)) : items
        this.total = response?.data?.total ?? this.list.length
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleLoadMore() {
      if (this.list.length >= this.total || this.listLoading) return
      this.listQuery.page += 1
      this.listLoading = true
      config.fetchList(this.listQuery).then(response => {
        const items = response?.data?.items || []
        const rows = config.mapItem ? items.map(row => config.mapItem.call(this, row)) : items
        this.list = [...this.list, ...rows]
        this.total = response?.data?.total ?? this.total
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs[config.dialogFormRef || 'dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs[config.dialogFormRef || 'dataForm'].clearValidate()
      })
    },
    async handleDownload() {
      this.downloadLoading = true
      if (this.list === null) {
        this.downloadLoading = false
        return
      }
      const excel = await import('@/vendor/Export2Excel')
      const { headers, fields, filename } = config.download
      const rows = config.download.transformRow
        ? this.list.map(row => config.download.transformRow.call(this, row))
        : this.list
      const data = this.formatJson(fields, rows)
      await excel.export_json_to_excel({
        header: headers,
        data,
        filename
      })
      this.downloadLoading = false
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(row =>
        filterVal.map(key => {
          if (key === 'timestamp') {
            return parseTime(row[key])
          }
          return row[key]
        })
      )
    },
    returnIndex(id, array) {
      for (const index in array) {
        if (array[index].id === id) {
          return index
        }
      }
      return 0
    },
    hasin(id, array) {
      for (const i of array) {
        if (i === id) {
          return true
        }
      }
      return false
    }
  }

  if (config.remove) {
    methods.handleDelete = function(row) {
      ElMessageBox.confirm(resolveText(config.confirmText, this, row, '此操作将永久删除该条数据, 是否继续?'), resolveText(config.confirmTitle, this, row, '提示'), {
        confirmButtonText: resolveText(config.confirmButtonText, this, row, '确定'),
        cancelButtonText: resolveText(config.cancelButtonText, this, row, '取消'),
        type: 'warning'
      })
        .then(() => config.remove(row))
        .then(response => {
          ElMessage.success(response?.data?.message || resolveText(config.removedText, this, row, '操作完成'))
          if (config.afterRemove === 'reload') {
            this.getList()
          } else {
            const index = this.list.indexOf(row)
            if (index !== -1) {
              this.list.splice(index, 1)
            }
          }
        })
        .catch(action => {
          if (action === 'cancel') {
            ElMessage.info(resolveText(config.cancelledText, this, row, '已取消删除'))
          }
          // 接口失败时 request.js 拦截器已统一提示
        })
    }
  }

  return methods
}
