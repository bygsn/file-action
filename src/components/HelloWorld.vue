<template>
  <div class="hello">
    <div class="card">
      <h2>文件上传</h2>
      <input type="file" @change="handleUpload" />
    </div>

    <div class="card">
      <h2>文件列表</h2>
      <div>
        <button @click="handleGetFileList">刷新列表</button>
        <span style="margin: 0 10px">点击文件名通过 a 标签下载</span>
      </div>
      <div v-for="file in fileList" :key="file.id">
        <span style="margin-right: 10px">
          <span style="color: #ace">{{ file.id }}</span>
          -
          <a :href="'http://127.0.0.1:3000' + file.url">
            <span>{{ file.name }}</span>
          </a>
        </span>
      </div>
    </div>

    <div class="card">
      <input v-model="fileId" type="text" placeholder="填入文件 uuid">
      <button @click="handleDownloadWithWindowOpen">window.open 下载</button>
      <button @click="handleDownloadWithAxios">axios 下载</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HelloWorld',
  data() {
    return {
      file: null,
      fileId: '',
      fileList: [],
    }
  },
  methods: {
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
        .then(console.log)
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
      // 127.0.0.1就等于localhost 就是电脑本地开发环境服务器
      window.open(`http://127.0.0.1:3000/download/${this.fileId}`)
    },
    handleDownloadWithAxios() {
      axios
        .get(`/api/download/${this.fileId}`)
        .then(res => {
          const url = window.URL.createObjectURL(new Blob([res.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', this.fileId)
          document.body.appendChild(link)
          link.click()
        })
    },
  }
}
</script>

<style scoped>

</style>
