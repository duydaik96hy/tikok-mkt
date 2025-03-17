
export async function tikokCron(): Promise<void> {
  const users: string[] = ['user1'];
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const puppeteer = require('puppeteer-extra')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const StealthPlugin = require('puppeteer-extra-plugin-stealth')
  puppeteer.use(StealthPlugin())
  const stealthPlugin = StealthPlugin()
  stealthPlugin.enabledEvasions.delete('iframe.contentWindow')
  stealthPlugin.enabledEvasions.delete('media.codecs')
  puppeteer.use(stealthPlugin)
  for(const user of users) {
    const browser = await puppeteer.launch({
      headless: false,
      userDataDir: process.cwd() + '/public/'+ user
    })
    const page = await browser.newPage();
    await page.goto('https://www.tiktok.com/', { waitUntil: 'domcontentloaded', timeout: 0 });
  }
}
