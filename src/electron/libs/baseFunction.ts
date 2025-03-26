import { join } from 'path'
import puppeteer from 'puppeteer-extra'

import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { IAccount } from '../model/userInfomation'
const stealthPlugin = StealthPlugin()
stealthPlugin.enabledEvasions.delete('iframe.contentWindow')
stealthPlugin.enabledEvasions.delete('media.codecs')
puppeteer.use(stealthPlugin)

export const timeout = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function launch(
  user: IAccount,
  headless: boolean,
  position: string,
  userDataDir: string,
) {
  let proxyURL = ''
  let proxyUsername = ''
  let proxyPassword = ''
  if (user.proxy) {
    const proxyList = user.proxy
      .replace('http://', '')
      .split('@')
      .map((x) => x.trim())
    if (proxyList.length == 2) {
      proxyURL = 'http://' + proxyList.slice(1).join(':')
      proxyUsername = proxyList[0].split(':')[0]
      proxyPassword = proxyList[1].split(':')[1]
    }
  }

  const params = {
    headless,
    // executablePath: join(userDataDir, 'chrome.exe'),
    defaultViewport: {
      width: 1400,
      height: 900,
    },
    args: [
      '--window-size=360,500',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      position,
    ],
    userDataDir: join(userDataDir, 'browser-data', user.id),
  }
  if (proxyURL) {
    params.args.push(`--proxy-server=${proxyURL}`)
  }

  const browser = await puppeteer.launch(params)
  if (proxyURL && proxyUsername && proxyPassword) {
    const page = await browser.newPage()
    await page.authenticate({
      username: proxyUsername,
      password: proxyPassword,
    })
    await page.goto('https://google.com')
    await page.close()
  }
  return browser
}
