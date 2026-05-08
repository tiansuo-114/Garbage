// 批量导入校园垃圾数据到云数据库
// 使用方式：在微信开发者工具中右键此云函数 → 上传并部署 → 调用
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const campusData = require('./campus_garbage_data.json')

exports.main = async (event, context) => {
  const results = []
  for (const item of campusData) {
    try {
      // 检查是否已存在
      const existing = await db.collection('product').where({ name: item.name }).get()
      if (existing.data.length > 0) {
        results.push({ name: item.name, status: 'skipped', msg: '已存在' })
        continue
      }
      // 插入数据
      const res = await db.collection('product').add({
        data: {
          name: item.name,
          sortId: item.sortId
        }
      })
      results.push({ name: item.name, status: 'success', id: res._id })
    } catch (err) {
      results.push({ name: item.name, status: 'error', msg: err.message })
    }
  }
  return {
    total: campusData.length,
    results: results
  }
}
