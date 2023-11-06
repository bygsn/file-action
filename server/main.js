const express = require('express')
const uuid = require('uuid')
const multer = require('multer')
const fse = require('fs-extra')

const app = express()

app.use(express.static('server/uploads'))

const FILE_UPLOAD_DIR = 'server/uploads'

// nodejs里的打印  是打印在idea运行后端项目的终端里的 只有vue项目的打印 才是打印在浏览器控制台的

// 创建 Multer 实例，指定文件上传的目录
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fse.ensureDir(FILE_UPLOAD_DIR)
    cb(null, FILE_UPLOAD_DIR) // 文件上传后保存到 uploads 目录
  },
  filename: function (req, file, cb) {
    const fileId = uuid.v4()
    const ext = file.originalname.split('.').pop()
    const fileName = `${fileId}---${file.originalname}`
    file.info = { fileId, ext }
    cb(null, fileName)
  },
})

const upload = multer({
  storage: storage
})

// 设置路由处理文件上传
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('未选择文件上传！')
  }
  const { fileId } = req.file.info
  res.status(200).send(`文件上传成功！fileId: ${fileId}`)
})

// 设置路由处理文件下载
app.get('/download/:uuid', (req, res) => {
  const uuid = req.params.uuid;
  if (!uuid) {
    return res.status(404).send('UUID 未提供！');
  }

  fse.readdir(FILE_UPLOAD_DIR)
    .then((files) => {
      // 过滤以指定 UUID 开头的文件
      const matchingFiles = files.filter((file) => file.startsWith(uuid));
      console.log('matchingFiles => ', matchingFiles)
      if (matchingFiles.length === 0) {
        return res.status(404).send('未找到匹配文件');
      }

      // 如果有多个匹配文件，选择第一个
      const firstMatchingFile = matchingFiles[0];

      // 设置content-type
      const fileType = firstMatchingFile.split('.').pop().toLowerCase()
      console.log('fileType => ', fileType.length)
      if(fileType === 'pdf') {
        res.type('application/pdf')
      } else if(fileType === 'doc') {
        res.type('application/msword')
      } else if(fileType === 'docx') {
        res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      } else if(fileType === 'xls') {
        res.type('application/vnd.ms-excel')
      } else if(fileType === 'xlsx') {
        res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      }

      // 构建文件的完整路径
      const filePath = `${FILE_UPLOAD_DIR}/${firstMatchingFile}`;


      // 使用 res.download 或 res.sendFile 返回文件
      res.download(filePath, firstMatchingFile.split('---').pop(), (err) => {
        if (err) {
          res.status(500).send('文件下载出错');
        }
      });
    })
    .catch((error) => {
      res.status(500).send('无法读取目录');
    });
});

app.get('/', (req, res) => {
  res.send(`
    <form action="/upload" method="post" enctype="multipart/form-data">
      <p>
        <label>选择文件上传：</label>
        <input type="file" name="file" />
      </p>
      <p>
        <button type="submit">上传</button>
      <p>
    </form>
  `)
})

app.get('/files', (req, res) => {
  fse.ensureDir(FILE_UPLOAD_DIR)

  // 使用 fs.readdir 读取指定目录下的文件列表
  fse.readdir(FILE_UPLOAD_DIR, (err, files) => {
    if (err) {
      return res.status(500).send('无法读取目录');
    }

    res.json({
      code: 200,
      data: files.map(v => {
        const [fileId, filename] = v.split('---')

        return {
          id: v.split('---')[0],
          ext: '.' + filename.split('.').pop(),
          name: filename,
          url: `/download/${fileId}`,
          href: `${FILE_UPLOAD_DIR}/${v}`,
        }
      })
    })
  });
});

app.get('/html/files', (req, res) => {
  // 使用 fs.readdir 读取指定目录下的文件列表
  fse.readdir(FILE_UPLOAD_DIR, (err, files) => {
    if (err) {
      return res.status(500).send('无法读取目录');
    }

    // 构建HTML模板字符串，包含文件下载链接
    const html = `
      <html>
        <body>
          <h1>文件列表</h1>
          ${files.map((file) => {
            return `<a href="/download/${file}">${file.split('---').pop()}</a><br>`;
          }).join('') || '空'}
        </body>
      </html>
    `;

    // 返回HTML响应
    res.send(html);
  });
});

app.listen(3000, () => {
  console.log('http://localhost:3000/')
})
