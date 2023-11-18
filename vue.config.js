module.exports = {
  devServer: {
    proxy: {
      '/api': {
        // 127.0.0.1 = localhost
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      '^/download': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      }
    }
  }
}
