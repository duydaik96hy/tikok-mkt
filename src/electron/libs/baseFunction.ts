import { join } from 'path'
import puppeteer from 'puppeteer-extra'

import StealthPlugin from 'puppeteer-extra-plugin-stealth'
const stealthPlugin = StealthPlugin()
stealthPlugin.enabledEvasions.delete('iframe.contentWindow')
stealthPlugin.enabledEvasions.delete('media.codecs')
puppeteer.use(stealthPlugin)

export async function lauch(
  proxy: string,
  userid: string,
  headless: boolean,
  position: string,
  userDataDir: string,
) {
  let proxyURL = ''
  let proxyUsername = ''
  let proxyPassword = ''
  if (proxy) {
    const proxyList = proxy
      .replace('http://', '')
      .split(':')
      .map((x) => x.trim())
    if (proxyList.length == 4) {
      proxyURL = 'http://' + proxyList.slice(0, 2).join(':')
      proxyUsername = proxyList[2]
      proxyPassword = proxyList[3]
    }
  }

  const params = {
    headless,
    executablePath: join(userDataDir, 'chrome.exe'),
    defaultViewport: {
      width: 1920,
      height: 980,
    },
    args: [
      '--window-size=360,360',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      position,
    ],
    userDataDir: join(userDataDir, 'browser-data', userid),
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
