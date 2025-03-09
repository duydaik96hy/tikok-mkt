import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { IAccount } from '../model/userInfomation'
import { lauch, timeout } from './baseFunction'
import { parentPort } from 'worker_threads'

const stealthPlugin = StealthPlugin()
stealthPlugin.enabledEvasions.delete('iframe.contentWindow')
stealthPlugin.enabledEvasions.delete('media.codecs')
puppeteer.use(stealthPlugin)

export async function loginGmail(
  listUser: Array<IAccount>,
  headless: boolean,
  userDataDir: string,
) {
  for (let index = 0; index < listUser.length; index++) {
    const user = listUser[index]
    const pX = (index % 5) * 360
    const pY = (Math.floor(index / 5) % 3) * 360
    userLoginGmail(user, headless, `--window-position=${pX},${pY}`, userDataDir)
    await timeout(2000)
  }
}

export async function loginOutlook(
  listUser: Array<IAccount>,
  headless: boolean,
  userDataDir: string,
) {
  for (let index = 0; index < listUser.length; index++) {
    const user = listUser[index]
    const pX = (index % 5) * 360
    const pY = (Math.floor(index / 5) % 3) * 360
    userLoginOutLook(user, headless, `--window-position=${pX},${pY}`, userDataDir)
    await timeout(2000)
  }
}

async function userLoginGmail(
  user: IAccount,
  headless: boolean,
  position: string,
  userDataDir: string,
) {
  try {
    const loginUrl = 'https://workspace.google.com/intl/en-US/gmail/'
    const browser = await lauch(user, headless, position, userDataDir)
    const page = await browser.newPage()
    await page.goto(loginUrl, {
      waitUntil: 'networkidle2',
      timeout: 300000,
    })

    await timeout(1000)
    await page.click('#root > div:nth-child(1) > header > div > div:nth-child(5) > a:nth-child(2)')
    await page.waitForNavigation()
    await timeout(1000)
    let url = await page.url()
    if (url.includes('AccountChooser')) {
      console.log('need choose account')
      await page.keyboard.press('Tab')
      await timeout(1000)
      await page.keyboard.press('Enter')
      await timeout(1000)
    } else {
      await page.keyboard.type(user.gmail, { delay: 50 })
      await timeout(300)
      await page.keyboard.press('Enter')
      await page.waitForNavigation()
      await timeout(3000)
      await page.keyboard.type(user.passGmail, { delay: 60 })
      await timeout(300)
      await page.keyboard.press('Tab')
      await timeout(300)
      await page.keyboard.press('Tab')
      await timeout(1000)
      await page.keyboard.press('Enter')
      await timeout(1000)
      await page.keyboard.press('Tab')
      await timeout(2000)
      url = await page.url()
      if (url.includes('passkeyenrollment')) {
        await page.keyboard.press('Tab')
        await timeout(300)
        await page.keyboard.press('Tab')
        await timeout(400)
        await page.keyboard.press('Tab')
        await timeout(400)
        await page.keyboard.press('Enter')
      }
    }

    await timeout(2000)
    await page.goto('https://mail.google.com/', {
      waitUntil: 'networkidle2',
      timeout: 300000,
    })
    url = await page.url()
    if (url.includes('mail.google.com')) {
      console.log('success')
    } else {
      console.log('fail')
    }
    await page.close()
  } catch (error) {
    console.log(error)
  }
}

async function userLoginOutLook(
  user: IAccount,
  headless: boolean,
  position: string,
  userDataDir: string,
) {
  const browser = await lauch(user, headless, position, userDataDir)
  let page = await browser.newPage()
  try {
    if (parentPort) {
      parentPort.once('message', async (message) => {
        if (message === 'exit') {
          if (page) await page.close()
          if (browser) await browser.close()
          parentPort?.postMessage('closed-browser')
        }
      })
    }
    const context = await browser.defaultBrowserContext()
    context.overridePermissions('https://outlook.live.com/', ['notifications'])
    await page.goto('https://login.live.com/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    })

    // socket.on('action-close', async (data) => {
    //   if ((data.type == 'all' && data.uid.includes(user.uid)) || data.type == 'loginHotmail') {
    //     await browser.close()
    //     return
    //   }
    // })
    // socket.emit('action-status', { uid: user.uid, message: '1007', type: 'success' })
    await timeout(1000)
    let url = await page.url()
    if (url.includes('login.live.com')) {
      await page.waitForSelector("input[type='email']")
      await page.type("input[type='email']", user.outlook)
      await timeout(300)
      await page.keyboard.press('Enter')
      await timeout(2000)
      await page.waitForSelector("input[type='password']")
      await page.type("input[type='password']", user.passOutlook)
      await timeout(3000)
      await page.keyboard.press('Enter')
      await timeout(1000)
      await page.keyboard.press('Enter')
      await timeout(1000)
      await page.keyboard.press('Enter')
    }

    await timeout(300)
    await page.close()
    page = await browser.newPage()
    await page.goto('https://login.live.com/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    })
    await timeout(1000)
    url = await page.url()
    if (url.includes('login.live.com')) {
      // socket.emit('action-status', { uid: user.id, message: '1004', type: 'error' })
    } else {
      // socket.emit('action-status', { uid: user.id, message: '1009', type: 'success' })
    }

    setTimeout(async () => {
      // socket.disconnect()
      // socket.close()
      await browser.close()
    }, 2000)
  } catch (error) {
    await browser.close()
    console.log(error)
  }
}
