import puppeteer from 'puppeteer-extra'

import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { timeout } from '../libs/baseFunction'
import axios from 'axios'

const stealthPlugin = StealthPlugin()
stealthPlugin.enabledEvasions.delete('iframe.contentWindow')
stealthPlugin.enabledEvasions.delete('media.codecs')
puppeteer.use(stealthPlugin)
// const user: IAccount = {
//   id: 'user1',
//   name: 'thangthuy723',
//   username: 'thangthuy723',
//   password: 'DieuThuy1108@',
//   email: 'anhbtn1324@dhcnhn.edu.vn',
//   passEmail: 'thangtrinh221199',
//   emailRecover: 'winwinthangtrinh@gmail.com',
//   pwdEmailRecover: 'franklampard',
//   folder: 'user1'
// }

export async function loginTikTok(
  username: string,
  password: string
) {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: process.cwd() + '/src/electron/data/browser-data/' + username
  })
  const page = await browser.newPage()
  await page.goto('https://www.tiktok.com/login')

  await timeout(1000)
  await page.waitForSelector('[data-e2e="channel-item"]', { visible: true })
  const buttons = await page.$$('[data-e2e="channel-item"]')
  await buttons[1].click()
  await timeout(1000)
  await page.click('a[href="/login/phone-or-email/email"]')
  await timeout(1000)


  const frames = await page.frames()
  const frame = frames[0]
  await frame.waitForSelector('input[type="text"]')
  await frame.type('input[type="text"]', username, { delay: 100 })
  await timeout(1000)
  await frame.waitForSelector('input[type="password"]')
  await frame.type('input[type="password"]', password, { delay: 100 })

  await frame.waitForSelector('button[type="submit"]')
  await frame.click('button[type="submit"]')
  //TODO: bypass captcha
  await page.waitForNavigation()
  return page

}

export async function launchTikTok(username: string, videoPath: string, watchVideoSecond: number[], title: string): Promise<void> {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: process.cwd() + '/src/electron/data/browser-data/' + username
  })
  const page = await browser.newPage()
  await page.goto('https://www.tiktok.com/' + videoPath)
  const timeToWatch=  Math.floor(Math.random() * (watchVideoSecond[1] - watchVideoSecond[0] + 1)) + watchVideoSecond[0];
  await timeout(timeToWatch*1000);
  await page.waitForSelector('span[data-e2e="like-icon"]', { visible: true, timeout: 10000 })
  for (let i = 0; i < 4; i++) {
    const likeButtons = await page.$$('span[data-e2e="like-icon"]')
    if (likeButtons.length) {
      await likeButtons[i].click()
    }
    await timeout(1000)
    const commentButtons = await page.$$('span[data-e2e="comment-icon"]')
    if (commentButtons.length) {
      await commentButtons[i].click()
      await timeout(1000)
      const commentInput = await page.waitForSelector('div[data-e2e="comment-text"]', {
        visible: true,
        timeout: 10000
      })
      let commentData = 'Hello!'
      if (title) {
        commentData = await generateComment(title)
      }
      if (commentInput) {
        await commentInput.click()
        await commentInput.type(commentData, { delay: 100 })
        await timeout(2000)
        const postButton = await page.waitForSelector('div[data-e2e="comment-post"]', { visible: true })
        if (postButton) {
          await postButton.click();
        }
      }
    }
    await timeout(3000)
    const quitButton = await page.$$('button[data-e2e="browse-close"]')
    await quitButton[0].click()
    await timeout(1000)
    await page.keyboard.press('ArrowDown')
    await timeout(2000);
  }
}

async function generateComment(title: string): Promise<string> {
  const response = await axios.post('http://155.159.255.140:3000/api/common/comment/generate', {
    title: title
  }, {
    headers: {
      'internal-api-key': '123123' // todo: imp this
    }
  })
  return response.data?.data
}
