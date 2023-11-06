一 功能

文件上传下载项目 包括前后端
vue2项目 前端vue2 后端node

二 运行

1)安装依赖
pnpm i
需要用pnpm 如果只有npm 需要先安装pnpm
3) 通过这两个命令启动项目
pnpm run dev 启动vue前端项目
pnpm run server 启动后端项目
在idea或者vscode中开两个终端 一共终端中运行一个项目
同时启动前端项目和后端项目

三 项目运行效果

前端项目: 点击前端项目终端运行完成生成的url 可以点击选择文件上传文件 然后刷新列表 能看到刚才已经上传的文件 然后点击文件列表中有下划线的部分 就能下载文件
或者复制文件列表中一个文件的前面浅蓝色的部分 放到下面的uuid输入框中 点击下载 就能下载这个文件

uuid是什么? 文件的前面浅绿色的文字
怎么下载文件? 文件的后面蓝色的文字 点击就下载文件了

后端项目: 后端项目中也有写页面 点击后端项目终端运行完成生成的url 能看到后端项目中写的页面

四 代码解析

后端项目只有一个文件 就是server中的main.js文件
前端项目是除了server文件夹之外的其他文件夹

五 项目结构

├── README.md
├── babel.config.js
├── package-lock.json
├── package.json
├── public
│   ├── favicon.ico
│   ├── index.html
├── server
│   ├── main.js
│   └── uploads
├── src
│   ├── App.vue
│   ├── assets
│   │   └── logo.png
│   ├── components
│   │   └── HelloWorld.vue
│   ├── main.js
└── vue.config.js

