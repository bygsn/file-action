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

// 方式二 演示效果 用axios -get下载文件
import axios from 'axios'
import * as url from "url";

export const downloadFile = (url, fileName, options = {}) => {
  axios({
    method: 'get',
    url,
    responseType: 'blob',
    ...options
  }).then(res => {
    const blob = new Blob([res.data])
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob);
    link.download = fileName
    link.click()
    URL.revokeObjectURL(link.href);
  })
}

// 方式三 用axios - post 下载文件

export const downloadFileWithPost = (url, fileName, options = {}) => {
  // this.$http.post(url,{},{responseType:"blob"})  axios.post请求的第二个参数需要是{}}
  axios({
    method: 'post',
    url,
    responseType: 'blob',
    ...options
  }).then(res => {
    const blob = new Blob([res.data], {
      type: "application/octet-stream"
    })
    const link = document.createElement('a')
    link.target = '_blank'
    link.href = URL.createObjectURL(blob);
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(link.href)
    document.body.removeChild(link)
  })

  // 用封装的http的方式
  // this.$http.post(url, {}, { responseType: 'blob' }).then(res => {
  //   const blob = new Blob([res.data], {
  //     type: "application/octet-stream"
  //   })
  //   const link = document.createElement('a')
  //   link.target = '_blank'
  //   link.href = URL.createObjectURL(blob);
  //   link.download = this.file.name
  //   document.body.appendChild(link)
  //   link.click()
  //   URL.revokeObjectURL(link.href)
  //   document.body.removeChild(link)
  // })
}