import puppeteer from 'puppeteer-extra'

import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { launch, timeout } from '../libs/baseFunction'
import axios from 'axios'
import { IAccount } from '../model/userInfomation'
import { parentPort } from 'worker_threads'
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
//

export async function userLoginTikTok(
  user: IAccount,
  headless: boolean,
  userDataDir: string,
  position: string,
) {
  const browser = await launch(user, headless, position, userDataDir)
  const page = await browser.newPage()
  if (parentPort) {
    parentPort.once('message', async (message) => {
      if (message === 'exit') {
        if (page) await page.close()
        if (browser) await browser.close()
        parentPort?.postMessage('closed-browser')
      }
    })
  }
  await timeout(1000)
  try {
    await page.goto('https://www.tiktok.com/login', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    })

    await timeout(1000)
    const url = await page.url()
    if (!url.includes('login')) {
      console.log('login')
      // await page.close()
      // await browser.close()
      return
    }
    await page.waitForSelector('[data-e2e="channel-item"]', { visible: true })
    const buttons = await page.$$('[data-e2e="channel-item"]')
    await buttons[1].click()
    await timeout(1000)
    await page.click('a[href="/login/phone-or-email/email"]')
    await timeout(1000)

    const frames = await page.frames()
    const frame = frames[0]
    await frame.waitForSelector('input[type="text"]')
    await frame.type('input[type="text"]', user.username, { delay: 100 })
    await timeout(500)
    await frame.waitForSelector('input[type="password"]')
    await frame.type('input[type="password"]', user.password, { delay: 100 })

    await frame.waitForSelector('button[type="submit"]')
    await frame.click('button[type="submit"]')
    //TODO: bypass captcha
    await page.waitForNavigation()
    await timeout(3000)
    let loginButton = await page.$$('button[data-e2e="login-button"]')
    if (loginButton.length) {
      await loginButton[0].click()
    } else {
      loginButton = await page.$$('button[type="submit"]')
      if (loginButton.length) {
        await loginButton[0].click()
      }
    }
    await timeout(2000)
    const isPass = await checkAndByPassCaptchaIfNeeded(page)

    if (isPass) {
      await page.close()
      await browser.close()
    }
    throw Error(`Unable to login TikTok with username: ${user.username}`)
  } catch (error) {
    console.log(error)
  }
}

export async function userSeedingVideo(
  user: IAccount,
  videoPath: string,
  headless: boolean,
  viewVideoTime: number[],
  description: string,
  userDataDir: string,
  position: string,
  viewLiveTime: number[] = [10, 100],
): Promise<void> {
  if (!videoPath.startsWith('https://www.tiktok.com/')) {
    return
  }
  if (parentPort) {
    parentPort.once('message', async (message) => {
      if (message === 'exit') {
        if (page) await page.close()
        if (browser) await browser.close()
        parentPort?.postMessage('closed-browser')
      }
    })
  }
  const browser = await launch(user, headless, position, userDataDir)
  const page = await browser.newPage()
  await page.goto(videoPath)
  const timeToWatch =
    Math.floor(Math.random() * (viewVideoTime[1] - viewVideoTime[0] + 1)) + viewVideoTime[0]
  if (videoPath.includes('/live')) {
    const eles = await page.$$(
      '#tiktok-live-main-container-id > div:nth-child(3) > div > div > div > div > div > div > div > div > div',
    )

    // viewLiveTime
  } else {
    await timeout(1000)
    // await checkAndLoginTiktokIfNeeded(page, user, headless, userDataDir, position)
    if (Math.random() < 0.65) {
      await page.waitForSelector('span[data-e2e="like-icon"]', { visible: true, timeout: 5000 })

      const likeButtons = await page.$('span[data-e2e="like-icon"]')
      if (likeButtons) {
        await likeButtons.click()
      }
    }
    if (Math.random() < 0.5) {
      const commentButtons = await page.$('span[data-e2e="comment-icon"]')
      if (commentButtons) {
        await commentButtons.click()
        await timeout(1000)
        const commentInput = await page.waitForSelector('div[data-e2e="comment-text"]', {
          visible: true,
          timeout: 10000,
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
            visible: true,
          })
          if (postButton) {
            await postButton.click()
          }
        }
      }
    }
    await timeout(timeToWatch * 1000)
    await timeout(3000)
  }

  const quitButton = await page.$$('button[data-e2e="browse-close"]')
  await quitButton[0].click()
  await timeout(1000)
  await page.keyboard.press('ArrowDown')
  await timeout(2000)
  await page.close()
  await browser.close()
}

// export async function isLoginTiktok(page: Page | undefined, username: string, password: string) {
//   if (!page) {
//     const browser = await puppeteer.launch({
//       headless: false
//     })
//     page = await browser.newPage()
//     await page.goto('https://www.tiktok.com/@khinaocony_thidoiten')
//   }
//   await timeout(6000)
//   await checkAndByPassCaptchaIfNeeded(page);
//   const loginButton = await page.$$('button[id="header-login-button"]')
//   if (loginButton.length) {
//     await loginButton[loginButton.length - 1].click();
//     await timeout(1000)
//     await loginTikTok(page, username, password)
//   }
// }
export async function checkAndLoginTiktokIfNeeded(
  page: Page,
  user: IAccount,
  headless: boolean,
  userDataDir: string,
  position: string,
) {
  await checkAndByPassCaptchaIfNeeded(page)
  const loginButton = await page.$$('button[id="header-login-button"]')
  if (loginButton.length) {
    await loginButton[loginButton.length - 1].click()
    await timeout(1000)
    await userLoginTikTok(user, headless, userDataDir, position)
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
    await page.waitForNavigation()
  }
  return true
}

async function followTiktok(
  user: IAccount,
  account_id: string,
  headless: boolean,
  viewVideoTime: number[],
  followAfterWatch: number[],
  userDataDir: string,
  position: string,
) {
  const browser = await launch(user, headless, position, userDataDir)
  const page = await browser.newPage()
  if (parentPort) {
    parentPort.once('message', async (message) => {
      if (message === 'exit') {
        if (page) await page.close()
        if (browser) await browser.close()
        parentPort?.postMessage('closed-browser')
      }
    })
  }
  await page.goto('https://www.tiktok.com/' + account_id)
  await timeout(2000)
  // await checkAndLoginTiktokIfNeeded(page, user, headless, userDataDir, position)
  const randomWatch =
    Math.floor(Math.random() * (followAfterWatch[1] - followAfterWatch[0] + 1)) +
    followAfterWatch[0]
  const videos = await page.$$('div[data-e2e="user-post-item"]')
  if (videos.length) {
    const length = Math.min(videos.length, randomWatch)
    for (let i = 0; i < length; i++) {
      const timeToWatch =
        Math.floor(Math.random() * (viewVideoTime[1] - viewVideoTime[0] + 1)) + viewVideoTime[0]
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
    }
  }
  await timeout(1000)
  const followButtons = await page.$('button[data-e2e="follow-button"]')
  if (followButtons && Math.random() < 0.7) {
    await followButtons.click()
  }
  await timeout(3000)
  await page.close()
  await browser.close()
}

export async function buffFollows(
  users: IAccount[],
  data: any,
  userDataDir: string,
  headless: boolean,
) {
  console.log(data)
  if (!data.idLists) return
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
          const pY = (Math.floor(k / 5) % 3) * 500
          return await followTiktok(
            users[userIndex],
            id,
            headless,
            data.viewVideoTime,
            data.followAfterWatch,
            userDataDir,
            `--window-position=${pX},${pY}`,
          )
        }),
      )
    }
    await timeout(5000)
  }
}

export async function seedingVideo(
  users: IAccount[],
  userDataDir: string,
  data: any,
  headless: boolean,
) {
  const length = users.length / data.numberOfStreams
  const listPath = data.idLists.split('\n').filter((i: string) => i)
  let pathIndex = 0
  for (let i = 0; i < length; i++) {
    try {
      await Promise.all(
        Array.from({ length: data.numberOfStreams }).map(async (j, k) => {
          pathIndex = i * data.numberOfStreams + k
          const userIndex = i * data.numberOfStreams + k
          if (!users[userIndex]) return
          if (!listPath[pathIndex]) {
            pathIndex = 0
          }
          const subPath = listPath[pathIndex].split('|')
          const pX = (k % 5) * 360
          const pY = (Math.floor(k / 5) % 3) * 500
          return await userSeedingVideo(
            users[userIndex],
            subPath[0],
            headless,
            data.viewVideoTime,
            subPath[1],
            userDataDir,
            `--window-position=${pX},${pY}`,
          )
        }),
      )
    } catch (error) {
      console.log(error)
    }
  }
}

export async function loginTikTok(users: Array<IAccount>, userDataDir: string, headless: boolean) {
  const length = users.length / 10
  for (let i = 0; i < length; i++) {
    await Promise.all(
      Array.from({ length: 10 }).map(async (j, k) => {
        const pX = (k % 5) * 360
        const pY = (Math.floor(k / 5) % 3) * 500
        const userIndex = i * 10 + k
        if (users[userIndex]) {
          return await userLoginTikTok(
            users[userIndex],
            headless,
            userDataDir,
            `--window-position=${pX},${pY}`,
          )
        }
      }),
    )
  }
}

async function generateComment(title: string): Promise<string> {
  const response = await axios.post(
    'http://155.159.255.140:3000/api/common/comment/generate',
    {
      title: title,
    },
    {
      headers: {
        'x-api-key': process.env.INTERNAL_API_KEY,
      },
    },
  )
  return response.data?.data
}

async function convertAudioToText(url: string): Promise<string> {
  const response = await axios.post(
    'http://155.159.255.140:3000/api/common/audio/convert-text',
    {
      url: url,
    },
    {
      headers: {
        'x-api-key': process.env.INTERNAL_API_KEY,
      },
    },
  )
  return response.data?.data
}
