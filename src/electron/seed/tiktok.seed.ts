import puppeteer from 'puppeteer-extra'

import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { launch, timeout } from '../libs/baseFunction'
import axios from 'axios'
import { IAccount } from '../model/userInfomation'
import { Page } from 'puppeteer'

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

export async function loginTikTok(page: Page, username: string, password: string) {
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
  let loginButton = await page.$$('button[data-e2e="login-button"]')
  if (loginButton.length) {
    await loginButton[0].click()
  } else {
    loginButton = await page.$$('button[type="submit"]')
    if (loginButton.length) {
      await loginButton[0].click()
    }
  }
  await page.waitForNavigation()
  const isPass = await checkAndByPassCaptchaIfNeeded(page)
  if (isPass) {
    return page
  }
  throw Error(`Unable to login TikTok with username: ${username}`)
}

export async function userSeedingVideo(
  user: IAccount,
  videoPath: string,
  headless: boolean,
  watchVideoTime: number[],
  description: string,
  userDataDir: string,
  position: string
): Promise<void> {
  if (!videoPath.startsWith('https://www.tiktok.com/')) {
    return
  }
  const browser = await launch(user, headless, position, userDataDir);
  const page = await browser.newPage()
  await page.goto(videoPath);
  const timeToWatch =
    Math.floor(Math.random() * (watchVideoTime[1] - watchVideoTime[0] + 1)) + watchVideoTime[0]
  await timeout(timeToWatch * 1000);
  await checkAndLoginTiktokIfNeeded(page, user.username, user.password);
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
      const title = await page.evaluate(() => {
        const titleElement = document.querySelector('div[data-e2e="browse-video-desc"]')
        return titleElement ? (titleElement as any).innerText.trim() : 'Không tìm thấy title!'
      })
      if (description) {
        commentData = await generateComment(description)
      } else {
        commentData = await generateComment(title)
      }
      if (commentInput) {
        await commentInput.click()
        await commentInput.type(commentData, { delay: 100 })
        await timeout(2000)
        const postButton = await page.waitForSelector('div[data-e2e="comment-post"]', {
          visible: true
        })
        if (postButton) {
          await postButton.click()
        }
      }
    }
    await timeout(3000)
    const quitButton = await page.$$('button[data-e2e="browse-close"]')
    await quitButton[0].click()
    await timeout(1000)
    await page.keyboard.press('ArrowDown')
    await timeout(2000)
  }
  await page.close()
  await browser.close()
}

// export async function checkAndLoginTiktokIfNeeded(page: Page | undefined, username: string, password: string) {
//   if (!page) {
//     const browser = await puppeteer.launch({
//       headless: false
//     })
//     page = await browser.newPage()
//     await page.goto('https://www.tiktok.com/@khinaocony_thidoiten')
//   }
//   await timeout(6000)
//   await byPassCaptcha(page);
//   const loginButton = await page.$$('button[id="header-login-button"]')
//   if (loginButton.length) {
//     await loginButton[loginButton.length - 1].click();
//     await timeout(1000)
//     await loginTikTok(page, username, password)
//   }
// }
export async function checkAndLoginTiktokIfNeeded(page: Page , username: string, password: string) {
  await checkAndByPassCaptchaIfNeeded(page);
  const loginButton = await page.$$('button[id="header-login-button"]')
  if (loginButton.length) {
    await loginButton[loginButton.length - 1].click();
    await timeout(1000)
    await loginTikTok(page, username, password)
  }
}

async function checkAndByPassCaptchaIfNeeded(page: Page): Promise<boolean> {
  const audioCaptcha = await page.$$('button[id="captcha_switch_button"]')
  if (audioCaptcha.length) {
    await timeout(1000)
    await audioCaptcha[0].click()
    await timeout(1000)
    const src = await page.$eval('img', (img: HTMLImageElement) => img.src)
    await timeout(1000)
    if (!src) {
      console.error('cant get src of captcha audio')
      return false
    }
    const captcha = await convertAudioToText(src)
    const frames = await page.frames()
    const frame = frames[0]
    await frame.waitForSelector('input[type="text"]')
    await frame.type('input[type="text"]', captcha, { delay: 100 })
    await timeout(2000)
  }
  return true
}

async function followTiktok(
  user: IAccount,
  account_id: string,
  headless: boolean,
  watchVideoTime: number[],
  userDataDir: string,
  position: string
) {
  const browser = await launch(user, headless, position, userDataDir)
  const page = await browser.newPage();
  await page.goto('https://www.tiktok.com/' + account_id);
  await timeout(2000);
  await checkAndLoginTiktokIfNeeded(page, user.username, user.password);
  const timeToWatch =
    Math.floor(Math.random() * (watchVideoTime[1] - watchVideoTime[0] + 1)) + watchVideoTime[0]
  const videos = await page.$$('div[data-e2e="user-post-item"]')
  if (videos.length) {
    const length = Math.min(videos.length, 2)
    for (let i = 0; i < length; i++) {
      await videos[i].click()
      await timeout(timeToWatch)
      const likeButtons = await page.$$('span[data-e2e="browse-like-icon"]')
      if (likeButtons.length) {
        await likeButtons[0].click()
      }
      await timeout(2000)
      const quitButton = await page.$$('button[data-e2e="browse-close"]')
      if (quitButton.length) {
        await quitButton[0].click()
      }
      await timeout(1000)
    }
  }
  await timeout(2000)
  const followButtons = await page.$$('button[data-e2e="follow-button"]')
  if (followButtons.length) {
    await followButtons[0].click()
  }
  await page.close()
  await browser.close()
}

export async function buffFollows(
  users: IAccount[],
  data: any,
  userDataDir: string,
  headless: boolean
) {
  const idLists = data.idLists
    .split('\n')
    .filter((i: string) => i)
    .map((x: string) => (x.includes('@') ? x : '@' + x))
  for (let index = 0; index < idLists.length; index++) {
    const id = idLists[index]
    const length = users.length / data.numberOfStreams
    for (let i = 0; i < length; i++) {
      await Promise.all(
        Array.from({ length: data.numberOfStreams }).map(async (j, k) => {
          const userIndex = i * data.numberOfStreams + k
          const pX = (k % 5) * 360
          const pY = (Math.floor(k / 5) % 3) * 360
          return await followTiktok(
            users[userIndex],
            id,
            headless,
            data.watchVideoTime,
            userDataDir,
            `--window-position=${pX},${pY}`
          )
        })
      )
    }
    await timeout(5000)
  }
}

export async function seedingVideo(
  users: IAccount[],
  userDataDir: string,
  data: any,
  headless: boolean
) {
  const length = users.length / data.numberOfStreams
  const listPath = data.idLists.split('\n').filter((i: string) => i)
  let pathIndex = 0
  for (let i = 0; i < length; i++) {
    await Promise.all(
      Array.from({ length: data.numberOfStreams }).map(async (j, k) => {
        pathIndex = i * data.numberOfStreams + k
        const userIndex = i * data.numberOfStreams + k
        if (!listPath[pathIndex]) {
          pathIndex = 0
        }
        const subPath = listPath[pathIndex].split('|')
        const pX = (k % 5) * 360
        const pY = (Math.floor(k / 5) % 3) * 360
        return await userSeedingVideo(
          data.users[userIndex],
          subPath[0],
          headless,
          data.watchVideoTime,
          subPath[1],
          userDataDir,
          `--window-position=${pX},${pY}`
        )
      })
    )
  }
}

async function generateComment(title: string): Promise<string> {
  const response = await axios.post(
    'http://155.159.255.140:3000/api/common/comment/generate',
    {
      title: title
    },
    {
      headers: {
        'internal-api-key': '123123' // todo: imp this
      }
    }
  )
  return response.data?.data
}

async function convertAudioToText(url: string): Promise<string> {
  const response = await axios.post(
    'http://155.159.255.140:3000/api/common/comment/generate',
    {
      url: url
    },
    {
      headers: {
        'internal-api-key': '123123' // todo: imp this
      }
    }
  )
  return response.data?.data
}
