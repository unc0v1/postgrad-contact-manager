import { createApp } from './app.js'
import { config } from './config/index.js'

const app = createApp()

app.listen(config.port, () => {
  console.log(`[服务器] 已启动，端口: ${config.port}`)
  console.log(`[服务器] 地址: http://localhost:${config.port}`)
})
