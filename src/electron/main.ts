import { join, resolve } from 'path'
import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { IAccount } from './model/userInfomation'
import { IBaseSettings } from './model/baseSetiings'
import { IUser } from './model/userInfomation'
import { loginTikTok, seedingVideo } from './seed/tiktok.seed'
import { Worker } from 'worker_threads'

const isDev = !app.isPackaged
const defaultDir = app.isPackaged
  ? app.getPath('userData')
  : resolve(process.cwd(), './src/electron/data')
const browserDataDir = join(defaultDir, './chrome/')
let win: BrowserWindow | null = null
let workerPool: Array<{ type: string; worker: Worker }> = []

interface IData {
  userInfo: IUser | null
  token: string
  accountList: Array<IAccount>
  accountFolderList: Array<string>
  baseSettings: IBaseSettings
}

//
let data: IData = {
  userInfo: null,
  token: '',
  accountList: [],
  accountFolderList: [],
  baseSettings: {
    loginInfo: {
      username: '',
      password: '',
      rememberPwd: false,
    },
    seedings: {
      seedingVideos: {
        numberOfStreams: 1,
        viewVideoTime: [10, 100],
        idLists: '',
      },
      buffFollow: {
        numberOfStreams: 1,
        viewVideoTime: [10, 100],
        followAfterWatch: [1, 3],
        idLists: '',
      },
    },
  },
}
//
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: screen.getPrimaryDisplay().workAreaSize.width,
    height: screen.getPrimaryDisplay().workAreaSize.height,
    minWidth: screen.getPrimaryDisplay().workAreaSize.width * 0.6,
    minHeight: screen.getPrimaryDisplay().workAreaSize.height * 0.6,
    icon: join(__dirname, './../../../src/assets/logo.png'),
    webPreferences: {
      preload: join(__dirname, '../electron/preload.js'),
    },
  })
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../../index.html'))
  }
  return mainWindow
}

if (!existsSync(join(defaultDir, 'config'))) {
  mkdirSync(join(defaultDir, 'config'))
  writeFileSync(join(defaultDir, `/config/data.txt`), JSON.stringify(data))
} else {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = readFileSync(join(defaultDir, `/config/data.txt`))
  if (d) {
    data = JSON.parse(d)
  }
}

if (!existsSync(join(defaultDir, 'themes'))) {
  mkdirSync(join(defaultDir, 'themes'))
}

if (!existsSync(join(defaultDir, 'chrome'))) {
  mkdirSync(join(defaultDir, 'chrome'))
}

app.whenReady().then(() => {
  console.log('running')
  win = createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  ipcMain.on('init-data', () => {
    sendToClient('init-data', data)
  })
  ipcMain.on('edit-info', (e, info) => {
    data[info.type as keyof IData] = JSON.parse(info.data)
    writeFileSync(join(defaultDir, `/config/data.txt`), JSON.stringify(data))
  })

  ipcMain.on('actions', (d: { type: string; data: any; users: Array<IAccount> }) => {
    //
    const index = workerPool.findIndex((x) => x.type == d.type)
    switch (d.type) {
      case 'start-seeding-videos':
        data.baseSettings.seedings.seedingVideos = d.data
        createWorker(join(__dirname, '/data/worker/seedingVideo.js'), { ...d }, false)
        break
      case 'stop-seeding-videos':
        if (index != -1) {
          workerPool[index].worker.postMessage('exit')
        }
        break
      case 'start-buff-follow':
        data.baseSettings.seedings.buffFollow = d.data
        createWorker(join(__dirname, '/data/worker/buffFollow.js'), { ...d }, false)
        break
      case 'stop-buff-follow':
        if (index != -1) {
          workerPool[index].worker.postMessage('exit')
        }
        break
      case 'login-tiktok':
        createWorker(join(__dirname, '/data/worker/loginTikTok.js'), { ...d }, false)

        break

      default:
        break
    }
  })
})

function createWorker(link: string, data: any, headless: boolean) {
  const worker = new Worker(link)
  worker.once('message', (message) => {
    if (message === 'closed-browser') {
      worker.terminate()
    }
  })
  worker.postMessage(
    JSON.stringify({
      data,
      headless,
      defaultDir: browserDataDir,
    }),
  )
  const index = workerPool.findIndex((x) => x.type == data.type)
  if (index != -1) {
    workerPool = [
      ...workerPool.slice(0, index),
      { type: data.type, worker },
      ...workerPool.slice(index + 1),
    ]
  } else {
    workerPool.push({ type: data.type, worker })
  }
}
//
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function sendToClient(channel: string, data: unknown) {
  win?.webContents.send(channel, data)
}
