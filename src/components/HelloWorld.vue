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
              'Content-Type':'multipart/form-data'
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
        `/api/download/${this.fileId}`, // 接口url
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
  }
}
</script>

<style scoped>
.card-input {
  width: 300px;
}
</style>
