// 方式一 工作中 文件下载方式 拓展util方法
// import util from '@/libs/util'
//
// export const downloadFile = (url, filename, options = {}) => {
//   util.http({
//     method: 'GET',
//     url,
//     responseType: 'blob',
//     ...options
//   }).then(res => {
//     const url = window.URL.createObjectURL(new Blob([res.data]))
//     const link = document.createElement('a')
//     link.href = url
//     link.setAttribute('download', 'true')
//     link.click()
//   })
// }

// 方式二 演示
import axios from 'axios'

export const downloadFile = (url, filename) => {
  axios
    .get(url)
    .then(res => {
      // 后端需要返回响应头'content-type' 一种文件类型对应一种值
      const type = res.headers['content-type']
      const blob = new Blob([res.data], { type })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
    })
}

