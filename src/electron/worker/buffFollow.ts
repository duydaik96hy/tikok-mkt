/* eslint-disable no-undef */

import { parentPort } from 'worker_threads'
import { buffFollows } from '../seed/tiktok.seed'

parentPort?.on('message', (message) => {
  if (message != 'exit') {
    const data = JSON.parse(message)
    buffFollows(data.data.users, data.data.data, data.defaultDir, data.headless)
  }
})
