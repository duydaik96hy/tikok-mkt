/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  send: (channel: string, data: any) => {
    // whitelist channels
    const validChannels: Array<string> = ['init-data', 'update', 'edit-info', 'actions', 'status']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  //sdsd
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  receive: (channel: string, func: Function) => {
    const validChannels: Array<string> = ['init-data', 'update', 'actions', 'status']
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  },
})
