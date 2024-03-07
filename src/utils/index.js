/**
 一 get下载 调用通用方法 downloadFileByGET
 功能:
 1. 调用get下载接口
 2. 把接口返回的文件流下载为文件
 3. 提示下载成功
 注意:
 1. 下载的文件的文件名是后端设置的 放在接口的响应头content-disposition中 比如 attachment;filename=%E4%BB%BB%E5%8A%A1%E6%89%A7%E8%A1%8C%E8%80%97%E6%97%B6%E6%8E%92%E8%A1%8C.xlsx
 2. 后端也需要设置文件类型 配置接口的响应头Content-Type中 Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8
 入参:
 url 是 get请求的url
 params 是 get请求的参数
 msg 是 成功的提示
 config 是 get请求的其他配置 比如settimeout
 js中引用说明:
 import util from '@/libs/util';
 import { Message } from "view-design";
 export const downloadFile = (){}

 vue文件中使用说明:
 import downloadFile from '@/api/operation-maintenance'
 const params = {
    type: this.type,
    projectId: Number(localStorage.projectId),
  }
 const url = this.title === "任务执行耗时排行" ? '/develop/api/maintenance/taskExecutionTimeRankingExport' : '/develop/api/maintenance/taskExecutionFailuresRankingExport'
 downloadFile(url, params, '导出成功')

 下载文件 get请求
 - 有多个/0个参数
 - 不需要有loading以及报错提示

 可以直接把下载api调用 + 下载文件前端处理 封装成一个函数 传url 参数 成功提示词就行

 1 写参数 - params有多个参数时
 2 引用函数
 3 调用函数 传参数

 代码解析:
 获取文件名: res.headers["content-disposition"].split("=")[1]
 如果后端返回的是乱码 用decodeURIComponent(res.headers["content-disposition"].split("=")[1]) 转义成中文

 二 get下载 自己封装下载api

 说明 如果自己写下载接口 等 返回的内容是文件流的 必须加上这个参数 responseType: 'blob', 不然下载成功但打不开文件
 export function exportFailureTask(params){
  return util.http({
    method: 'GET',
    url: '/develop/api/maintenance/taskExecutionFailuresRankingExport',
    params,
    responseType: 'blob'
  });
}
 */
// import util from '@/libs/util';
// import { Message } from "view-design";

export const downloadFileByGET = (url, params, msg,  config = {}) => {
  util.http({
    method: 'GET',
    url,
    params,
    responseType: 'blob',
    ...config
  }).then(res => {
    const blob = new Blob([res.data])
    const fileName = decodeURIComponent(
      res.headers["content-disposition"].split('=')[1]
    )
    // 对于<a>标签，只有 Firefox 和 Chrome（内核） 支持 download 属性
    // IE10以上支持blob但是依然不支持download
    if ('download' in document.createElement('a')) {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      link.style.display = 'none'
      document.body.appendChild(link)// 针对老版火狐
      link.click()
      URL.revokeObjectURL(link.href) // 释放内存
      document.body.removeChild(link) // 针对老版火狐
    } else {
      navigator.msSaveBlob(blob, fileName)
    }
    Message.success(msg)
  })
}

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

//下载资源
export function importResourcePackage(data) {
  return util.http({
    method: 'POST',
    url: '/develop/api/resource/download',
    data,
    responseType: 'blob',//定义接口响应的格式,很重要
  });
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
// 用封装的http的方式 post下载文件 - js文件中
// import util from '@/libs/util';
// import {Message} from "view-design";
//
// // 下载
// export const downloadFile = (method, url, data, msg, config = {}) => {
//   util.http({
//     method,
//     url,
//     data,
//     responseType: 'blob',
//     ...config
//   }).then(res => {
//     const blob = new Blob([res.data])
//     const fileName = decodeURIComponent(
//       res.headers['content-disposition'].split('=')[1]
//     )
//     if ('download' in document.createElement('a')) {
//       const link = document.createElement('a')
//       link.href = URL.createObjectURL(blob)
//       link.download = fileName
//       link.style.display = 'none'
//       document.body.appendChild(link)
//       link.click()
//       URL.revokeObjectURL(link.href)
//       document.body.removeChild(link)
//     } else {
//       navigator.msSaveBlob(blob, fileName)
//     }
//     Message.success(msg)
//   })
// }
// 用封装的http的方式 post下载文件 - vue文件中 使用
// handleExport() {
//   const params = {
//     createTenancyId: localStorage.tenancyId,
//     projectId: localStorage.projectId ? Number(localStorage.projectId) : 222,
//     name: this.searchForm.dataMeta
//   }
//   const url = '/develop/api/dataElement/export'
//   downloadFile('POST', url, params, '导出成功')
// },
//
// handleExport2 () {
//   const params = {
//     type: this.type,
//     projectId: Number(localStorage.projectId)
//   }
//   const url = this.title === '任务执行耗时排行' ? '/develop/api/maintenance/taskExecutionTimeRankingExport' : '/develop/api/maintenance/taskExecutionFailuresRankingExport'
//   downloadFile('GET',url, params, '导出成功')
// }
