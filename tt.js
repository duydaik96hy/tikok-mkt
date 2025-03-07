// npm install puppeteer

import puppeteer from 'puppeteer-extra'

import StealthPlugin from 'puppeteer-extra-plugin-stealth'
const stealthPlugin = StealthPlugin()
stealthPlugin.enabledEvasions.delete('iframe.contentWindow')
stealthPlugin.enabledEvasions.delete('media.codecs')
puppeteer.use(stealthPlugin)

const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const scraper = async () => {
  // authenticated proxy server info
  // 103.90.230.208:51639:proxymart51639:facebook99123
  const btUrl = 'https://www.tiktok.com/'

  // launch a browser instance with the

  // --proxy-server flag enabled

  const browser = await puppeteer.launch({
    headless: false,
    timeout: 150000000,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    defaultViewport: {
      width: 1400,
      height: 900,
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    ],
    userDataDir: `D:/test/data/test4`,
  })
  const page = await browser.newPage()
  const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
  await page.setUserAgent(userAgent)
  await timeout(200)
  await page.goto(btUrl, {
    waitUntil: 'networkidle2',
    timeout: 300000,
  })
  await timeout(1000)
  const needLogin = await page.evaluate(() => {
    const loginBtn = document.querySelector('#header-login-button')
    return loginBtn
  })
  if (needLogin) {
    await page.click('#header-login-button')
    await timeout(2000)
    await page.waitForSelector('#loginContainer')
    await timeout(1000)
    await page.click(
      '#loginContainer > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div',
    )
    await timeout(1000)
    await page.click('#login-modal > div:nth-child(1) > div:nth-child(2) >a')
    await timeout(1000)
    await page.keyboard.press('Tab')
    await timeout(300)
    await page.keyboard.press('Enter')
    await timeout(300)

    const month = Math.floor(Math.random() * 12) + 1
    for (let index = 1; index < month; index++) {
      await page.keyboard.press('ArrowDown')
      await timeout(300)
    }

    await page.keyboard.press('Enter')
    await timeout(300)
    await page.keyboard.press('Tab')
    await timeout(300)
    await page.keyboard.press('Tab')
    await timeout(300)
    await page.keyboard.press('Tab')
    await timeout(300)
    await page.keyboard.press('Tab')
    await timeout(300)
    // #login-modal > div:nth-child(1) > div:nth-child(2) >a
    // #loginContainer > div:nth-child(3) > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) --- select user email
    // #loginContainer form input[name='email']
  } else {
    console.log('da dang nhap')
  }
  // #loginContainer > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div
  //   const url = await page.url();
  //   console.log(url);
}

scraper()
