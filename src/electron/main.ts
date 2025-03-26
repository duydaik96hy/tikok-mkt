import { join, resolve } from 'path'
import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { IAccount } from './model/userInfomation'
import { IBaseSettings } from './model/baseSetiings'
import { IUser } from './model/userInfomation'
import { Worker } from 'worker_threads'
import AdmZip from 'adm-zip'

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
  if (existsSync(join(defaultDir, 'chrome')) && existsSync(join(defaultDir, 'chrome/chrome.exe'))) {
  } else {
    try {
      if (!existsSync(join(defaultDir, 'chrome'))) {
        mkdirSync(join(defaultDir, 'chrome'))
        mkdirSync(join(defaultDir, 'chrome/browser-data'))
      }
      mkdirSync(join(defaultDir, 'chrome'), { recursive: true })
      win.webContents.downloadURL('https://mkt.3ae.lol/browser/chrome.zip')
      win.webContents.session.on('will-download', (event, item) => {
        // console.log(app.getAppPath('appData'))
        const zipFile = join(defaultDir, 'chrome', item.getFilename())
        item.setSavePath(zipFile)
        item.on('updated', (event, state) => {
          if (state === 'interrupted') {
          } else if (state === 'progressing') {
            if (item.isPaused()) {
              console.log('Download is paused')
            } else {
              console.log(
                `complete:${((item.getReceivedBytes() / item.getTotalBytes()) * 100).toFixed(2)}%`,
              )

              win?.setProgressBar(item.getReceivedBytes() / item.getTotalBytes())
            }
          }
        })

        item.once('done', (event, state) => {
          if (state === 'completed') {
            console.log('Download successfully')

            setTimeout(async () => {
              try {
                const zip = await unzip(zipFile, join(defaultDir, 'chrome'))
                if (zip) {
                  console.log('unzip success')
                }
              } catch (error) {
                console.log(error)
              }
            }, 1000)
          } else {
          }
        })
      })
    } catch (e) {
      console.log(e)
    }
  }
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

  ipcMain.on('actions', (e, info: string) => {
    //
    const d: { type: string; data: any; users: Array<IAccount> } = JSON.parse(info)
    const index = workerPool.findIndex((x) => x.type == d.type)
    switch (d.type) {
      case 'start-seeding-videos':
        data.baseSettings.seedings.seedingVideos = d.data
        createWorker(join(__dirname, '/worker/seedingVideo.js'), { ...d }, false)
        break
      case 'stop-seeding-videos':
        if (index != -1) {
          workerPool[index].worker.postMessage('exit')
        }
        break
      case 'start-buff-follow':
        data.baseSettings.seedings.buffFollow = d.data
        createWorker(join(__dirname, '/worker/buffFollow.js'), { ...d }, false)
        break
      case 'stop-buff-follow':
        if (index != -1) {
          workerPool[index].worker.postMessage('exit')
        }
        break
      case 'login-tiktok':
        createWorker(join(__dirname, '/worker/loginTikTok.js'), { ...d }, false)

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

async function unzip(filePath: string, unzipPath: string) {
  return new Promise((resolve, reject) => {
    //要解压的文件路径
    const zip = new AdmZip(filePath)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      zip.extractAllToAsync(unzipPath, true, true, (err: any) => {
        if (err) {
          console.error('unzipErr==start')
          console.error('filePath:' + filePath)
          console.error('unzipPath:' + unzipPath)
          console.error('err:' + err)
          console.error('unzipErr==end')
          reject(err)
          return
        }
        removeFile(filePath)
        resolve(true)
      })
    } catch (err) {
      if (existsSync(filePath)) {
        removeFile(filePath)
      }
      reject(err)
    }
  })
}

function removeFile(filePath: string) {
  try {
    unlinkSync(filePath)
  } catch (error) {
    console.log(error)
  }
}
