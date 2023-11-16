// 方式一 通用下载 拓展util方法
// import util from '@/libs/util'
//
// export const downloadFile = (url, filename, options = {}) => {
//   util.http({
//     method: 'GET',
//     url,
//     responseType: 'blob',
//     ...options
//   }).then(res => {
//       const blob = new Blob([res.data])
//       const link = document.createElement('a')
//       link.href = URL.createObjectURL(blob);
//       link.download = filename
//       link.click()
//       URL.revokeObjectURL(link.href);
//   })
// }

// 方式二 演示效果 用axios下载文件
import axios from 'axios'

export const downloadFile = (url, filename, options = {}) => {
  axios({
    method: 'get',
    url,
    responseType: 'blob',
    ...options
  }).then(res => {
    const blob = new Blob([res.data])
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob);
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href);
  })
}
