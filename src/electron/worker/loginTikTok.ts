/* eslint-disable no-undef */

import { parentPort } from 'worker_threads'
import { loginTikTok } from '../seed/tiktok.seed'

parentPort?.on('message', (message) => {
  if (message != 'exit') {
    const data = JSON.parse(message)
    loginTikTok(data.data.users, data.defaultDir, data.headless)
  }
})
