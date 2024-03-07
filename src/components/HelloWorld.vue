<template>
  <div class="hello">
    <div class="card">
      文件相关操作:
      <span style="color: green">文件上传 下载/get请求 下载/post请求 </span>
      <span> 5分钟下载链接过期 导出 导入 大文件上传 大文件下载 多文件同时下载</span>
<!-- todo  5分钟下载链接过期-->
    </div>
    <div class="card">
      <h2>文件上传</h2>
      <div>点击选择文件 自动上传文件</div>
      <input type="file" @change="handleUpload" />
    </div>

    <div class="card">
      <h2>文件列表</h2>
      <div>
        <button @click="handleGetFileList">刷新列表</button>
      </div>
      <div style="margin: 10px 0">点击文件uuid自动填入; 点击文件名通过 a 标签下载</div>
      <div style="margin: 10px 0">文件列表格式: 文件uuid - 文件名</div>
      <div v-for="file in fileList" :key="file.id">
        <span style="margin-right: 10px">
          <span style="color: #ace" @click="handleClickUuid(file)">{{ file.id }}</span>
          -
          <!--
            不能直接这样写 把后端url加到前面 http://127.0.0.1:3000
            必须在vue.config里面配代理
          -->
<!--          <a :href="'http://127.0.0.1:3000' + file.url">-->
          <a :href="file.url">
            <span>{{ file.name }}</span>
          </a>
        </span>
      </div>
    </div>

    <div class="card">
      <input v-model="fileId" type="text" placeholder="填入文件 uuid" class="card-input">
      <button @click="handleDownloadWithWindowOpen">window.open 下载</button>
      <button @click="handleDownloadWithAxiosCommon">axios 下载 - get - 常用</button>
      <button @click="handleDownloadWithAxiosGet">axios下载 - get - 简易</button>
      <button @click="handleDownloadWithAxiosPostCommon">axios下载 - post - 常用</button>
      <button @click="handleDownloadWithAxiosPost">axios下载 - post - 简易</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { downloadFile, downloadFileWithPost } from '@/utils'

export default {
  name: 'HelloWorld',
  data() {
    return {
      file: null,
      fileId: '',
      fileList: [],
    }
  },
  mounted() {
    this.handleGetFileList()
  },
  methods: {
    handleClickUuid(file) {
      this.file = file
      this.fileId = file.id
    },
    handleUpload(e) {
      const file = e.target.files[0]
      const fd = new FormData()
      fd.append('file', file)
      axios
        .post(
          '/api/upload',
          {
            file,
          },
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
          }
        )
        .then((res) => {
          this.handleGetFileList()
        })
        .catch(console.log)
    },
    handleGetFileList() {
      axios
        .get('/api/files')
        .then(res => {
          this.fileList = res.data.data
        })
    },
    handleDownloadWithWindowOpen() {
      window.open(`http://${location.host}/download/${this.fileId}`)
      // window.open(`http://127.0.0.1:3000/download/${this.fileId}`)
    },
    handleDownloadWithAxiosPostCommon() {
      downloadFileWithPost(
        `/api/download/post/${this.fileId}`, // 接口url
        this.file.name, // 文件名
        {
          timeout: 1000 * 60 * 10 // 10s超时
        }
      )
    },
    handleDownloadWithAxiosCommon() {
      downloadFile(
        `/api/download/${this.fileId}`, // 接口url 只有一个参数的情况
        this.file.name, // 文件名
        {
          timeout: 1000 * 60 * 10 // 10s超时
        }
      )
      downloadFile(
        // Export?type=0&projectId=268
        `/api/download1/`, // 接口url get请求 params传参 有大于一个参数的情况 比如2个
        // params传参是这种形式 Export?type=0&projectId=268 直接拼 用模板字符串
        this.file.name, // 文件名
        {
          timeout: 1000 * 60 * 10 // 10s超时
        }
      )
    },
    handleDownloadWithAxiosCommonNote() {
      /**
       通用下载思路:
       因为项目中 不止一个地方需要下载文件 有很多地方都需要下载文件 所以把文件下载的方法提取出来 放到js文件里面
       需要下载的项目页面 调用通用下载方法 传入对应的参数就可以下载文件了
       */
      // 一般有开始下载的提示 演示效果就先省略
      // this.$message({
      //   duration: 1000,
      //   message: '开始下载',
      //   type: 'success'
      // })
      downloadFile(
        `/api/download/${this.fileId}`, // 接口url
        this.file.name, // 文件名
        {
          timeout: 1000 * 60 * 10 // 10s超时
        }
      )
    },
    handleDownloadWithAxiosGet() {
      // 注意 get请求 只有2个参数 axios.get(url[, config])
      axios
        .get(`/api/download/${this.fileId}`,
          {
            responseType: 'blob',
          }
        )
        .then(res => {
          const blob = new Blob([res.data])
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob);
          link.download = this.file.name
          link.click()
          URL.revokeObjectURL(link.href)
        })
    },
    handleDownloadWithAxiosPost() {
      // 注意 post请求 有3个参数 第3个才是config axios.post(url[, data[, config]])
      axios
        .post(`/api/download/post/${this.fileId}`,
          {},
          {
            responseType: 'blob',
          }
        )
        .then(res => {
          const blob = new Blob([res.data], {
            type: "application/octet-stream"
          })
          const link = document.createElement('a')
          link.target = '_blank'
          link.href = URL.createObjectURL(blob);
          link.download = this.file.name
          document.body.appendChild(link)
          link.click()
          URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        })
    },
    handleDownloadWithAxiosGetNote() {
      /**
       通过接口的形式获取文件流并生成下载文件 使用blob下载思路：
       1）使用ajax发起请求，指定接收类型为blob（responseType: ‘blob’）
       2）自定义文件名 或者读取请求返回的头部信息里的content-disposition，返回的文件名就在这里面
       3）使用URL.createObjectURL将请求的blob数据转为可下载的url地址
       4）使用a标签下载
       */
      axios
        .get(`/api/download/${this.fileId}`,
          {
            responseType: 'blob',// 必须要有这个属性 不然下载文件成功 打开也是乱码的
          }
        )
        .then(res => {
          const blob = new Blob([res.data])
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob);// 将请求的blob数据转为可下载的url地址
          link.download = this.file.name// 必须有download属性 值是这种格式'text.pdf' download属性的值用作下载的文件的文件名和文件类型 文件类型必须跟文件的实际类型一致
          link.click()
          URL.revokeObjectURL(link.href)
          // window.URL 和 URL 是一样的 vue中 没有前缀的类 默认都是挂在windows上的
          // blob下载文件 是需要一个type的 但是web端没有type 只要download属性中的后缀和文件的真正类型相同 也可以正确下载
          // 所以web端后端可以不返回content-type
          // 手机微信和企业微信内嵌h5页面 后端必须返回content-type 并且不能用a标签下载 只能用window.open(url)下载
          // const type = res.headers['content-type']
          // const blob = new Blob([res.data], { type })
        })
    },
    // 其他下载内容
  //   // 下载一 模板下载
  //   templateDownLoad() {
  //     let url = "/target-api/api/fileSource/template";
  //     const params = new FormData();
  //     if (this.formData.type == "TEXTFILE") {
  //       params.append("type", "txt");
  //     } else if (this.formData.type == "EXCELFILE") {
  //       params.append("type", "excel");
  //     } else {
  //       params.append("type", "csv");
  //     }
  //     this.$http
  //       .post(url, params, {responseType: "blob"})
  //       .then((response) => {
  //         const headers = response.headers["content-disposition"];
  //         const index = headers.lastIndexOf("=");
  //         const fileName = decodeURIComponent(
  //           headers.substring(index + 2, headers.length - 1)
  //         );
  //         const link = document.createElement("a");
  //         link.target = "_blank";
  //         link.href = window.URL.createObjectURL(response.data);
  //         link.download = fileName; // 自定义文件名
  //         document.body.appendChild(link);
  //         link.click();
  //         window.URL.revokeObjectURL(link.href);
  //         document.body.removeChild(link);
  //       });
  //   },
  //   // 下载二
  //   This.$http.post(url, param, httpConfig).then(response => {
  //       This.$Notice.success({
  //         title: '操作成功'
  //       })
  //       This.modalVisible = false
  //       if (response.data) {
  //         if (response.data.size > 0) {
  //           const content = response.data
  //           const blob = new Blob([content])// 构造一个blob对象来处理数据
  //           const fileName = response.headers['content-disposition'].split('=')[1]
  //           // 对于<a>标签，只有 Firefox 和 Chrome（内核） 支持 download 属性
  //           // IE10以上支持blob但是依然不支持download
  //           if ('download' in document.createElement('a')) { // 支持a标签download的浏览器
  //             const link = document.createElement('a')// 创建a标签
  //             link.download = fileName// a标签添加属性
  //             link.style.display = 'none'
  //             link.href = window.URL.createObjectURL(blob)
  //             document.body.appendChild(link)
  //             link.click()// 执行下载
  //             window.URL.revokeObjectURL(link.href) // 释放url
  //             document.body.removeChild(link)// 释放标签
  //           } else { // 其他浏览器
  //             navigator.msSaveBlob(blob, fileName)
  //           }
  //         }
  //       }
  //     }
  //   )
  //     .catch(function (error) {
  //       This.$Notice.error({
  //         title: '操作失败'
  //       })
  //       console.log(error)
  //     }),
  //   //下载三
  //   download(row) {
  //     const msg = this.$Message.loading({
  //       content: "下载中...",
  //       duration: 0
  //     });
  //     this.$http
  //       .get(
  //         "/api/fjxz/single?filePath=" + encodeURIComponent(row.attachment),
  //         {
  //           responseType: "blob"
  //         }
  //       )
  //       .then(res => {
  //         // 处理下载失败返回json的情况
  //         if (res.headers["content-type"] === "application/json") {
  //           let reader = new FileReader();
  //           // 将返回数据转为json
  //           reader.onload = e => {
  //             let tempRes = JSON.parse(e.target.result);
  //             // 下载失败返回json的处理逻辑
  //             this.$Message.error(tempRes.message || "下载失败");
  //           };
  //           reader.readAsText(res.data);
  //         } else {
  //           if (res.data && res.data.size >= 0) {
  //             const content = res.data;
  //             const blob = new Blob([content]);
  //             const fileName = decodeURIComponent(
  //               res.headers["content-disposition"].split("=")[1]
  //             );
  //             if ("download" in document.createElement("a")) {
  //               const link = document.createElement("a");
  //               link.download = fileName;
  //               link.style.display = "none";
  //               link.href = window.URL.createObjectURL(blob);
  //               document.body.appendChild(link);
  //               link.click();
  //               window.URL.revokeObjectURL(link.href);
  //               document.body.removeChild(link);
  //             } else {
  //               navigator.msSaveBlob(blob, fileName);
  //             }
  //           }
  //         }
  //       })
  //       .catch(err => {
  //         console.log(err);
  //       })
  //       .finally(() => {
  //         msg();
  //       });
  //   },
  //   // 下载四
  //   // 导出
  //   exportFunc() {
  //     const params = Object.assign({}, this.filterData);
  //     params.isProblemOrderInput = params.isProblemOrderInput || "";
  //     this.exportLoading = true;
  //     this.$http
  //       .post("/api/sendOrderHandle/riskListHandleDownload", params, {
  //         responseType: "blob"
  //       })
  //       .then(res => {
  //         if (res.status === 200) {
  //           // 获取文件名
  //           const headers = res.headers["content-disposition"];
  //           const index = headers.lastIndexOf("=");
  //           const fileName = headers.substring(index + 1);
  //           if (this.isIE()) {
  //             window.navigator.msSaveOrOpenBlob(res.data, fileName);
  //           } else {
  //             // 创建URL
  //             const objectUrl = URL.createObjectURL(res.data);
  //             // 利用a标签自定义下载文件名
  //             const link = document.createElement("a");
  //             link.href = objectUrl;
  //             link.download = fileName; // 自定义文件名
  //             document.body.appendChild(link); // 针对老版火狐
  //             link.click(); // 下载文件
  //             URL.revokeObjectURL(objectUrl); // 释放内存
  //             document.body.removeChild(link); // 针对老版火狐
  //           }
  //         } else {
  //           this.$Message.error("导出接口请求失败");
  //         }
  //         this.exportLoading = false;
  //       })
  //       .catch(() => {
  //         this.exportLoading = false;
  //       });
  //   },
  //   // 判断是否是IE浏览器
  //   isIE() {
  //     if (!!window.ActiveXObject || "ActiveXObject" in window) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   },
  //   // 下载五
  //   genWeb () {
  //     let This = this
  //     const [url, param, httpConfig] = [
  //       '/api/genWeb',
  //       Qs.stringify({
  //         formId: This.generate.id,
  //         path: This.generate.webPath
  //       }),
  //       {
  //         responseType: 'blob',
  //         headers: {
  //           'Content-Type': 'application/x-www-form-urlencoded'
  //         }
  //       }
  //     ]
  //     This.$http.post(url, param, httpConfig).then(response => {
  //         This.$Notice.success({
  //           title: '操作成功'
  //         })
  //         This.modalVisible = false
  //         if (response.data) {
  //           if (response.data.size > 0) {
  //             const content = response.data
  //             const blob = new Blob([content])// 构造一个blob对象来处理数据
  //             const fileName = response.headers['content-disposition'].split('=')[1]
  //             // 对于<a>标签，只有 Firefox 和 Chrome（内核） 支持 download 属性
  //             // IE10以上支持blob但是依然不支持download
  //             if ('download' in document.createElement('a')) { // 支持a标签download的浏览器
  //               const link = document.createElement('a')// 创建a标签
  //               link.download = fileName// a标签添加属性
  //               link.style.display = 'none'
  //               link.href = window.URL.createObjectURL(blob)
  //               document.body.appendChild(link)
  //               link.click()// 执行下载
  //               window.URL.revokeObjectURL(link.href) // 释放url
  //               document.body.removeChild(link)// 释放标签
  //             } else { // 其他浏览器
  //               navigator.msSaveBlob(blob, fileName)
  //             }
  //           }
  //         }
  //       }
  //     )
  //       .catch(function (error) {
  //         This.$Notice.error({
  //           title: '操作失败'
  //         })
  //         console.log(error)
  //       })
  //   },
  //   // 下载六
  // //   import { saveAs } from 'file-saver'
  //   //下载七
  //   downloadFunc2 () {
  //     // 处理下载失败返回json的情况
  //     if (this.resultHead['content-type'] === 'application/json') {
  //       let reader = new FileReader()
  //       // 将返回数据转为json
  //       reader.onload = e => {
  //         let tempRes = JSON.parse(e.target.result)
  //         // 下载失败返回json的处理逻辑
  //         this.$Message.error(tempRes.message || '下载失败')
  //       }
  //       reader.readAsText(this.keyResult)
  //     } else {
  //       if (this.keyResult && this.keyResult.size >= 0) {
  //         const content = this.keyResult
  //         const blob = new Blob([content])
  //         const fileName = decodeURIComponent(
  //           this.resultHead['content-disposition'].split('=')[1]
  //         )
  //         if ('download' in document.createElement('a')) {
  //           const link = document.createElement('a')
  //           link.download = fileName
  //           link.style.display = 'none'
  //           link.href = window.URL.createObjectURL(blob)
  //           document.body.appendChild(link)
  //           link.click()
  //           window.URL.revokeObjectURL(link.href)
  //           document.body.removeChild(link)
  //         } else {
  //           navigator.msSaveBlob(blob, fileName)
  //         }
  //       }
  //     }
  //   },
  //   // 下载八
  //   // 导出
  //   exportFunc() {
  //     const params = Object.assign({}, this.filterData);
  //     params.isProblemOrderInput = params.isProblemOrderInput || "";
  //     this.exportLoading = true;
  //     this.$http
  //       .post("/api/sendOrderHandle/riskListHandleDownload", params, {
  //         responseType: "blob"
  //       })
  //       .then(res => {
  //         if (res.status === 200) {
  //           // 获取文件名
  //           const headers = res.headers["content-disposition"];
  //           const index = headers.lastIndexOf("=");
  //           const fileName = headers.substring(index + 1);
  //           if (this.isIE()) {
  //             window.navigator.msSaveOrOpenBlob(res.data, fileName);
  //           } else {
  //             // 创建URL
  //             const objectUrl = URL.createObjectURL(res.data);
  //             // 利用a标签自定义下载文件名
  //             const link = document.createElement("a");
  //             link.href = objectUrl;
  //             link.download = fileName; // 自定义文件名
  //             document.body.appendChild(link); // 针对老版火狐
  //             link.click(); // 下载文件
  //             URL.revokeObjectURL(objectUrl); // 释放内存
  //             document.body.removeChild(link); // 针对老版火狐
  //           }
  //         } else {
  //           this.$Message.error("导出接口请求失败");
  //         }
  //         this.exportLoading = false;
  //       })
  //       .catch(() => {
  //         this.exportLoading = false;
  //       });
  //   },
  //   // 下载九
  //   exportAllTable() {
  //     let data = {
  //       custId: this.node.usccCode,
  //       clndrDtId: Number(
  //         this.yearCount.toString() +
  //         this.monthCount.toString().padStart(2, "0") +
  //         " "
  //       ),
  //     }
  //     exprotExcel(data).then((res) => {
  //       if (res.status === 200) {
  //         this.$Message.success("正在导出！");
  //         let blob = new Blob([res.data]);
  //         // 从响应头中获取文件名称
  //         let fileNameResponse;
  //         //后续若有后端返回表名名称res.headers["content-disposition"]从这里获取
  //         const contentDisposition = res.headers["content-disposition"];
  //         if (contentDisposition) {
  //           // 正则获取filename的值
  //           const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
  //           const matches = filenameRegex.exec(contentDisposition);
  //           if (matches != null && matches[1]) {
  //             fileNameResponse = matches[1].replace(/['"]/g, "");
  //             fileNameResponse = decodeURI(fileNameResponse);
  //           }
  //           fileName = fileNameResponse;
  //         } else {
  //           if (fileName) {
  //             fileName = `${fileName}.xlsx`;
  //           } else {
  //             fileName = `${+new Date()}.xlsx`;
  //           }
  //         }
  //         if ("download" in document.createElement("a")) {
  //           // 非IE下载
  //           const elink = document.createElement("a");
  //           elink.download = fileName;
  //           elink.style.display = "none";
  //           elink.href = URL.createObjectURL(blob);
  //           document.body.appendChild(elink);
  //           elink.click();
  //           URL.revokeObjectURL(elink.href); // 释放URL 对象
  //           document.body.removeChild(elink);
  //         } else {
  //           // IE10+下载
  //           window.navigator.msSaveBlob(blob, fileName);
  //         }
  //       } else {
  //         this.$Message.error("下载失败,请联系管理员");
  //       }
  //     }).catch(() => {
  //       this.$Message.error("导出失败!")
  //     })
  //   },
  //   // 下载十
  //

  }
}
</script>

<style scoped>
.card-input {
  width: 300px;
}
</style>
