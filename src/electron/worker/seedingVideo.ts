/* eslint-disable no-undef */

import { parentPort } from 'worker_threads'
import { seedingVideo } from '../seed/tiktok.seed'

parentPort?.on('message', (message) => {
  if (message != 'exit') {
    const data = JSON.parse(message)
    seedingVideo(data.data.users, data.defaultDir, data.data.data, data.headless)
  }
})
